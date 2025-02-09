import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';
import { API_URL } from '../../config';

const DEFAULT_IMAGE = 'https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=';

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/events/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Event not found');
        }

        const data = await response.json();
        setEvent(data);

        if (data.image) {
          try {
            const imageResponse = await fetch(`${API_URL}/api/events/${id}/image`, {
              headers: {
                'Accept': 'image/*',
              },
            });
            
            if (imageResponse.ok) {
              const blob = await imageResponse.blob();
              const url = URL.createObjectURL(blob);
              setImageUrl(url);
            } else {
              setImageUrl(DEFAULT_IMAGE);
            }
          } catch (imageError) {
            console.error('Image fetch error:', imageError);
            setImageUrl(DEFAULT_IMAGE);
          }
        } else {
          setImageUrl(DEFAULT_IMAGE);
        }
      } catch (err) {
        console.error('Event fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }

    const checkRegistrationStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch(
          `${API_URL}/api/events/${id}/registration-status`,
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

    if (isAuthenticated) {
      checkRegistrationStatus();
    }

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
          const isEventCreator = myEvents.some(event => event._id === id);
          setIsCreator(isEventCreator);
        }
      } catch (err) {
        console.error('Error checking event ownership:', err);
      }
    };

    checkIfCreator();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [id, isAuthenticated, token]);

  const isEventPassed = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    return event < now;
  };

  const getRegistrationButton = () => {
    if (!isAuthenticated) {
      return (
        <Link
          to="/login"
          className="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Login to Register
        </Link>
      );
    }

    if (isCreator) {
      return (
        <div className="block w-full text-center py-3 px-4 bg-gray-400 text-white rounded-md cursor-not-allowed">
          You are the event creator
        </div>
      );
    }

    if (isEventPassed(event.date)) {
      return (
        <div className="block w-full text-center py-3 px-4 bg-gray-500 text-white rounded-md cursor-not-allowed">
          Event Registration Closed
        </div>
      );
    }

    return (
      <Link
        to={`/events/${event._id}/register`}
        className={`block w-full text-center py-3 px-4 rounded-md transition-colors
          ${isRegistered 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
      >
        {isRegistered ? 'Modify Registration' : 'Register for Event'}
      </Link>
    );
  };

  const formatDescription = (text) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className={`mb-4 ${line.trim() === '' ? 'mt-6' : ''}`}>
        {line}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-red-600">
            {error || 'Failed to load event details'}
          </h2>
          <Link 
            to="/events" 
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-96">
        <img
          src={imageUrl || DEFAULT_IMAGE}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="mt-2 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-gray-600">
            {event.participants?.length || 0} Participants
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900">About This Event</h2>
          <div className="text-gray-600 whitespace-pre-line leading-relaxed">
            {formatDescription(event.description)}
          </div>
        </div>

        {isEventPassed(event.date) && (
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  Registration Closed
                </p>
              </div>
            </div>
          </div>
        )}

        {getRegistrationButton()}
      </div>
    </div>
  );
};

export default EventDetails;
