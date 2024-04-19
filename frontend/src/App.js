import logo from './logo.svg';
import './normal.css';
import './App.css';
import {useEffect, useState} from 'react';
import Axios from "axios";

function App() {

  // add state for input and chat log 
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([{
    user: "gpt",
    message: "How can I help you today?"
  }, {
    user: "me",
    message: "I want to use ChatGPT today"
  }]);

  function clearChat() {
    setChatLog([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let chatLogNew = [...chatLog, {user: "me", message:`${input}`}]
    setInput("");
    setChatLog(chatLogNew);

    const response = await fetch("http://localhost:3500/userInput", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({input})
    });
    const data = await response.json();
    setChatLog([...chatLogNew, { user: "gpt", message: `${data.message}`} ])
    setInput("");

    // fetch response to the api combining the chat log array of messages
    // and sending it as a message to localhost:3000/ as a post

    // Need stuff in the index.js that's in the frontend folder
    // to handle this fetch to the api

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
          <ChatMessage key={index} message = {message} />
        ))}
      </div>

      <div className = "chat-input-holder">
        <form onSubmit={handleSubmit}>
        <input
        rows="1"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="chat-input-textArea">
        </input>
        </form>
      </div>
    </section>
    </div>
  );
}

const ChatMessage = ({message}) => {
  return (
    <div className={`chat-message ${message.user === "gpt" && "chatbot"}`}>
      <div className="chat-message-center">
        <div className={`avatar ${message.user === "gpt" && "chatbot"}`}>
          
        </div>
        <div className="message">
          {message.message}
        </div>
      </div>
    </div>
  )
}

export default App;

/*
Things you need to add:
- Some kind of upload pdf button
- Some kind of message saying the pdf was uploaded and processed correctly

- Integration with the database to store chat histories
- Integration with the actual backend and API to have the app actually functioning
- REST API, probably don't need to use OpenAI's API

- An initial login screen integrated with the login and authentication stuff Nick has been doing
- Some sort of button for settings and the like
- The actual settings page that the settings button corresponds to
*/

/*
        <div className="chat-message">
          <div className="chat-message-center">
            <div className="avatar">
            
            </div>
            <div className="message">
              Hello World
            </div>
          </div>
        </div>

        <div className="chat-message chatbot">
          <div className="chat-message-center">
            <div className="avatar chatbot">
            
            </div>
            <div className="message">
              I am a chatbot
            </div>
          </div>
        </div>
*/
