import React, { useState } from "react";
import PollingResult from "./PollingResult";
import { Button } from "react-bootstrap";

const Teacher = ({ socket }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([""]);
  const [questionPublished, setQuestionPublished] = useState(false);
  const [timer, setTimer] = useState(60); // Default timer value

  const askQuestion = () => {
    const questionData = {
      question,
      options: options.filter((option) => option.trim() !== ""),
      timer,
    };

    if (socket && question && questionData.options.length) {
      socket.emit("teacher-ask-question", questionData);
      setQuestionPublished(true);
    }
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const askAnotherQuestion = () => {
    setQuestionPublished(false);
    setQuestion("");
    setOptions([""]);
    setTimer(60)
  };

  return (
    <div
      className="w-[60%] h-[80vh] text-white"
    >
      <h1 className="text-3xl font-bold mb-5">Teacher Interface</h1>
      {questionPublished ? (
        <>
          <PollingResult socket={socket} />
          <Button className="bg-green-600 rounded-lg h-10 w-1/4 font-semibold" variant="primary" onClick={askAnotherQuestion}>
            Ask Another Question ?
          </Button>
        </>
      ) : (
        <div
         className="flex flex-col gap-y-4"
        >
          <label className="text">Enter Question and Options</label>
          <textarea
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter question..."
            className="w-[50%] h-24 border border-[#0dcaf0] bg-[#2a444a] outline-none text-white rounded-md p-2.5"
          />
          <br />
          <label>Enter Options:</label>
          {options.map((option, index) => (
            <div key={index}>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Enter Option number ${index + 1}`}
                className="w-[35%] h-11 p-3 border border-[#0dcaf0] rounded-md bg-[#2a444a] outline-none text-white"
              />
            </div>
          ))}
          <div
            className="flex justify-between"
          >
            <Button className="bg-green-600 rounded-lg h-10 w-1/4 font-semibold " variant="outline-info" onClick={addOption}>
              Add another option +
            </Button>
            <input className="text-black" type="number" value={timer} onChange={(e) => setTimer(e.target.value)} />
            <Button className="bg-blue-600 rounded-lg h-10 w-1/4 font-semibold " variant="primary" onClick={askQuestion}>
              Ask Question ;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;