

import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Toaster } from 'react-hot-toast';

import Sidebar from './Component/Pages/Sidebar';
import Calling from './Component/Pages/Calling';
import Loader from './Component/Pages/Loader';
import WhatsappLogs from './Component/Pages/WhatsappLogs';
import WhatsApp from './Component/Pages/Whatsapp';
import Sendcall from './Component/Pages/Sendcall';
import SubAdmin from './Component/Pages/SubAdmin';
import LoginSignup from './Component/Pages/LoginSignup';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Memoize minute to prevent re-renders
  const trialMinutes = useMemo(() => {
    return Number(Cookies.get("twilio_user_minute")) || 10;
  }, []);

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const token = Cookies.get('CallingAgent');
    const role = Cookies.get('role'); // Get user role
    const twilioUser = Cookies.get('twilio_user');
    const emailVerified = Cookies.get('email_verified') === 'true';

    const isAdminWithTwilioZero = role === 'admin' && twilioUser === '0';

    setIsAuthenticated(!!token);
    setIsEmailVerified(emailVerified || isAdminWithTwilioZero); // allow if exception
  }, [location.pathname]);

  if (loading) return <Loader />;

  return (
    <>
      <Toaster position="top-center" />
      <Routes>

        {/* ✅ Public Login Route */}
        <Route
          path="/login"
          element={
            !isAuthenticated || !isEmailVerified ? (
              <LoginSignup key={location.search} />
            ) : (
              <Navigate
                to="/sendcall"
                replace
                state={{
                  showWelcome: true,
                  trialMinutes,
                }}
              />
            )
          }
        />

        {/* ✅ Protected Routes with Sidebar */}
        {isAuthenticated && isEmailVerified && (
          <Route element={<Sidebar />}>
            <Route path="/sendcall" element={<Sendcall />} />
            <Route path="/calling" element={<Calling />} />
            <Route path="/whatsapp-logs" element={<WhatsappLogs />} />
            <Route path="/whats-app" element={<WhatsApp />} />
            <Route path="/sub-admin" element={<SubAdmin />} />
          </Route>
        )}

        {/* ✅ Catch-all route */}
        <Route
          path="*"
          element={
            isAuthenticated && isEmailVerified
              ? <Navigate to="/sendcall" />
              : <Navigate to="/login?tab=login" />
          }
        />
      </Routes>
    </>
  );
}

export default App;
