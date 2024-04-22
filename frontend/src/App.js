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

  // Make the below an empty array later, so there's no starting messages
  const [chatLog, setChatLog] = useState([
    { user: "AI", message: "Hey, PDF-GPT here. Upload a pdf file below and choose a previous conversation or start a new one!"},
  ]);
  const [chatHistoryLog, setChatHistoryLog] = useState([]);        // TODO:   when a user logs in, we need to iterate though the user's list of convID's in the users collection and update the chatHistoryLog on the side bar
  const [chatLogInitialized, setChatLogInitialized] = useState(false);
  const chatLogRef = useRef(null);

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
    // clear frontend chat
    await setChatLog([]);
    console.log("old chat id: ", convID);
    setCurrentConvID(convID); 

    // update chat history
    try {
      const getData = {
        "id": convID
      };

      const response = await axios.get("http://localhost:3500/api/initOldChat", getData, {
        headers: {
          "Content-Type": "application/json"
        }
      });    
      // display old chat history on frontend
      const QAs = response.data.qaSequence;
      console.log(QAs);
      QAs.forEach(document => {
        const question = document.question;
        const answer = document.answer;

        // add entries to chat log
        setChatLog([...chatLog, { user: "Human", message: question }, { user: "AI", message: answer }]);
        /*const chatLogNew = [...chatLog, { user: "Human", message: question }];
        setChatLog(chatLogNew);
        const chatLogNew2 = [...chatLog, { user: "AI", message: answer }];
        setChatLog(chatLogNew2);*/
      });
    } catch (error) {
      console.error("Error opening old chat:", error);
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

    // Setting the convo history                  
    if(!chatLogInitialized) {
      setChatHistoryLog([{convID: currentConvID, message: input}, ...chatHistoryLog]);   // maybe use pdf names instead of the 1st input
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
    setInput("");
  }

  function displayOldConvo() {
    // Add backend request here and display to frontend

  }

  const OldConvo = ({message}) => (
    <div className="chat-history-center">
      <div className="old-convo-button" onClick={async () => {await handleOpenOldChat(message.convID); handleVectorizePDF();}}>
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