import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Component/Pages/Sidebar';
import Calling from './Component/Pages/Calling';
import Loader from './Component/Pages/Loader';
import WhatsappLogs from './Component/Pages/WhatsappLogs';
import WhatsApp from './Component/Pages/WhatsApp';
import Sendcall from './Component/Pages/Sendcall';
import SubAdmin from './Component/Pages/SubAdmin';
import LoginSignup from './Component/Pages/LoginSignup';
import WhatsappTemplatesPage from './Component/Pages/whatsapptemplate';
import Callschedule from './Component/Pages/Callschedule';

import ConversationCall from './Component/Pages/ConversationCall';
import ChannelPartner from "./Component/Pages/ChannelPartner";
import ChannelPartnerUsers from "./Component/Pages/ChannelPartnerUsers";
import AgentsPage from './Component/Pages/AgentsPage';
import SendOmniCall from './Component/Pages/SendOmniCall';
import AgentCreatePage from './Component/Pages/AgentCreatePage';
import CallLogs from "./Component/Pages/CallLogs";
import AgentUsersPage from './Component/Pages/AgentUsersPage';
import AgentUserCreate from './Component/Pages/AgentUserCreate';
import AgentConnection from './Component/Pages/AgentConnection';
import AgentConnectionCreate from './Component/Pages/AgentConnectionCreate';
import EmailTemplateList from './Component/Pages/EmailTemplateList';
import WhatsappSendMsg from './Component/Pages/WhatsappSendMsg';
import Perplexity from './Component/Pages/Perplexity';
import LandingPage from './Component/Pages/LandingPage';
import ExamInfo from './Component/Pages/ExamInfo';
import ExamMcq from './Component/Pages/ExamMcq';
import CertificatePage from './Component/Pages/CertificatePage';
import CertifiedAITrainingPage from './Component/Pages/CertifiedAITrainingPage';
import RichaTrialPackPage from './Component/Pages/RichaTrialPackPage';
import DemoCallPackPage from './Component/Pages/DemoCallPackPage';
import TutorialPage from './Component/Pages/TutorialPage';
import MinutesPage from "./Component/Pages/MinutesPage";
import UpgradeMinutesPage from "./Component/Pages/UpgradeMinutesPage";
import ChannelPartnerMinuteTransactions from "./Component/Pages/ChannelPartnerMinuteTransactions";

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);


  const trialMinutes = useMemo(() => {
    return Number(Cookies.get('twilio_user_minute')) || 10;
  }, []);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const role = params.get('role');
    const twilioUser = params.get('twilio_user');
    const emailVerified = params.get('email_verified');

    if (!token) return;

    Cookies.set('CallingAgent', token, { expires: 365, sameSite: 'Strict' });
    localStorage.setItem('ibcrmtoken', token);

    if (email) {
      Cookies.set('email', email, { expires: 365, sameSite: 'Strict' });
      localStorage.setItem('userEmail', email);
    }

    if (role) {
      Cookies.set('role', role, { expires: 365, sameSite: 'Strict' });
    }

    if (twilioUser) {
      Cookies.set('twilio_user', twilioUser, { expires: 365, sameSite: 'Strict' });
    }

    if (emailVerified) {
      Cookies.set('email_verified', emailVerified, { expires: 365, sameSite: 'Strict' });
    }

    const cleanUrl = `${location.pathname}${location.hash || ''}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const token = Cookies.get('CallingAgent') || localStorage.getItem('ibcrmtoken');
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
              <Navigate to="/agents_page" replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route path="/certificate_page" element={<CertificatePage />} />

        {/* Public: Login */}
        <Route
          path="/login"
          element={
            !authed ? (
              <LoginSignup key={location.search} />
            ) : (
              <Navigate
                to="/agents_page"
                replace
                state={{ showWelcome: true, trialMinutes }}
              />
            )
          }
        />

        {/* Public: Exam info page */}
        <Route path="/exam-info" element={<ExamInfo />} />
        <Route path="/exam-start" element={<ExamMcq />} />

        {/* Public: Certified AI Training Page */}
        <Route path="/certified-ai-training" element={<CertifiedAITrainingPage />} />

        {/* Public: Richa Trial Pack Page */}
        <Route path="/richa-trial-pack" element={<RichaTrialPackPage />} />

        {/* Public: Demo Call Pack Page */}
        <Route path="/demo-call-pack" element={<DemoCallPackPage />} />

        {/* Public: Tutorial Page */}
        <Route path="/tutorial" element={<TutorialPage />} />

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
            <Route path="/agent-user" element={<AgentUsersPage />} />
            <Route path="/agent-new" element={<AgentUserCreate />} />
            <Route path="/agent-Connection" element={<AgentConnection />} />
            <Route path="/agent-connection/new" element={<AgentConnectionCreate />} />
            <Route path="/email-template" element={<EmailTemplateList />} />
            <Route path="/whatsapp-send-message" element={<WhatsappSendMsg />} />
            <Route path="/perplexity" element={<Perplexity />} />
            <Route path="/minutes" element={<MinutesPage />} />
            <Route path="/upgrade-minutes" element={<UpgradeMinutesPage />} />
            <Route path="/call-logs" element={<CallLogs />} />
            <Route path="/channel-partner" element={<ChannelPartner />} />
            <Route path="/channel-partner-users" element={<ChannelPartnerUsers />} />
            <Route
              path="/channel-partner-minute-transactions"
              element={<ChannelPartnerMinuteTransactions />}
            />
          </Route>
        )}
        {/* Catch-all */}
        <Route
          path="*"
          element={authed ? <Navigate to="/agents_page" /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
}

export default App;
