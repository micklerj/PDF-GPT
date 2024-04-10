import logo from './logo.svg';
import './normal.css';
import './App.css';

function App() {
  return (
    <div className="App">
    <aside className = "sidemenu">
      <div className="side-menu-button">
        <span>+</span>
        New Chat
      </div>
    </aside>  
    <section className = "chatbox">
      <div className="chat-log">
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
      </div>
      <div className = "chat-input-holder">
        <textarea
        rows="1"
        className="chat-input-textArea">
        </textarea>
      </div>
    </section>
    </div>
  );
}

export default App;

/*
Things you need to add:
- Some kind of upload pdf button
- Some kind of message saying the pdf was uploaded and processed correctly

- Integration with the database to store chat histories
- Integration with the actual backend and API to have the app actually functioning

- An initial login screen integrated with the login and authentication stuff Nick has been doing
- Some sort of button for settings and the like
- The actual settings page that the settings button corresponds to
*/
