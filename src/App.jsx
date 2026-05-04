import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerApp from './pages/CustomerApp';
import AdminBuilder from './pages/AdminBuilder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerApp />} />
        <Route path="/admin" element={<AdminBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
