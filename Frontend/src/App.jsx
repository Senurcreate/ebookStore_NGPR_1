// src/App.jsx
import "./styles/main.scss";  // Import styles here
import React from 'react'

function App() {
  return (
    <div className="container mt-5">
      <h1 className="text-primary">Ebook Store</h1>
      <p className="text-secondary">Testing custom styles</p>
      <button className="btn btn-primary me-2">Primary</button>
      <button className="btn btn-customcolor">Custom Color</button>
      <button className="btn btn-altlight">Alt Light</button>
    </div>
  )
}

export default App