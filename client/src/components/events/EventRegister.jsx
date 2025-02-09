import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';
import { API_URL } from '../../config';

const StatusMessage = ({ message, type }) => (
  <div className={`
    p-4 rounded-lg shadow-sm border-l-4 
    ${type === 'success' 
      ? 'bg-green-50 border-green-500 text-green-700' 
      : 'bg-red-50 border-red-500 text-red-700'}
  `}>
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {type === 'success' ? (
          <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  </div>
);

const DEFAULT_IMAGE = 'https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=';

const EventRegister = () => {
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isEventPassed = (eventDate) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    return eventTime < now;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const checkIfCreator = async () => {
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

    const fetchEventAndStatus = async () => {
      try {
        await checkIfCreator();
        
        const eventResponse = await fetch(`${API_URL}/api/events/${id}`);
        if (!eventResponse.ok) throw new Error('Event not found');
        const eventData = await eventResponse.json();
        setEvent(eventData);

        if (!isCreator) {
          const statusResponse = await fetch(`${API_URL}/api/events/${id}/registration-status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (statusResponse.ok) {
            const { isRegistered: registrationStatus } = await statusResponse.json();
            setIsRegistered(registrationStatus);
          }
        }

        if (eventData.image) {
          const imageResponse = await fetch(`${API_URL}/api/events/${id}/image`);
          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            setImageUrl(URL.createObjectURL(blob));
          } else {
            setImageUrl(DEFAULT_IMAGE);
          }
        } else {
          setImageUrl(DEFAULT_IMAGE);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setImageUrl(DEFAULT_IMAGE);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndStatus();

    const checkEventStatus = async () => {
      if (event && isEventPassed(event.date)) {
        navigate(`/events/${id}`);
      }
    };

    checkEventStatus();
  }, [event, id, isAuthenticated, navigate, token]);

  const fetchEventDetails = async () => {
    try {
      const eventResponse = await fetch(`${API_URL}/api/events/${id}`);
      if (!eventResponse.ok) throw new Error('Event not found');
      const eventData = await eventResponse.json();
      setEvent(eventData);
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  const handleRegistration = async () => {
    if (event && isEventPassed(event.date)) {
      setError('Registration for this event has closed');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/events/${id}/${isRegistered ? 'unregister' : 'register'}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update registration');
      }

      setIsRegistered(!isRegistered);
      await fetchEventDetails();

    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">Event not found</p>
          <Link to="/events" className="mt-4 text-indigo-600 hover:text-indigo-800">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {event && (
          <div className="relative h-48 mb-6">
            <img
              src={imageUrl || DEFAULT_IMAGE}
              alt={event.title}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
        
        <div className="space-y-4 mb-6">
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
          
          <div className="flex items-center text-gray-600">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {event.location}
          </div>

          <div className="flex items-center text-gray-600">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {event.participants?.length || 0} Participants
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-md ${
            isCreator ? 'bg-gray-50' :
            isRegistered ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <p className={`text-sm ${
              isCreator ? 'text-gray-700' :
              isRegistered ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {isCreator 
                ? 'You cannot register for your own event' 
                : isRegistered 
                  ? 'You are registered for this event' 
                  : 'You are not registered for this event'}
            </p>
          </div>

          <div className={`p-4 rounded-lg shadow-sm border-l-4
            ${isRegistered 
              ? 'bg-green-50 border-green-500' 
              : 'bg-yellow-50 border-yellow-500'}
          `}>
            <div className="flex">
              <div className="flex-shrink-0">
                {isRegistered ? (
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isRegistered ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isRegistered 
                    ? 'You are currently registered for this event' 
                    : 'You are not registered for this event'}
                </p>
              </div>
            </div>
          </div>

          {isEventPassed(event?.date) && (
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-4">
              <p className="text-gray-700">Registration Closed</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleRegistration}
              disabled={actionLoading || isCreator || isEventPassed(event?.date)}
              className={`flex-1 py-3 px-4 rounded-md text-white font-medium transition-colors
                ${isCreator 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isEventPassed(event?.date)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isRegistered 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'}
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isCreator 
                ? 'Event Creator' 
                : isEventPassed(event?.date)
                  ? 'Registration Closed'
                  : actionLoading 
                    ? <span>Processing...</span>
                    : isRegistered ? 'Cancel Registration' : 'Register for Event'}
            </button>

            <Link
              to={`/events/${id}`}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back to Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegister;