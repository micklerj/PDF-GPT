import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from "axios";
import './normal.css';
import './App.css';

const RootWithRouter = () => (
  <Router>
    <App />
  </Router>
);

const App = () => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [currentConvID, setCurrentConvID] = useState(null);
  const [currentPdfPath, setCurrentPdfPath] = useState(null);    // pdf path without the extension
  const [currentPdfName, setCurrentPdfName] = useState(null);    // pdf name without the extension

  // Make the below an empty array later, so there's no starting messages
  const [chatLog, setChatLog] = useState([]);
  const [chatHistoryLog, setChatHistoryLog] = useState([]);
  const [chatLogInitialized, setChatLogInitialized] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const chatLogRef = useRef(null);

  // Login/logout stuff
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  async function handleVectorizePDF() {
    // vectorizePDF for current uploaded file
    try {
      const postData = {
        "pdfPath": currentPdfPath   
      };

      await axios.post("http://localhost:3500/api/vectorize", postData, {
        headers: {
          "Content-Type": "application/json"
        }
      });    
    } catch (error) {
      console.error("Error vectorizing pdf file:", error);
    }
  }
  async function handleCreateNewChat() {
    // clear chat
    setChatLog([]);
    setChatLogInitialized(false);
    setShowChatInput(true);

    // create new convo   
    try {
      const postData = {
        "pdfName": currentPdfName   
      };

      const response = await axios.post("http://localhost:3500/api/newChat", postData, {
        headers: {
          "Content-Type": "application/json"
        }
      });  
      // update current convID
      setCurrentConvID(response.data.convID);  
    } catch (error) {
      console.error("Error creating new convo:", error);
    }

    // TODO:   add the new convID to the current user's list of convID's in the users collection
  }

  // use this when selcecting an old chat
  async function handleOpenOldChat(convID) {
    console.log("Starting to open old chat with convID:", convID);

    setChatLog([]);
    setShowChatInput(true);

    // vectorizePDF for current uploaded pdf file
    try {
        console.log("Making API call to initialize old chat");
        const response = await axios.get(`http://localhost:3500/api/initOldChat?id=${convID}`, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("API call successful, response data:", response.data);
        
        const QAs = response.data.qaSequence;
        let newLog = QAs.map(document => ([
            { user: "Human", message: document.question },
            { user: "AI", message: document.answer }
        ])).flat();

        console.log("New chat log prepared, setting state:", newLog);
        setChatLog(newLog);
        console.log("Chat log state set.");
    } catch (error) {
        console.error("Error opening old chat:", error);
        console.log("Failed to open old chat:", error.response ? error.response.data : error);
    }
}


  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);

    // TODO:     Add message like "File: 'filename' selected" somewhere
  }

  async function handleFileUpload() {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setCurrentUserID("user123");

    const formData = new FormData();
    formData.append("userId", currentUserID);  
    formData.append("conversationId", currentConvID);
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

      // update current pdf file path and name 
      const fileName = selectedFile.name;
      const fileNameNoExtension = fileName.substring(0, fileName.lastIndexOf('.'));
      await setCurrentPdfPath(`pdf-uploads/${currentUserID}/${fileNameNoExtension}`);
      await setCurrentPdfName(`${fileNameNoExtension}`);

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
      setChatHistoryLog([{convID: currentConvID, message: currentPdfName}, ...chatHistoryLog]);   
      setChatLogInitialized(true);
    }

    try {
      const postData = {
        "id": currentConvID,
        "pdfPath": currentPdfPath,
        "input": input
      };

      const response = await axios.post("http://localhost:3500/api/userInput", postData, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      setChatLog([...chatLogNew, { user: "AI", message: response.data.message }]);
    } catch (error) {
      console.error("Error submitting chat message:", error);
    }
    //setInput("");
  }

  function displayOldConvo() {
    // Add backend request here and display to frontend

  }

  // Need to change 'displayOldConvo' to 'handleOpenOldChat' once it's ready
  const OldConvo = ({message}) => (
    <div className="chat-history-center">
      <div className="old-convo-button" onClick={handleOpenOldChat}>
        <div className="old-convo-message">{message.message}</div>
      </div>
    </div>
  );

  // Handles logout tasks
  const handleLogout = () => {

    // TODO: Clear user authentication tokens or session data here

    setIsLoggedIn(false);
    navigate('/login');
  };

  // Scroll to the bottom of the chat log when the chat log updates
  useEffect(() => {
    if(chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);

  useEffect(() => {
    console.log("currentConvID: ", currentConvID);
  }, [currentConvID]);
  
  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="upperSide">
          <div className="side-menu-button" onClick={async () => { await handleCreateNewChat(); handleVectorizePDF(); } }>
            <span>+</span> New Chat
          </div>
          <hr className="chat-history-divider" />
          <h3>
            Chat History
          </h3>
          <div className="convos">
            <div className="chat-history">
              {chatHistoryLog.map((message, index) => (
                <OldConvo key={index} message={message} />
              ))}
            </div>
          </div>
        </div>
        <div className="lowerSide">
          <div className="logout-button" onClick={handleLogout}>
            Logout
          </div>
        </div>
      </aside>  

      <section className="chatbox">
        <div className="chat-log" ref={chatLogRef}>
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

export default RootWithRouter;