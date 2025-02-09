import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthProvider';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';

const ProfileHeader = ({ user, token }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/${user._id}/profile-picture`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          setImageUrl(URL.createObjectURL(blob));
        }
      } catch (err) {
        console.error('Error loading profile picture:', err);
      }
    };

    if (user?._id) {
      fetchProfilePicture();
    }

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [user?._id, token]);

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
      <div className="flex items-center">
        <div className="h-20 w-20 rounded-full bg-white p-1 shadow-lg">
          <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <svg className="h-12 w-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
        </div>
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
          <p className="text-indigo-100">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user details');
        setUserDetails(await response.json());
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [token]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-600 rounded-full"/></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <ProfileHeader user={userDetails} token={token} />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900">Account Info</h3>
            <p className="text-sm text-gray-600">Email: {userDetails?.email}</p>
            <p className="text-sm text-gray-600">
              Joined: {new Date(userDetails?.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/create" className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Create Event
              </Link>
              <Link to="/events" className="block w-full text-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
