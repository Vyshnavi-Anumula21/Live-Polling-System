import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import { getVariant } from "../utils/util";
import tower from "../assets/tower-icon.png";

const PollingResult = ({ socket }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Handle new question
  const handleNewQuestion = (question) => {
    setCurrentQuestion(question);
  };

  // Handle polling results update
  const handlePollingResults = (results) => {
    setCurrentQuestion((prev) =>
      prev ? { ...prev, results, answered: true } : prev
    );
  };

  useEffect(() => {
    socket.on("new-question", handleNewQuestion);
    socket.on("polling-results", handlePollingResults);

    return () => {
      socket.off("new-question", handleNewQuestion);
      socket.off("polling-results", handlePollingResults);
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
          Object.entries(currentQuestion.results || {}).map(([option, value]) => (
            <div key={option} className="m-4">
              <ProgressBar
                now={parseInt(value) ?? 0}
                label={
                  <span className="text-xl text-black font-semibold">
                    {option} {parseInt(value)}%
                  </span>
                }
                variant={getVariant(parseInt(value))}
                animated={getVariant(parseInt(value)) !== "success"}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default PollingResult;
