import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const DEFAULT_IMAGE = 'https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=';

const EventCard = ({ event }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const { isAuthenticated, token } = useAuth();

  const isEventPassed = (eventDate) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    return eventTime < now;
  };

  useEffect(() => {
    const fetchEventImage = async () => {
      if (!event.image) {
        setImageUrl(DEFAULT_IMAGE);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/events/${event._id}/image`);
        if (response.ok) {
          const blob = await response.blob();
          setImageUrl(URL.createObjectURL(blob));
        } else {
          setImageUrl(DEFAULT_IMAGE);
        }
      } catch (error) {
        console.error('Failed to fetch event image:', error);
        setImageUrl(DEFAULT_IMAGE);
      }
    };

    fetchEventImage();

    const checkIfCreator = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch(`${API_URL}/api/events/my-events`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const myEvents = await response.json();
          const isEventCreator = myEvents.some(evt => evt._id === event._id);
          setIsCreator(isEventCreator);
        }
      } catch (err) {
        console.error('Failed to check event ownership:', err);
      }
    };

    checkIfCreator();

    const checkRegistrationStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch(
          `${API_URL}/api/events/${event._id}/registration-status`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        if (response.ok) {
          const { isRegistered: status } = await response.json();
          setIsRegistered(status);
        }
      } catch (err) {
        console.error('Failed to check registration status:', err);
      }
    };

    checkRegistrationStatus();

    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [event._id, event.image, isAuthenticated, token]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-[1.02]">
      <Link to={`/events/${event._id}`}>
        <div className="relative w-full h-48">
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt={event.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-lg">No Image Available</div>
            </div>
          )}
        </div>
      </Link>
      <div className="p-6">
        <Link to={`/events/${event._id}`}>
          <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
            {event.title}
          </h3>
        </Link>
        <p className="mt-2 text-gray-600 line-clamp-2">{event.description}</p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {event.participants?.length || 0} Participants
          </span>
          
          {isEventPassed(event.date) ? (
            <div className="text-center py-2 px-4 bg-gray-100 rounded-md text-gray-600">
              Registration Closed
            </div>
          ) : !isAuthenticated ? (
            <Link 
              to="/login" 
              className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Login to Register
            </Link>
          ) : isCreator ? (
            <span className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed">
              Event Creator
            </span>
          ) : (
            <Link
              to={`/events/${event._id}/register`}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
                ${isRegistered 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isRegistered ? 'Registered' : 'Register Now'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
