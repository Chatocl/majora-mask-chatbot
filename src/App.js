import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import skullKidImage from './Images/1200px-SkullKidHWL.webp';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatOutputRef = useRef(null);

  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);

    setIsTyping(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/chat', {
        message: userInput,
      });

      simulateTyping(response.data.response, newMessages);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }

    setUserInput('');
  };

  const simulateTyping = (text, newMessages) => {
    let index = 0;
    const typingSpeed = 10; 

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        const updatedMessages = [
          ...newMessages,
          { sender: 'bot', text: text.slice(0, index + 1) },
        ];
        setMessages(updatedMessages);
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, typingSpeed);
  };

  useEffect(() => {
    if (chatOutputRef.current) {
      chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="App">
      <h1>Majora's Mask Chatbot</h1>
      <div id="chat-window">
        <div id="chat-output" ref={chatOutputRef}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'user' ? 'user-message-container' : 'bot-message-container'}>
              {msg.sender === 'bot' && (
                <div className="bot-message-wrapper">
                  <img src={skullKidImage} alt="Skull Kid" className="skull-kid-image" />
                  <div className="bot-message">{msg.text}</div>
                </div>
              )}
              {msg.sender === 'user' && <div className="user-message">{msg.text}</div>}
            </div>
          ))}
        </div>
        <input
          type="text"
          id="user-input"
          placeholder="Ask me anything..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button id="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
