const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

// Simple route to show backend is running
app.get("/", (req, res) => {
  res.send("Backend is running. Socket server is ready.");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://live-polling-system-frontend-6kur.onrender.com", // your frontend URL
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// --- Polling logic ---
let currentQuestion = null;
const connectedStudents = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

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

    io.emit("new-question", question);

    // Auto-compute results after timer
    setTimeout(() => {
      if (!currentQuestion.answered) {
        const totalResponses =
          Object.values(currentQuestion.optionsFrequency).reduce((a, b) => a + b, 0) || 1;
        Object.keys(currentQuestion.optionsFrequency).forEach((option) => {
          currentQuestion.results[option] =
            (currentQuestion.optionsFrequency[option] / totalResponses) * 100;
        });
        currentQuestion.answered = true;
        io.emit("polling-results", currentQuestion.results);
      }
    }, question.timer * 1000);
  });

  socket.on("handle-polling", ({ option }) => {
    if (currentQuestion && currentQuestion.options.includes(option)) {
      currentQuestion.optionsFrequency[option] += 1;

      const totalResponses =
        Object.values(currentQuestion.optionsFrequency).reduce((a, b) => a + b, 0) || 1;

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

  socket.on("student-set-name", ({ name }) => {
    if (!name) return;
    const student = {
      name,
      socketId: socket.id,
      voted: false,
    };
    connectedStudents.set(socket.id, student);
    console.log(`Student connected: ${name}`);
    io.emit("student-connected", Array.from(connectedStudents.values()));

    // If a question is active, send it immediately to the new student
    if (currentQuestion) {
      socket.emit("new-question", currentQuestion);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    connectedStudents.delete(socket.id);
    io.emit("student-disconnected", Array.from(connectedStudents.values()));
  });
});
