import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';
import { API_URL } from '../../config';

const UserAvatar = ({ userId, token }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!userId || !token) {
        console.log('Debug - Missing data:', { userId, hasToken: !!token });
        return;
      }

      try {
        console.log('Debug - Fetching profile picture for user:', userId);
        const response = await fetch(`${API_URL}/api/users/${userId}/profile-picture`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        }
      } catch (err) {
        console.error('Error fetching profile picture:', err);
        setError(err.message);
      }
    };

    fetchProfilePicture();
    return () => {
      if (imageUrl) {
        console.log('Cleaning up URL:', imageUrl);
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [userId, token]);

  // Debug render
  console.log('Rendering UserAvatar:', { userId, hasImage: !!imageUrl, error });

  return (
    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Profile"
          className="h-full w-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', e);
            setError('Image failed to load');
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )}
    </div>
  );
};

const NavLink = ({ to, children, isMobile }) => (
  <Link 
    to={to} 
    className={`text-gray-700 hover:text-white px-4 py-2 rounded-md transition-all duration-200 
    ${isMobile ? 'border border-indigo-600' : 'border-transparent'} 
    hover:bg-indigo-600 flex items-center h-[40px] hover:shadow-sm`}
  >
    {children}
  </Link>
);

const MobileNavContainer = ({ children }) => (
  <div className="md:hidden pb-4 flex flex-col items-start space-y-3 pl-2">
    <div className="flex flex-col items-start w-full gap-3">
      {children}
    </div>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout, token } = useAuth();

  console.log('Debug - User data in Navbar:', { user, token });

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              Event Manager
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-4 h-[40px]">
              <NavLink to="/events">Events</NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/create">Create Event</NavLink>
                </>
              )}
            </div>
            
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 
                  transition-all duration-200 hover:shadow-md border border-transparent"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-indigo-600 px-6 py-2 rounded-md hover:bg-indigo-50 
                  transition-all duration-200 hover:shadow-md border border-indigo-600"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 px-4 py-2 rounded-md 
                  transition-all duration-200 text-gray-700 hover:text-white
                  hover:bg-indigo-600 border border-transparent hover:border-indigo-600 h-[40px]"
                >
                  <UserAvatar userId={user?._id} token={token} />
                  <span>{user?.username || 'Profile'}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-gray-700 hover:text-white px-4 py-2 rounded-md 
                  transition-all duration-200 border border-transparent
                  hover:bg-red-600 hover:border-red-600 h-[40px] flex items-center"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 px-4 py-3 text-lg"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <MobileNavContainer>
            <NavLink to="/events" isMobile>Events</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" isMobile>Dashboard</NavLink>
                <NavLink to="/create" isMobile>Create Event</NavLink>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-white px-4 py-2 
                  rounded-md transition-all duration-200 hover:bg-indigo-600 border border-indigo-600"
                >
                  <UserAvatar userId={user?._id} token={token} />
                  <span>{user?.username || 'Profile'}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-gray-700 hover:text-white w-auto px-4 py-2 rounded-md 
                  transition-all duration-200 hover:bg-red-600 border border-indigo-600"
                >
                  Logout
                </button>
              </>
            )}
            
            {!isAuthenticated && (
              <div className="flex flex-col items-start gap-3">
                <Link 
                  to="/login" 
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 
                  transition-all duration-200 border border-transparent w-auto"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-indigo-600 px-6 py-2 rounded-md hover:bg-indigo-50 
                  transition-all duration-200 border border-indigo-600 w-auto"
                >
                  Register
                </Link>
              </div>
            )}
          </MobileNavContainer>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
