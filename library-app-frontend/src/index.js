import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a root element for the React application
// This is the element that will contain the entire React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component to the root element
// This is the entry point for the React application
root.render(
  // Enable Strict Mode for the application
  // This helps to identify potential issues with the application, such as deprecated APIs or unexpected side effects
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Call the reportWebVitals function to start measuring performance metrics for the application
// This function can be passed a callback to log the results, or it can be used to send the results to an analytics endpoint
// Learn more about measuring performance in React applications: https://bit.ly/CRA-vitals
reportWebVitals();