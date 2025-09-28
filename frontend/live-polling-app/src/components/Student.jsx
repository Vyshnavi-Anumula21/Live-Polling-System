import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar, Button } from "react-bootstrap";
import tower from "../assets/tower-icon.png";

import { getVariant } from "../utils/util";

const Student = ({ socket }) => {
  const [name, setName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [connectedStudents, setConnectedStudents] = useState(null);
  const [votingValidation, setVotingValidation] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("studentName");

    if (name) {
      setName(name);
      setShowQuestion(true);
      socket.emit("student-set-name", { name });
    }

    const handleNewQuestion = (question) => {
      setCurrentQuestion(question);
      setShowQuestion(true);
      setSelectedOption("");

      setTimeout(() => {
        setShowQuestion(false);
      }, question.timer * 1000); // Convert seconds to milliseconds
    };

    const handleStudentVoteValidation = (connectedStudents) => {
      setConnectedStudents(connectedStudents);
    };

    socket.on("new-question", handleNewQuestion);
    socket.on("student-vote-validation", handleStudentVoteValidation);

    return () => {
      socket.off("new-question", handleNewQuestion);
      socket.off("student-vote-validation", handleStudentVoteValidation);
    };
  }, [socket]);

  const handleSubmit = () => {
    localStorage.setItem("studentName", name);
    socket.emit("student-set-name", { name });
    setShowQuestion(true);
  };

  const handlePoling = () => {
    socket.emit("handle-polling", {
      option: selectedOption,
    });
  };

  useEffect(() => {
    const found = connectedStudents
      ? connectedStudents?.find((data) => data.socketId === socket.id)
      : undefined;
    if (found) {
      setVotingValidation(found.voted);
    }
  }, [connectedStudents]);

  return (
    <div
     className="flex justify-center w-full h-[100] p-40"
    >
      {showQuestion && name ? (
        <div
          className="w-full border border-[#6edff6] bg-[#134652]"
        >
          <h1 className="text-center text-3xl font-bold">Welcome, {name}</h1>
          {currentQuestion ? (
            currentQuestion.answered == false || votingValidation == false ? (
              <div
                className="gap-y-4 gap-x-4 border-t border-[#6edff6] ml-0 md:ml-4 p-12"
              >
                <h2 className="text-xl font-bold ">Question: {currentQuestion.question}</h2>
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex hover:bg-gray-300 hover:text-black ${selectedOption === option ? 'border-2 border-green-500' : 'border border-[#6edff6]'} justify-between my-4 h-6 p-4 cursor-pointer items-center rounded-md`}
                    onClick={() => setSelectedOption(option)}
                  >
                    {option}
                  </div>
                ))}
                <Button
                  className="h-10 bg-green-600 w-1/5 rounded-lg font-semibold"
                  variant="primary"
                  onClick={handlePoling}
                  disabled={!selectedOption}
                >
                  Submit
                </Button>
              </div>
            ) : (
              <div
                className="mt-12 mb-12 border border-[#6edff6] bg-[#134652]"
              >
                <h2
                  className="text-center items-center font-bold text-xl flex justify-center m-3"
                >
                  <img
                    src={tower}
                    alt=""
                    width="20px"
                    height="20px"
                    className="mr-5"
                  />
                  Live Results
                </h2>
                <ul
                  className="gap-y-4 gap-x-4 border-t border-[#6edff6] w-full"
                >
                  {currentQuestion &&
                    Object.entries(currentQuestion.optionsFrequency).map(
                      ([option]) => (
                        <div
                          className="m-4"
                        >
                          <ProgressBar
                            now={
                              parseInt(currentQuestion.results[option]) ?? "0"
                            }
                            label={<span className="text-xl text-black font-semibold">{option}              {parseInt(
                              currentQuestion.results[option]
                            )}%</span>}
                            variant={getVariant(
                              parseInt(currentQuestion.results[option])
                            )}
                            animated={
                              getVariant(
                                parseInt(currentQuestion.results[option])
                              ) != "success"
                            }
                          />
                        </div>
                      )
                    )}
                </ul>
              </div>
            )
          ) : (
            <h1 className="item-center justify-center flex font-bold text-xl m-20">Waiting for question...</h1>
          )}
        </div>
      ) : (
        <div
          className="flex w-full justify-center flex-col items-center gap-y-4"
        >
          <h2 className="text-2xl font-bold">Enter your name to participate in the contest</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="w-[45%] h-10 p-2.5 border border-[#0dcaf0] rounded-md bg-[#2a444a] outline-none text-white"
          />
          <Button className="bg-blue-600 h-10 w-1/5 rounded-lg font-semibold" variant="info" size="lg" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default Student;