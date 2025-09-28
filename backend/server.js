const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

// --------------------- Backend server only ---------------------
// We do NOT serve frontend UI from backend deployment
// Frontend is hosted separately, backend only handles API/Socket.IO

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://live-polling-system-frontend-6kur.onrender.com", // frontend URL
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

// --------------------- Socket.IO logic ---------------------
let currentQuestion = null;
const connectedStudents = new Map();

io.on("connection", (socket) => {

  // Teacher sends a new question
  socket.on("teacher-ask-question", (questionData) => {
    const question = {
      question: questionData.question,
      options: questionData.options,
      optionsFrequency: {},
      results: {},
      answered: false,
      timer: questionData.timer || 60,
    };

    question.options.forEach((option) => {
      question.optionsFrequency[option] = 0;
      question.results[option] = 0;
    });

    currentQuestion = question;

    // Send question to all connected students
    io.emit("new-question", question);

    // Auto-compute results after timer expires
    setTimeout(() => {
      if (!currentQuestion.answered) {
        const totalResponses = Object.values(currentQuestion.optionsFrequency).reduce((a, b) => a + b, 0) || 1;
        Object.keys(currentQuestion.optionsFrequency).forEach((option) => {
          currentQuestion.results[option] =
            (currentQuestion.optionsFrequency[option] / totalResponses) * 100;
        });
        currentQuestion.answered = true;
        io.emit("polling-results", currentQuestion.results);
      }
    }, question.timer * 1000);
  });

  // Student submits an answer
  socket.on("handle-polling", ({ option }) => {
    if (currentQuestion && currentQuestion.options.includes(option)) {
      currentQuestion.optionsFrequency[option] += 1;

      const totalResponses = Object.values(currentQuestion.optionsFrequency).reduce((a, b) => a + b, 0) || 1;

      Object.keys(currentQuestion.optionsFrequency).forEach((opt) => {
        currentQuestion.results[opt] =
          (currentQuestion.optionsFrequency[opt] / totalResponses) * 100;
      });

      const student = connectedStudents.get(socket.id);
      if (student) {
        student.voted = true;
        connectedStudents.set(socket.id, student);
        io.emit("student-vote-validation", [...connectedStudents.values()]);
      }

      io.emit("polling-results", currentQuestion.results);
    }
  });

  // Student sets their name
  socket.on("student-set-name", ({ name }) => {
    if (!name) return;
    const student = {
      name,
      socketId: socket.id,
      voted: false,
    };
    connectedStudents.set(socket.id, student);
    console.log(`Student ${name} connected`);
    io.emit("student-connected", Array.from(connectedStudents.values()));

    // If a question is active, send it immediately to the new student
    if (currentQuestion) {
      socket.emit("new-question", currentQuestion);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
    connectedStudents.delete(socket.id);
    io.emit("student-disconnected", Array.from(connectedStudents.values()));
  });
});
