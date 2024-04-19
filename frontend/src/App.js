import './normal.css';
import './App.css';
import React, { useEffect, useState} from 'react';
import axios from "axios";

const App = () => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatLog, setChatLog] = useState([
    { user: "AI", message: "What's up, how can I help you?" },
    { user: "Human", message: "Hey, how are you?" }
  ]);

  function clearChat() {
    setChatLog([]);
  }

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
  }

  async function handleFileUpload() {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
  
    const formData = new FormData();
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
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault(); // Prevents the form from refreshing the page
    const chatLogNew = [...chatLog, { user: "Human", message: input }];
    setChatLog(chatLogNew);

    const response = await axios.post("http://localhost:3500/userInput", {
        input
      }, {
        headers: {
          "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    setChatLog([...chatLogNew, { user: "AI", message: data.message }]);
    setInput("");
  }

  

  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="side-menu-button" onClick={clearChat}>
          <span>+</span> New Chat
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
            <button onClick={handleFileUpload} className="upload-button">Upload PDF</button>
          </div>
        </div>
      </section>
    </div>
  );
}

const ChatMessage = ({ message }) => (
  <div className={`chat-message ${message.user === "AI" && "chatbot"}`}>
    <div className="chat-message-center">
      <div className={`avatar ${message.user === "AI" && "chatbot"}`}></div>
      <div className="message">{message.message}</div>
    </div>
  </div>
);

export default App;
