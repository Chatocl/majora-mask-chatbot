import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import skullKidImage from './Images/1200px-SkullKidHWL.webp';
import song1 from './Music/Cancion1.mp3';
import song2 from './Music/Cancion2.mp3';
import song3 from './Music/Cancion3.mp3';
import song4 from './Music/Cancion4.mp3';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const chatOutputRef = useRef(null);
  const audioRef = useRef(null);

  // Array que contiene todas las canciones
  const songs = [song1, song2, song3, song4];
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);

    setIsTyping(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000//api/chat', {
        message: userInput,
      });

      simulateTyping(response.data.response, newMessages);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setIsTyping(false); // Reactivar la entrada en caso de error
    }

    setUserInput('');

    // Inicia el audio después de la primera interacción del usuario
    if (!audioInitialized) {
      audioRef.current.volume = 0.05;
      audioRef.current.src = songs[currentSongIndex];
      audioRef.current.play();
      setAudioInitialized(true);
    }
  };

  const simulateTyping = (text, newMessages) => {
    let index = 0;
    const typingSpeed = 1;

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
        setIsTyping(false); // Reactivar la entrada cuando termine de escribir
      }
    }, typingSpeed);
  };

  useEffect(() => {
    if (chatOutputRef.current) {
      chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleSongEnd = () => {
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    };

    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [songs.length]);

  // Mensaje inicial del bot
  useEffect(() => {
    const initialBotMessage = {
      sender: 'bot',
      text: '¿En qué te puedo ayudar del juego The Legend of Zelda: Majora’s Mask?'
    };
    setMessages([initialBotMessage]);
  }, []);

  return (
    <div className="App">
      <h1>Majora's Mask Chatbot</h1>
      <audio ref={audioRef} />
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
          placeholder="Pregúntame sobre Majora's Mask..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
          disabled={isTyping} // Desactivar entrada si está escribiendo
        />
        <button
          id="send-button"
          onClick={sendMessage}
          disabled={isTyping} // Desactivar botón si está escribiendo
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
