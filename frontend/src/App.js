import React, { useState } from 'react';
import axios from "axios";
import './normal.css';
import './App.css';

const App = () => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatLog, setChatLog] = useState([
    { user: "AI", message: "What's up, how can I help you?" },
    { user: "Human", message: "Hey, how are you?" }
  ]);
  const [chatHistoryLog, setChatHistoryLog] = useState([]);
  const [chatLogInitialized, setChatLogInitialized] = useState(false);

  function clearChat() {
    setChatLog([]);
    setChatLogInitialized(false);
  }

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);

    // Add message like "File: 'filename' selected" somewhere maybe
  }

  async function handleFileUpload() {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
    const userId = "user123";
    //make a req to userauth sys 
    const conversationId = "conv123";  
    //make a req to convRoutes?

    const formData = new FormData();
    formData.append("userId", userId);  
    formData.append("conversationId", conversationId);
    //file must be last to ensure JSON data gets parsed correctly
    formData.append("file", selectedFile);
  

    try {
      const response = await axios.post("http://localhost:3500/api/upload", formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
      alert("File uploaded successfully!");
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading file:", error.response ? error.response.data : error);
      alert("Error uploading file");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const chatLogNew = [...chatLog, { user: "Human", message: input }];
    setChatLog(chatLogNew);
    setInput("");

    // Setting the convo history
    if(!chatLogInitialized) {
      setChatHistoryLog([...chatHistoryLog, {message: input}]);
      setChatLogInitialized(true);
    }

    try {
      //TODO
      const response = await axios.post("http://localhost:3500/userInput", {
          input
        }, {
          headers: {
            "Content-Type": "application/json"
          }
      });
      setChatLog([...chatLogNew, { user: "AI", message: response.data.message }]);
      setInput("");
    } catch (error) {
      console.error("Error submitting chat message:", error);
    }
  }

  function displayOldConvo() {
    // Add backend request here and display to frontend

  }

  const OldConvo = ({message}) => (
    <div className="chat-history-center">
      <div className="old-convo-button" onClick={displayOldConvo}>
        {message.message}
      </div>
    </div>
  );
  
  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="side-menu-button" onClick={clearChat}>
          <span>+</span> New Chat
        </div>
        <hr className="chat-history-divider" />
        <h3>
          Chat History
        </h3>
        <div className="chat-history">
          {chatHistoryLog.map((message, index) => (
            <OldConvo key={index} message={message} />
          ))}
        </div>
      </aside>  
      <section className="chatbox">
        <div className="chat-log">
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}        
        </div>
        <div className="chat-input-holder">
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <input
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="chat-input-textArea"
                placeholder="Chat with PDF-GPT"
            />
            <button type="submit" className="send-button">Send</button>
          </form>
          <div className="file-input-container">
            <input
              type="file"
              id="file"
              className="file-input"
              onChange={handleFileChange}
              accept=".pdf"
            />
            <label htmlFor="file" className="file-input-label">Choose PDF</label>
            <button onClick={() => handleFileUpload()} className="upload-button">Upload PDF</button>
          </div> 
        </div>
      </section>
    </div>
  ); 
}

const ChatMessage = ({ message }) => (
  <div className={`chat-message ${message.user === "AI" ? "chatbot" : ""}`}>
    <div className="chat-message-center">
      <div className={`avatar ${message.user === "AI" ? "chatbot" : ""}`}></div>
      <div className="message">{message.message}</div>
    </div>
  </div>
);

export default App;
