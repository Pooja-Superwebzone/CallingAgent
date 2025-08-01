import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Component/Pages/Sidebar';
import Calling from './Component/Pages/Calling';
import Loader from './Component/Pages/Loader';
import Cookies from 'js-cookie';
import { Toaster } from 'react-hot-toast';
import WhatsappLogs from './Component/Pages/WhatsappLogs';
import WhatsApp from './Component/Pages/Whatsapp';
import Sendcall from './Component/Pages/Sendcall';
import SubAdmin from './Component/Pages/SubAdmin';
import LoginSignup from './Component/Pages/LoginSignup';

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const token = Cookies.get('CallingAgent');
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  if (loading) return <Loader />;

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginSignup key={location.search} />
            ) : (
              <Navigate to="/calling" replace />
            )
          }
        />

        {isAuthenticated && (
          <Route element={<Sidebar />}>
            <Route path="/calling" element={<Calling />} />
            <Route path="/whatsapp-logs" element={<WhatsappLogs />} />
            <Route path="/sendcall" element={<Sendcall />} />
            <Route path="/whats-app" element={<WhatsApp />} />
            <Route path="/sub-admin" element={<SubAdmin />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to={isAuthenticated ? "/calling" : "/login?tab=login"} />} />

      </Routes>
    </>
  );
}

export default App;

