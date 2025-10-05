import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar /> {/* Navbar always visible */}
        <Routes>
          <Route path='/' element={<Hero/>}/>
        </Routes>
      </Router>
    </div>
  )
}


export default App;