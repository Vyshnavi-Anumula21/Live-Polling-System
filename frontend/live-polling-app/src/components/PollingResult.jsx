import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import { getVariant } from "../utils/util";

import tower from "../assets/tower-icon.png";

const PollingResult = ({ socket }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const handleNewQuestion = (question) => {
    // Ensure results object exists
    if (!question.results) {
      question.results = {};
      question.options.forEach((option) => {
        question.results[option] = 0;
      });
    }
    setCurrentQuestion(question);
  };

  useEffect(() => {
    socket.on("new-question", handleNewQuestion);

    return () => {
      socket.off("new-question", handleNewQuestion);
    };
  }, [socket]);

  return (
    <div className="border border-[#6edff6] bg-[#134652] mb-12">
      <h2 className="text-center flex justify-center font-bold text-3xl items-center">
        <img src={tower} alt="" width="20px" height="20px" className="mr-5" />
        Live Results
      </h2>
      <div className="gap-y-4 gap-x-4 border-t border-[#6edff6] w-full">
        {currentQuestion &&
          currentQuestion.options.map((option) => (
            <div key={option} className="m-4">
              <ProgressBar
                now={parseInt(currentQuestion.results[option] ?? 0)}
                label={
                  <span className="text-xl text-black font-semibold">
                    {option} {parseInt(currentQuestion.results[option] ?? 0)}%
                  </span>
                }
                variant={getVariant(parseInt(currentQuestion.results[option] ?? 0))}
                animated={getVariant(parseInt(currentQuestion.results[option] ?? 0)) !== "success"}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default PollingResult;
