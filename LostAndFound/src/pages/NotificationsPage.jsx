import React, { useEffect } from 'react';
import { useItems } from '@/context/ItemsContext';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { items, loading } = useItems();

  useEffect(() => {
    console.log('items:', items);
  }, [items]);

  // Temporarily no filtering on createdAt:
  const recentItems = [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Recent Reports</h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin w-6 h-6" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : recentItems.length === 0 ? (
        <p>No items reported yet.</p>
      ) : (
        <ul className="space-y-4">
          {recentItems.slice(0, 10).map((item) => (
            <li key={item._id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-sm text-muted-foreground">
                Reported by <strong>{item.reportedBy || 'Anonymous'}</strong> –{' '}
                {item.location?.name || ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.createdAt
                  ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                  : ''}
              </p>
              <p className="mt-2">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
