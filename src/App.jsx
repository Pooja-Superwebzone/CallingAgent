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
import WhatsappTemplatesPage from './Component/Pages/whatsapptemplate';
import Callschedule from './Component/Pages/Callschedule';
import LandingPage from './Component/Pages/Landingpage';
import ConversationCall from './Component/Pages/ConversationCall';
import ChannelPartner from "./Component/Pages/ChannelPartner";
import AgentsPage from './Component/Pages/AgentsPage';
import SendOmniCall from './Component/Pages/SendOmniCall';
  import AgentCreatePage  from './Component/Pages/AgentCreatePage';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);


  const trialMinutes = useMemo(() => {
    return Number(Cookies.get('twilio_user_minute')) || 10;
  }, []);

  
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const token = Cookies.get('CallingAgent');
    const role = Cookies.get('role');
    const twilioUser = Cookies.get('twilio_user');
    const emailVerified = Cookies.get('email_verified') === 'true';

    const isAdminWithTwilioZero = role === 'admin' && twilioUser === '0';

    setIsAuthenticated(!!token);
    setIsEmailVerified(emailVerified || isAdminWithTwilioZero);
  }, [location.pathname]);

  if (loading) return <Loader />;

  const authed = isAuthenticated && isEmailVerified;

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        {/* Public: Landing first */}
        <Route
          path="/"
          element={
            authed ? (
              <Navigate to="/sendcall" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Public: Login */}
        <Route
          path="/login"
          element={
            !authed ? (
              <LoginSignup key={location.search} />
            ) : (
              <Navigate
                to="/sendcall"
                replace
                state={{ showWelcome: true, trialMinutes }}
              />
            )
          }
        />

        {/* Protected (wrapped in Sidebar) */}
        {authed && (
          <Route element={<Sidebar />}>
            <Route path="/sendcall" element={<Sendcall />} />
            <Route path="/calling" element={<Calling />} />
            <Route path="/whatsapp-logs" element={<WhatsappLogs />} />
            <Route path="/whats-app" element={<WhatsApp />} />
            <Route path="/sub-admin" element={<SubAdmin />} />
            <Route path="/whatsapp-temp" element={<WhatsappTemplatesPage />} />
            <Route path="/call-schedule" element={<Callschedule />} />
            <Route path='/call-coversation' element={<ConversationCall />} />
            <Route path="/" element={<Navigate to="/agents" replace />} />
        <Route path="/agents_page" element={<AgentsPage />} />
        <Route path="/agents/new" element={<AgentCreatePage />} />
        <Route path="/send-omni" element={<SendOmniCall />} />
     
            
<Route path="/channel-partner" element={<ChannelPartner />} />
          </Route>
        )}

        {/* Catch-all */}
        <Route
          path="*"
          element={authed ? <Navigate to="/sendcall" /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
}

export default App;
