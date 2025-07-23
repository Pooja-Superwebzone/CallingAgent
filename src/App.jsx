
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import Login from './Component/Pages/Login';
import Calling from './Component/Pages/Calling';
import Loader from './Component/Pages/Loader';

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = Cookies.get('CallingAgent');
    setIsAuthenticated(!!token);
  }, [location.pathname]); // ✅ Re-check on route change

  if (loading) return <Loader />;

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Calling />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
