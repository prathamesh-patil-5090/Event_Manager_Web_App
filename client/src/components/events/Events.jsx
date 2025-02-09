import { useState, useEffect } from 'react';
import EventCard from './EventCard';
import { useAuth } from '../hooks/AuthProvider';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/events`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
      console.log(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchEvents}
          className="mt-4 text-indigo-600 hover:text-indigo-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
        {isAuthenticated && (
          <Link 
            to="/create" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create Event
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No events available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
