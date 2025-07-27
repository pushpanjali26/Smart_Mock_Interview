"use client";
import { useState, useEffect } from "react";
import ResumeUpload from "./components/UserInputs";
import MediaInput from "./components/askQuestions";

export default function Home() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (isInterviewStarted) {
      setModalOpen(false);
    }
  }, [isInterviewStarted, setModalOpen]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <main className="min-h-screen flex flex-col bg-[#f9f3ff]">
      {isInterviewStarted ? (
        <MediaInput 
        questions={questions} 
        setIsInterviewStarted={setIsInterviewStarted} 
      />
      ) : (
        <>
          <header className="flex justify-between items-center p-6">
            <div className="text-xl font-bold text-purple-700">AceAI</div>
          </header>

          <section className="flex flex-col md:flex-row items-center justify-between p-8 md:p-20">
            <div className="flex-1 mb-8 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-snug">
                Master Your Dream Job Interviews With AI
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                An AI-powered platform to simulate interviews, analyze performance, and provide personalized feedback for interview success.
              </p>
              <button
                className="mt-6 bg-purple-700 text-white rounded px-6 py-3 hover:bg-purple-800"
                onClick={openModal}
              >
                Start your interview prep here
              </button>
            </div>
            <div className="flex-1 flex justify-center bg-transparent">
              <img
                src="/interview_image.jpg"
                alt="Interview Simulation"
                width={500}
                height={500}
              />
            </div>
          </section>

          {isModalOpen && (
            <ResumeUpload
              closeModal={closeModal}
              setQuestions={setQuestions}
              setIsInterviewStarted={setIsInterviewStarted}
            />
          )}
        </>
      )}
    </main>
  );
}