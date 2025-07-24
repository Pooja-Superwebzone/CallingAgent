

// import React, { useEffect, useState } from 'react';
// import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import Cookies from 'js-cookie';

// import Login from './Component/Pages/Login';
// import Calling from './Component/Pages/Calling';
// import Loader from './Component/Pages/Loader';
// import Sidebar from './Component/Pages/Sidebar';

// function App() {
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const location = useLocation();

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 1000);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     const token = Cookies.get('CallingAgent');
//     setIsAuthenticated(!!token);
//   }, [location.pathname]);

//   if (loading) return <Loader />;

//   return (
//     <>
//       <Toaster position="top-center" />
//       <Routes>
//         <Route
//           path="/"
//           element={
//             isAuthenticated ? (
//               <Sidebar>
//                 <Calling />
//               </Sidebar>
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           }
//         />
//         <Route
//           path="/login"
//           element={
//             isAuthenticated ? <Navigate to="/" replace /> : <Login />
//           }
//         />
//       </Routes>
//     </>
//   );
// }

// export default App;
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Component/Pages/Sidebar';
import Login from './Component/Pages/Login';
import Calling from './Component/Pages/Calling';
import SendCall from './Component/Pages/SendCall';
import Loader from './Component/Pages/Loader';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import WhatsappLogs from './Component/Pages/WhatsappLogs';
import CallLogs from './Component/Pages/Calling';

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
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/calling" />} />

        {isAuthenticated && (
          <Route element={<Sidebar />}>
            <Route path="/calling" element={<Calling />} />
            <Route path="/whatsapp" element={<WhatsappLogs />} />
            <Route path="/sendcall" element={<SendCall />} />
            {/* Add more sidebar-routed pages here */}
          </Route>
        )}

        <Route path="*" element={<Navigate to={isAuthenticated ? "/calling" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;
