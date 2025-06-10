import React from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AdminPollInterface } from '@/components/AdminPollInterface';
import { UserPollSession } from '@/components/UserPollSession';
import { Button } from '@/components/ui/button';
import { Settings, Users, LogIn, LogOut } from 'lucide-react';

const MOCK_USER_ID_ADMIN = 'admin123';
const MOCK_USER_ID_PARTICIPANT = 'user789';

function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('poll_app_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const loginAsAdmin = () => {
    const adminUser = { id: MOCK_USER_ID_ADMIN, role: 'admin', name: 'Admin Host' };
    localStorage.setItem('poll_app_user', JSON.stringify(adminUser));
    setCurrentUser(adminUser);
  };

  const loginAsParticipant = () => {
    const participantUser = { id: MOCK_USER_ID_PARTICIPANT, role: 'participant', name: 'Poll User' };
    localStorage.setItem('poll_app_user', JSON.stringify(participantUser));
    setCurrentUser(participantUser);
  };

  const logout = () => {
    localStorage.removeItem('poll_app_user');
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <motion.div
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-32 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"
            animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-32 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"
            animate={{ x: [0, 120, 0], y: [0, -80, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10">
          <Routes>
            <Route path="/login" element={!currentUser ? <LoginPage onAdminLogin={loginAsAdmin} onParticipantLogin={loginAsParticipant} /> : <Navigate to="/" />} />
            <Route path="/" element={currentUser ? <MainLayout user={currentUser} onLogout={logout} /> : <Navigate to="/login" />}>
              <Route index element={currentUser?.role === 'admin' ? <Navigate to="/admin-poll" /> : <Navigate to="/poll-session" />} />
              <Route path="admin-poll" element={currentUser?.role === 'admin' ? <AdminPollInterface userId={currentUser.id} /> : <Navigate to="/poll-session" />} />
              <Route path="poll-session" element={<UserPollSession userId={currentUser?.id || 'guest'} />} />
            </Route>
            <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </Router>
  );
}

function LoginPage({ onAdminLogin, onParticipantLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-4">
       <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-white mb-4">Real-Time Poll Platform</h1>
        <p className="text-xl text-purple-200">Engage your audience instantly.</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-effect p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-semibold text-white text-center">Join As</h2>
        <Button onClick={onAdminLogin} className="w-full text-lg py-3 bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 transition-opacity">
          <Settings className="w-6 h-6 mr-3" /> Admin / Host
        </Button>
        <Button onClick={onParticipantLogin} className="w-full text-lg py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:opacity-90 transition-opacity">
          <Users className="w-6 h-6 mr-3" /> Participant / User
        </Button>
      </motion.div>
    </div>
  );
}


function MainLayout({ user, onLogout }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-white/5 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">Real-Time Polls</Link>
          <div className="space-x-2 flex items-center">
            <span className="text-white text-sm hidden md:inline">Logged in as: {user.name} ({user.role})</span>
            {user.role === 'admin' && (
              <Button variant="ghost" asChild className="text-white hover:bg-white/10">
                <Link to="/admin-poll"><Settings className="w-4 h-4 mr-2" />Admin Panel</Link>
              </Button>
            )}
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <Link to="/poll-session"><Users className="w-4 h-4 mr-2" />Join Session</Link>
            </Button>
            <Button onClick={onLogout} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default App;