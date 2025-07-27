"use client";
import { useState } from "react";

const ResumeUpload = ({ closeModal, setQuestions, setIsInterviewStarted }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [job_description, setJobDescription] = useState("");
  const [knowledgeDomain, setKnowledgeDomain] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleBrowseClick = () => {
    document.getElementById("fileInput").click();
  };

  const generateQuestions = (data) => {
    const allQuestions = [];
    const apiResponse = data.apiResponse || '';
    const jsonString = apiResponse.replace(/^```json\n|\n```$/g, '');

    try {
      const jsonData = JSON.parse(jsonString);

      if (jsonData && Array.isArray(jsonData.sections)) {
        jsonData.sections.forEach((section) => {
          if (section.subsections && Array.isArray(section.subsections)) {
            section.subsections.forEach((subsection) => {
              if (subsection.questions && Array.isArray(subsection.questions)) {
                subsection.questions.forEach((question) => {
                  allQuestions.push(question);
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    setQuestions(allQuestions);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please upload a resume.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("job_description", job_description);
      formData.append("knowledge_domain", knowledgeDomain);

      const response = await fetch("https://llm-api-8yhu.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload data.");
      }

      const result = await response.json();
      console.log(result);
      generateQuestions(result);
      setIsInterviewStarted(true);
      closeModal();
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6 relative">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✖
        </button>
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">AceAI</h1>
        <h2 className="text-xl font-semibold mb-6">Start Your Next Interview</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Resume</h3>
            <p className="text-sm text-gray-500 mb-2">Upload your resume (pdf)</p>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                {selectedFile ? selectedFile.name : "Drag & Drop File"}
              </span>
              <button
                type="button"
                onClick={handleBrowseClick}
                className="bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 transition"
              >
                Browse File
              </button>
              <input
                id="fileInput"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg">Job Description</h3>
            <textarea
              placeholder="Add job description"
              value={job_description}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            ></textarea>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg">Mention Knowledge Domain</h3>
            <input
              type="text"
              placeholder="E.g., AI, ML, Web Dev"
              value={knowledgeDomain}
              onChange={(e) => setKnowledgeDomain(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className={`${
              isUploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            } text-white py-2 px-4 rounded-md transition w-full`}
          >
            {isUploading ? "Uploading..." : "Launch"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeUpload;