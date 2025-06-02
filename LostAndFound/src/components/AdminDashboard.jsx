import React, { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const AdminDashboard = () => {
  const [collegeUsers, setCollegeUsers] = useState([]);
  const [guestUsers, setGuestUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegeRes, guestRes, lostRes, foundRes] = await Promise.all([
          fetch(`http://localhost:3000/api/admin/users/college`),
          fetch(`http://localhost:3000/api/admin/users/guest`),
          fetch(`http://localhost:3000/api/admin/items/lost`),
          fetch(`http://localhost:3000/api/admin/items/found`),
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

    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">College Users</h2>
        <ul className="space-y-1">
          {collegeUsers.map((user, idx) => (
            <li key={idx} className="border p-2 rounded">{user.name} - {user.email}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Guest Users</h2>
        <ul className="space-y-1">
          {guestUsers.map((user, idx) => (
            <li key={idx} className="border p-2 rounded">{user.mobile}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Lost Items</h2>
        <ul className="space-y-1">
          {lostItems.map((item, idx) => (
            <li key={idx} className="border p-2 rounded">{item.name} - {item.description}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Found Items</h2>
        <ul className="space-y-1">
          {foundItems.map((item, idx) => (
            <li key={idx} className="border p-2 rounded">{item.name} - {item.description}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;
