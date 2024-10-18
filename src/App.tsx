import React, { useState } from 'react';
import './App.css'; // You can use simple CSS for layout
import Login from './component/Login';
import Register from './component/Register';
import {  Navigate, Route, Routes } from 'react-router-dom';
import { useUserContext } from './context/UserContext';
import Home from './component/Home';

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const {token } = useUserContext();
  return (
    <div className="app">
      <Routes>
          <Route path="/signin" element={!token ? <Login /> : <Navigate to={"/"}/>} />
        <Route path="/signup" element={!token ? <Register /> : <Navigate to={"/"} />} />
        <Route path="/" element={token ? <Home /> : <Navigate to={"/signin"} />} />
        {/* // <Route path='/' element={<HomePage/>}/> */}
        </Routes>

    </div>
  );
};

export default App;
