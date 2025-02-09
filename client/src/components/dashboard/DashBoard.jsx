import React from 'react';
import Profile from '../Profile/Profile';
import MyEvents from '../events/MyEvents';

const DashBoard = () => {
  return (
    <div className="space-y-8">
      <div>
        <Profile />
      </div>
      <div>
        <MyEvents />
      </div>
    </div>
  );
};

export default DashBoard;
