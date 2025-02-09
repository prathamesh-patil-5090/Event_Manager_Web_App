import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthProvider';
import { API_URL } from '../../config';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const validateDateTime = (selectedDate) => {
    const now = new Date();
    const eventDate = new Date(selectedDate);
    
    now.setMinutes(now.getMinutes() + 1);
    
    if (eventDate < now) {
      setError('Event date and time cannot be in the past');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'date') {
      setError('');
      
      if (!validateDateTime(value)) {
        return;
      }
    }

    if (name === 'image') {
      setFormData(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;
    
    if (!validateDateTime(formData.date)) return;

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', new Date(formData.date).toISOString());
      formDataToSend.append('location', formData.location);

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const data = await response.json();
      console.log('Event created:', data);
      navigate('/events');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title || !formData.date) {
      setError('Title and date are required');
      return false;
    }
    return true;
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 required">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your event"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 required">Date and Time *</label>
            <input
              type="datetime-local"
              name="date"
              required
              min={getMinDateTime()}
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Event date and time must be in the future
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              required={true}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter event location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Event Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-500 
                       file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                       file:text-sm file:font-semibold file:bg-indigo-50 
                       file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload an image for your event (optional)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium 
                     text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm 
                     font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating...
              </span>
            ) : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
