import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import './normal.css';
import './App.css';

const App = () => {
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [currentConvID, setCurrentConvID] = useState(null);
  const [currentPdfPath, setCurrentPdfPath] = useState(null);    // pdf path without the extension
  const [currentPdfName, setCurrentPdfName] = useState(null);    // pdf name without the extension
  // hard-coded for now:
  setCurrentUserID("user123");
  setCurrentConvID("conv123");

  // Make the below an empty array later, so there's no starting messages
  const [chatLog, setChatLog] = useState([
    { user: "Human", message: "How are you today?"},
    { user: "AI", message: "How can I help you today?"}
  ]);
  const [chatHistoryLog, setChatHistoryLog] = useState([]);
  const [chatLogInitialized, setChatLogInitialized] = useState(false);
  const chatLogRef = useRef(null);

  async function handleCreateNewChat() {
    // clear chat
    setChatLog([]);
    setChatLogInitialized(false);

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
  async function handleOpenOldChat() {
    // clear chat
    setChatLog([]);
    setChatLogInitialized(false);

    // vectorizePDF for current uploaded pdf file
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


    //TODO:   update current convID
    //setCurrentConvID(the selected chat's convID); 


    // update chat history
    try {
      const postData = {
        "id": currentConvID
      };

      const response = await axios.post("http://localhost:3500/api/initOldChat", postData, {
        headers: {
          "Content-Type": "application/json"
        }
      });    
      // display old chat history on frontend
      const QAs = response.data.qaSequence;
      QAs.forEach(document => {
        const question = document.question;
        const answer = document.answer;

        // add entries to chat log
        const chatLogNew = [...chatLog, { user: "Human", message: question }];
        setChatLog(chatLogNew);
        const chatLogNew2 = [...chatLog, { user: "AI", message: answer }];
        setChatLog(chatLogNew2);
      });
    } catch (error) {
      console.error("Error vectorizing pdf file:", error);
    }

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
    } catch (error) {
      console.error("Error uploading file:", error.response ? error.response.data : error);
      alert("Error uploading file");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const chatLogNew = [...chatLog, { user: "Human", message: input }];
    setChatLog(chatLogNew);

    // Setting the convo history                  do we need this?
    /*if(!chatLogInitialized) {
      setChatHistoryLog([{message: input}, ...chatHistoryLog]);
      setChatLogInitialized(true);
    }*/

    try {
      const postData = {
        "id": currentConvID,
        "pdfPath": currentPdfPath,
        "user_input": input
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
    setInput("");
  }

  function displayOldConvo() {
    // Add backend request here and display to frontend

  }

  const OldConvo = ({message}) => (
    <div className="chat-history-center">
      <div className="old-convo-button" onClick={displayOldConvo}>
        <div className="old-convo-message">{message.message}</div>
      </div>
    </div>
  );

  useEffect(() => {
    if(chatLogRef.current) {
      // Scroll to the bottom of the chat log when the chat log updates
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);
  
  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="upperSide">
          <div className="side-menu-button" onClick={handleCreateNewChat}>
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

export default App;