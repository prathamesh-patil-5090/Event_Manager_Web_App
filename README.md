# Event Manager Application

A real-time event management application built with React, Node.js, Express, and MongoDB, featuring Socket.IO for live updates.

## Features

- User authentication and authorization
- Create, read, update, and delete events
- Real-time event updates using Socket.IO
- User profile management
- CORS-enabled API endpoints
- Secure MongoDB integration

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository
```bash
git clone [your-repository-url]
cd Event_Manager_Web_App
```

2. Environment Setup
Create a .env file in the server directory with the following variables:
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ALLOWED_ORIGINS=http://localhost:3000,http://your-production-domain
JWT_SECRET=your_jwt_secret
```

3. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

4. Start the Application
```bash
# Start the server (from server directory)
npm start

# Start the client (from client directory)
npm start
```

## API Endpoints

### Authentication Routes `/api/auth`
- `POST /register` - Register new user with optional profile picture
- `POST /login` - Login with email/username and password
- `GET /me` - Get current user profile
- `GET /me/profile-picture` - Get user's profile picture
- `PUT /me/profile-picture` - Update profile picture
- `DELETE /me/profile-picture` - Delete profile picture

### Event Routes `/api/events`
- `GET /` - Get all events
- `POST /` - Create new event
- `GET /:id` - Get specific event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `GET /:id/image` - Get event image
- `DELETE /:id/image` - Delete event image
- `GET /my-events` - Get user's created events
- `GET /creator/:username` - Get events by creator
- `POST /:eventId/register` - Register for an event
- `POST /:eventId/unregister` - Unregister from an event
- `GET /:id/registration-status` - Check registration status
- `GET /:id/image` - Get event image

### User Routes `/api/users`
- `GET /:user_id` - Get user profile
- `GET /:user_id/profile-picture` - Get user's profile picture

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
