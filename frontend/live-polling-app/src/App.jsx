import React, { useState } from "react";
import io from "socket.io-client";
import "../src/App.css";

import Teacher from "./components/Teacher";
import Student from "./components/Student";

const socket = io.connect("https://live-polling-app.onrender.com/");
//const socket = io("http://localhost:3001");


const App = () => {
  const [isTeacher, setIsTeacher] = useState(null);

  const handleRoleSelection = (role) => {
    setIsTeacher(role === "teacher");
  };

  return (
    <div
      className="flex h-screen justify-center items-center bg-[#032830] text-white"
    >
      {isTeacher === null ? (
        <div
          className="flex flex-col justify-center items-center w-full"
        >
          <h1 className="text-4xl font-bold">Select what type of user you are?</h1>
          <div
            className="flex justify-between w-1/2  p-2 mt-10"
          >
            <button
              onClick={() => handleRoleSelection("teacher")}
              className="parentAndStudentButton font-bold bg-blue-50 text-black h-10 w-1/3"
            >
              I am a Teacher
            </button>
            <button
              onClick={() => handleRoleSelection("student")}
              className="parentAndStudentButton font-bold  bg-blue-50 text-black h-10 w-1/3 "
            >
              I am a Student
            </button>
          </div>
        </div>
      ) : isTeacher ? (
        <Teacher socket={socket} />
      ) : (
        <Student socket={socket} />
      )}
    </div>
  );
};

export default App;