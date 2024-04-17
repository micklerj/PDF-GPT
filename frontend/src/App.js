import logo from './logo.svg';
import './normal.css';
import './App.css';
import React, { useEffect, useState} from 'react';
import Axios from "axios";

const App = () => {
  const [input, setInput] = useState("");
  const [chatLog, setChatlog] = useState([{
    user: "AI",
    message: "whats up, how can I help you"
  }, {
    user: "Human",
    message: "hey how are you"
  }]);

  function clearChat() {
    setChatlog([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let chatLogNew = [...chatLog, { user: "Human", message: `${input}`} ]
    setChatlog(chatLogNew);

    const response = await fetch("http://localhost:3500/userInput", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({input})
    });
    const data = await response.json();
    setChatlog([...chatLogNew, { user: "AI", message: `${data.message}`} ])
    setInput("");
  }



  return (
    <div className="App">
    <aside className = "sidemenu">
      <div className="side-menu-button" onClick={clearChat}>
        <span>+</span>
        New Chat
      </div>
    </aside>  
    <section className = "chatbox">
      <div className="chat-log">
        {chatLog.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}        
      </div>
      <div className = "chat-input-holder">
        <form onSubmit={handleSubmit}>
          <input
          rows="1"
          value={input}
          onChange={(e)=> setInput(e.target.value)}
          className="chat-input-textArea">
          </input>
        </form>
      </div>
    </section>
    </div>
  );
}

const ChatMessage = ({ message}) => {
  return (
    <div className={`chat-message ${message.user === "AI" && "chatbot"}`}>
      <div className="chat-message-center">
        <div className={`avatar ${message.user === "AI" && "chatbot"}`}>
        
        </div>
        <div className="message">
          {message.message}
        </div>
      </div>
    </div>
  )
}

export default App;

