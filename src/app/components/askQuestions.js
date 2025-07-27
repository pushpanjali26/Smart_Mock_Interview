"use client";
import { useState, useEffect, useRef } from "react";

const MediaInput = ({ questions, setIsInterviewStarted }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedResponses, setRecordedResponses] = useState([]);
  const [feedbackResponses, setFeedbackResponses] = useState([]); // Stores feedback for each question
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    if (!mediaStream) return;

    const recorder = new MediaRecorder(mediaStream);
    let blobs = [];
    let recognition;

    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setRecordedResponses((prev) => [
          ...prev,
          {
            question: questions[currentQuestionIndex],
            response: text,
          },
        ]);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        blobs.push(event.data);
      }
    };

    recorder.onstop = () => {
      if (recognition) {
        recognition.stop();
      }
    };

    recorder.start();
    if (recognition) {
      recognition.start();
    }

    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const submitResponse = async (question, response) => {
    try {
      const res = await fetch("https://feedback-api-86n9.onrender.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, response }),
      });

      const data = await res.json();
      setFeedbackResponses((prev) => [...prev, { question, response, feedback: data }]);
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const handleNextQuestion = async () => {
    stopRecording();

    // Get the latest response from recordedResponses
    const latestResponse = recordedResponses[recordedResponses.length - 1];
    if (latestResponse) {
      await submitResponse(latestResponse.question, latestResponse.response);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsInterviewComplete(true);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  if (isInterviewComplete) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Interview Feedback</h2>
        {feedbackResponses.map((item, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
            <p><strong>Question:</strong> {item.question}</p>
            <p><strong>Your Answer:</strong> {item.response}</p>
            <p><strong>Feedback:</strong> {item.feedback.feedback}</p>
            <p><strong>Filler Percentage:</strong> {item.feedback.filler_percentage.toFixed(2)}%</p>
            <p><strong>Relevance:</strong> {item.feedback.relevance}</p>
            <p><strong>Repeated Words Count:</strong> {item.feedback.repeated_words_count}</p>
            <p><strong>Sentiment:</strong> {item.feedback.sentiment}</p>
          </div>
        ))}
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          onClick={() => setIsInterviewStarted(false)}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Interview Question</h2>
      <div className="text-lg mb-6 p-4 bg-gray-100 rounded-lg">
        {questions[currentQuestionIndex] || "No more questions."}
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-64 mb-4 rounded-lg shadow-md"
      ></video>
      <div className="flex justify-center gap-4 mt-4">
        <button
          className={`px-4 py-2 rounded text-white transition duration-300 ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Answer"}
        </button>
        <button
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          onClick={handleNextQuestion}
        >
          {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"}
        </button>
        <button
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          onClick={() => setIsInterviewStarted(false)}
        >
          Exit Interview
        </button>
      </div>
    </div>
  );
};

export default MediaInput;