import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import GuestApp from './GuestApp'
import 'bootstrap/dist/css/bootstrap.min.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/gallery/:name?" element={<GuestApp />} />
        <Route path="*" element={<Navigate to="/gallery" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)