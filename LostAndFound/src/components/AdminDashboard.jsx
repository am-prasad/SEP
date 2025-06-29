import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminDashboard = () => {
  const [collegeUsers, setCollegeUsers] = useState([]);
  const [guestUsers, setGuestUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [collegeRes, guestRes, itemsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/users/college`),
        fetch(`${BACKEND_URL}/api/admin/users/guest`),
        fetch(`${BACKEND_URL}/api/items`)
      ]);

      const [collegeData, guestData, itemsData] = await Promise.all([
        collegeRes.json(),
        guestRes.json(),
        itemsRes.json()
      ]);

      // Filter lost and found from the combined item data
      const lostData = itemsData.filter(item => item.status === 'lost');
      const foundData = itemsData.filter(item => item.status === 'found');

      setCollegeUsers(collegeData);
      setGuestUsers(guestData);
      setLostItems(lostData);
      setFoundItems(foundData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUserClick = (index, type) => {
    if (expandedUser?.type === type && expandedUser.index === index) {
      setExpandedUser(null);
    } else {
      setExpandedUser({ type, index });
      setExpandedItem(null);
    }
  };

  const handleItemClick = (index, type) => {
    if (expandedItem?.type === type && expandedItem.index === index) {
      setExpandedItem(null);
    } else {
      setExpandedItem({ type, index });
      setExpandedUser(null);
    }
  };

  if (loading) return <p className="p-4 text-center text-lg">Loading dashboard...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          onClick={() => navigate('/')}
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* College Users */}
        <Section
          title={`📘 College Users (${collegeUsers.length})`}
          data={collegeUsers}
          renderItem={(user, idx) => (
            <>
              <div
                className="cursor-pointer"
                onClick={() => handleUserClick(idx, 'college')}
                title="Click to view SR No and Branch"
              >
                {user.name} — <span className="text-gray-600">{user.email}</span>
              </div>
              {expandedUser?.type === 'college' && expandedUser.index === idx && (
                <DetailsBox onClose={() => setExpandedUser(null)}>
                  <p><strong>SR No:</strong> {user.srNo || 'N/A'}</p>
                  <p><strong>Branch:</strong> {user.department || 'N/A'}</p>
                </DetailsBox>
              )}
            </>
          )}
        />

        {/* Guest Users */}
        <Section
          title={`👤 Guest Users (${guestUsers.length})`}
          data={guestUsers}
          renderItem={(user, idx) => (
            <>
              <div
                className="cursor-pointer"
                onClick={() => handleUserClick(idx, 'guest')}
                title="Click to view mobile"
              >
                {user.mobile}
              </div>
              {expandedUser?.type === 'guest' && expandedUser.index === idx && (
                <DetailsBox onClose={() => setExpandedUser(null)}>
                  <p><strong>Mobile:</strong> {user.mobile || 'N/A'}</p>
                </DetailsBox>
              )}
            </>
          )}
        />

        {/* Lost Items */}
        <Section
          title={`📍 Lost Items (${lostItems.length})`}
          data={lostItems}
          renderItem={(item, idx) => (
            <>
              <div
                className="cursor-pointer"
                onClick={() => handleItemClick(idx, 'lost')}
                title="Click to view contact and location"
              >
                <strong>{item.title}</strong> — <span className="text-gray-600">{item.description}</span>
              </div>
              {expandedItem?.type === 'lost' && expandedItem.index === idx && (
                <DetailsBox onClose={() => setExpandedItem(null)}>
                  <p><strong>Contact Info:</strong> {item.contactInfo || 'N/A'}</p>
                  <p><strong>Location:</strong> {formatLocation(item.location)}</p>
                </DetailsBox>
              )}
            </>
          )}
        />

        {/* Found Items */}
        <Section
          title={`🎒 Found Items (${foundItems.length})`}
          data={foundItems}
          renderItem={(item, idx) => (
            <>
              <div
                className="cursor-pointer"
                onClick={() => handleItemClick(idx, 'found')}
                title="Click to view contact and location"
              >
                <strong>{item.title}</strong> — <span className="text-gray-600">{item.description}</span>
              </div>
              {expandedItem?.type === 'found' && expandedItem.index === idx && (
                <DetailsBox onClose={() => setExpandedItem(null)}>
                  <p><strong>Contact Info:</strong> {item.contactInfo || 'N/A'}</p>
                  <p><strong>Location:</strong> {formatLocation(item.location)}</p>
                </DetailsBox>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
};

// Formats a location object or string for display
const formatLocation = (location) => {
  if (!location) return 'N/A';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const { description, lat, lng } = location;
    return `${description || 'Unknown'} (${lat}, ${lng})`;
  }
  return 'N/A';
};

// Reusable details box
const DetailsBox = ({ children, onClose }) => (
  <div className="mt-2 p-3 bg-blue-50 border border-blue-300 rounded relative text-sm text-blue-900">
    <button
      onClick={onClose}
      className="absolute top-1 right-2 text-blue-700 hover:text-blue-900 font-bold"
      aria-label="Close details"
    >
      &times;
    </button>
    {children}
  </div>
);

// Section wrapper
const Section = ({ title, data, renderItem }) => (
  <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <ul className="space-y-3 max-h-80 overflow-auto">
      {data.length > 0 ? (
        data.map((item, idx) => (
          <li key={idx} className="bg-gray-50 p-3 rounded hover:bg-gray-100">
            {renderItem(item, idx)}
          </li>
        ))
      ) : (
        <p className="text-sm text-gray-500">No data available</p>
      )}
    </ul>
  </div>
);

export default AdminDashboard;
