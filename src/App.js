import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded } from 'firebase/database';
import { FaCopy } from 'react-icons/fa';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRjti9wnWsCHeJaSa_iRXk9ZPsY4KShNo",
  authDomain: "pixelterminal.firebaseapp.com",
  databaseURL: "https://pixelterminal-default-rtdb.firebaseio.com",
  projectId: "pixelterminal",
  storageBucket: "pixelterminal.firebasestorage.app",
  messagingSenderId: "388079158871",
  appId: "1:388079158871:web:bb8135efccdd388eb0c512",
  measurementId: "G-TF0T7N39Q3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const App = () => {
  const [output, setOutput] = useState('');
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const contractAddress = 'BsyJvHG7UxTJmBaBy45pMLWx9ZyDTkvSeN3rwpYVpump';
  const shortenedAddress = `${contractAddress.slice(0, 4)}...${contractAddress.slice(-4)}`;
  const isInitialMigrationLoad = useRef(true); // Flag to track initial new_migrations load

  // Scroll to bottom of output when updated
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const [outputLines, setOutputLines] = useState([]);

  // Listener for new_coins
  useEffect(() => {
    const coinsRef = ref(database, 'new_coins/');
    const unsubscribeCoins = onChildAdded(
      coinsRef,
      (snapshot) => {
        const coin = snapshot.val();
        if (coin) {
          const cleanName = String(coin.name).replace(/"/g, '');
          const timestamp = coin.time; // Assuming time is stored in HH:MM format
          const newLine = `[${timestamp}] [NEW]: ${cleanName}`;
          // Append new line, preserving existing timestamps in outputLines
          setOutputLines(prev => [...prev, newLine]);
        }
      },
      (error) => {
        const currentTimestamp = new Date().toISOString().slice(11, 16); // HH:mm format
        const errorLine = `[${currentTimestamp}] Error fetching new_coins data: ${error.message}`;
        // Append error line, preserving existing timestamps
        setOutputLines(prev => [...prev, errorLine]);
      }
    );
    return () => unsubscribeCoins();
  }, []);

  // Listener for new_migrations
  useEffect(() => {
    const migrationsRef = ref(database, 'new_migrations/');
    const unsubscribeMigrations = onChildAdded(
      migrationsRef,
      (snapshot) => {
        if (isInitialMigrationLoad.current) {
          // Skip processing existing migrations on initial load
          return;
        }
        const migration = snapshot.val();
        if (migration) {
          const cleanName = String(migration.mint).replace(/"/g, '');
          const timestamp = migration.time; // Assuming time is stored in HH:MM format
          const newLine = `[${timestamp}] [NEW MIGRATION]: ${cleanName}`;
          // Append new line, preserving existing timestamps in outputLines
          setOutputLines(prev => [...prev, newLine]);
        }
      },
      (error) => {
        const currentTimestamp = new Date().toISOString().slice(11, 16); // HH:mm format
        const errorLine = `[${currentTimestamp}] Error fetching new_migrations data: ${error.message}`;
        // Append error line, preserving existing timestamps
        setOutputLines(prev => [...prev, errorLine]);
      }
    );

    // After the first render, set the flag to false to allow new migrations
    const timer = setTimeout(() => {
      isInitialMigrationLoad.current = false;
    }, 0);

    return () => {
      unsubscribeMigrations();
      clearTimeout(timer);
    };
  }, []);

  // Convert outputLines to string for rendering
  useEffect(() => {
    setOutput(outputLines.join('\n'));
  }, [outputLines]);

  // Handle copy contract address
  const handleCopyCA = () => {
    navigator.clipboard.writeText(contractAddress).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="app-container">
      {/* Token Header */}
      <header className="token-header">
        <div className="token-details">
          <div className="contract-address-wrapper">
            <p className="token-ticker">$ADA</p>
            <p className="contract-address">{shortenedAddress}</p>
            <button className="copy-button" onClick={handleCopyCA} aria-label="Copy contract address">
              <FaCopy />
            </button>
          </div>
          <div className="follow-section">
            <a
              href="https://x.com/AYAtradingsol"
              className="btn-follow"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow on X
            </a>
          </div>
        </div>
      </header>
      {/* Terminal */}
      <div className="terminal">
        <div className="header">
          <div className="traffic-lights">
            <div className="traffic-light"></div>
            <div className="traffic-light yellow"></div>
            <div className="traffic-light green"></div>
          </div>
          <h1>$ADA Terminal</h1>
        </div>
        <div className="terminal-output" ref={outputRef}>
          {output.split('\n').map((line, index) => {
            if (!line) return null;
            const parts = line.split('] ', 2);
            if (parts.length === 2) {
              const messageParts = parts[1].split(': ', 2);
              if (messageParts.length === 2) {
                const typeClass = messageParts[0] === '[NEW MIGRATION]' ? 'migration-type' : 'type-label';
                return (
                  <div key={index} className="output-line">
                    <span className="timestamp">{parts[0]}]</span>
                    <span className={typeClass}>{messageParts[0]}:</span>
                    <span className="content">{messageParts[1]}</span>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="output-line">
                    <span className="timestamp">{parts[0]}]</span>
                    <span className="message">{parts[1]}</span>
                  </div>
                );
              }
            } else {
              return <div key={index}>{line}</div>;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default App;