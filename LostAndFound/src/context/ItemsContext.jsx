import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const ItemsContext = createContext(undefined);
const API_BASE_URL = 'http://localhost:5000/api/items';

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE_URL);
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        toast.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const addItem = async (item) => {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!res.ok) throw new Error('Failed to add item');
      const newItem = await res.json();
      setItems(prev => [...prev, newItem]);
      toast.success('Item reported successfully!');
      return newItem;
    } catch (error) {
      console.error(error);
      toast.error('Failed to report item');
      return null;
    }
  };

  const getItemById = (id) => {
    return items.find(item => item._id === id); // Use MongoDB _id
  };

  const updateItem = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update item');
      const updated = await res.json();

      setItems(prev =>
        prev.map(item => (item._id === id ? updated : item))
      );

      toast.success('Item updated successfully!');
      return updated;
    } catch (error) {
      console.error(error);
      toast.error('Failed to update item');
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete item');

      setItems(prev => prev.filter(item => item._id !== id));
      toast.success('Item deleted successfully!');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete item');
      return false;
    }
  };

  const findMatches = async (searchItem) => {
    const oppositeStatus = searchItem.status === 'lost' ? 'found' : 'lost';
    const potentialMatches = items.filter(item => item.status === oppositeStatus);

    const matches = potentialMatches.map(item => {
      let score = 0;

      if (searchItem.category && item.category === searchItem.category) score += 30;

      if (searchItem.title && item.title) {
        const searchWords = searchItem.title.toLowerCase().split(' ');
        const itemWords = item.title.toLowerCase().split(' ');

        searchWords.forEach(word => {
          if (word.length > 3 && itemWords.includes(word)) score += 30 / searchWords.length;
        });
      }

      if (searchItem.description && item.description) {
        const searchWords = searchItem.description.toLowerCase().split(' ');
        const itemWords = item.description.toLowerCase().split(' ');

        searchWords.forEach(word => {
          if (word.length > 3 && itemWords.includes(word)) score += 20 / searchWords.length;
        });
      }

      if (searchItem.location && item.location) {
        const distance = calculateDistance(
          searchItem.location.lat,
          searchItem.location.lng,
          item.location.lat,
          item.location.lng
        );

        if (distance < 0.5) score += 20;
        else if (distance < 1) score += 10;
      }

      return { item, matchScore: score };
    });

    return matches
      .filter(match => match.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  };

  const filterItems = (status, category, query) => {
    return items.filter(item => {
      if (status && item.status !== status) return false;
      if (category && category !== 'all' && item.category !== category) return false;

      if (query?.length > 0) {
        const q = query.toLowerCase();
        return item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
      }

      return true;
    });
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        loading,
        addItem,
        getItemById,
        updateItem,
        deleteItem,
        findMatches,
        filterItems,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
