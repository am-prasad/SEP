import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ;

const AdminDashboard = () => {
  const [collegeUsers, setCollegeUsers] = useState([]);
  const [guestUsers, setGuestUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ Fetch function
  const fetchData = async () => {
    try {
      const [collegeRes, guestRes, lostRes, foundRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/users/college`),
        fetch(`${BACKEND_URL}/api/admin/users/guest`),
        fetch(`${BACKEND_URL}/api/admin/items/lost`),
        fetch(`${BACKEND_URL}/api/admin/items/found`),
      ]);

      const [collegeData, guestData, lostData, foundData] = await Promise.all([
        collegeRes.json(),
        guestRes.json(),
        lostRes.json(),
        foundRes.json(),
      ]);

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

  // ✅ useEffect for initial load & real-time updates
  useEffect(() => {
    fetchData(); // initial fetch

    const interval = setInterval(() => {
      fetchData(); // refresh every 10 seconds
    }, 10000);

    return () => clearInterval(interval); // cleanup
  }, []);

  if (loading) return <p className="p-4 text-center text-lg">Loading dashboard...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          onClick={() => navigate('/')}
        >
          Logout
        </button>
      </div>

      {/* Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Section
          title={`📘 College Users (${collegeUsers.length})`}
          data={collegeUsers}
          renderItem={(user) => (
            <div>{user.name} — <span className="text-gray-600">{user.email}</span></div>
          )}
        />

        <Section
          title={`👤 Guest Users (${guestUsers.length})`}
          data={guestUsers}
          renderItem={(user) => (
            <div>{user.mobile}</div>
          )}
        />

        <Section
          title={`📍 Lost Items (${lostItems.length})`}
          data={lostItems}
          renderItem={(item) => (
            <div>
              <strong>{item.title}</strong> — <span className="text-gray-600">{item.description}</span>
            </div>
          )}
        />

        <Section
          title={`🎒 Found Items (${foundItems.length})`}
          data={foundItems}
          renderItem={(item) => (
            <div>
              <strong>{item.title}</strong> — <span className="text-gray-600">{item.description}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
};

// ✅ Reusable Card Section Component
const Section = ({ title, data, renderItem }) => (
  <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <ul className="space-y-3 max-h-80 overflow-auto">
      {data.length > 0 ? (
        data.map((item, idx) => (
          <li key={idx} className="bg-gray-50 p-3 rounded hover:bg-gray-100">
            {renderItem(item)}
          </li>
        ))
      ) : (
        <p className="text-sm text-gray-500">No data available</p>
      )}
    </ul>
  </div>
);

export default AdminDashboard;
