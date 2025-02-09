import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/hooks/AuthProvider';
import Navbar from './components/NavBar/Navbar';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Events from './components/events/Events';
import CreateEvent from './components/events/CreateEvent';
import EventDetails from './components/events/EventDetails';
import EventRegister from './components/events/EventRegister';
import Profile from './components/Profile/Profile';
import DashBoard from './components/dashboard/DashBoard';
import Footer from './components/Footer/Footer';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const EventRegistration = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Event Registration</h1>
    <p>Register for this event</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashBoard />
                </ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              } />
              <Route path="/events/:id/register" element={
                <ProtectedRoute>
                  <EventRegister />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to="/events" replace />} />
              
              <Route path="*" element={
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
                  <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
