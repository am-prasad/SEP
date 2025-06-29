// src/context/ItemsContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/* CONFIG                                                                     */
/* -------------------------------------------------------------------------- */

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const ITEMS_URL = `${BASE}/api/items`;

/* -------------------------------------------------------------------------- */
/* CONTEXT                                                                    */
/* -------------------------------------------------------------------------- */

const ItemsContext = createContext(undefined);

export const useItems = () => {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error('useItems must be used within an ItemsProvider');
  return ctx;
};

/* -------------------------------------------------------------------------- */
/* PROVIDER                                                                   */
/* -------------------------------------------------------------------------- */

export const ItemsProvider = ({ children }) => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------ Fetch items on mount ------------ */
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        console.log('Fetching items from:', ITEMS_URL);
        const res = await fetch(ITEMS_URL);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch items:', err);
        toast.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  /* ------------ CRUD helpers ------------ */

  const addItem = async (item) => {
    try {
      const formData = new FormData();
      formData.append('title',        item.title);
      formData.append('description',  item.description);
      formData.append('category',     item.category);
      formData.append('status',       item.status);
      formData.append('contactInfo',  item.contactInfo);
      formData.append('reportedBy',   item.reportedBy || 'Anonymous');
      formData.append('location',     JSON.stringify(item.location));
      formData.append('image',        item.image); // File object

      const res = await fetch(ITEMS_URL, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const newItem = await res.json();
      setItems(prev => [...prev, newItem]);
      toast.success('Item reported successfully!');
      return newItem;
    } catch (err) {
      console.error('addItem error:', err);
      toast.error('Failed to report item');
      return null;
    }
  };

  const updateItem = async (id, updates) => {
    try {
      const res = await fetch(`${ITEMS_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const updated = await res.json();

      setItems(prev => prev.map(it => (it._id === id ? updated : it)));
      toast.success('Item updated successfully!');
      return updated;
    } catch (err) {
      console.error('updateItem error:', err);
      toast.error('Failed to update item');
      return null;
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(`${ITEMS_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      setItems(prev => prev.filter(it => it._id !== id));
      toast.success('Item deleted successfully!');
      return true;
    } catch (err) {
      console.error('deleteItem error:', err);
      toast.error('Failed to delete item');
      return false;
    }
  };

  /* ------------ Helpers ------------ */

  const getItemById = (id) => items.find(it => it._id === id);

  const findMatches = async (searchItem) => {
    const opposite   = searchItem.status === 'lost' ? 'found' : 'lost';
    const candidates = items.filter(i => i.status === opposite);

    return candidates
      .map(it => ({
        item: it,
        matchScore: calculateMatchScore(searchItem, it),
      }))
      .filter(m => m.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  };

  const filterItems = (status, category, query) =>
    items.filter(it => {
      if (status   && it.status   !== status)            return false;
      if (category && category !== 'all' &&
          it.category !== category)                      return false;
      if (query?.length) {
        const q = query.toLowerCase();
        return (
          it.title?.toLowerCase().includes(q) ||
          it.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });

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

/* -------------------------------------------------------------------------- */
/* UTILS                                                                      */
/* -------------------------------------------------------------------------- */

const hasCoords = (loc) =>
  loc &&
  Number.isFinite(loc.lat) &&
  Number.isFinite(loc.lng);

const calculateMatchScore = (a, b) => {
  let score = 0;
  if (a.category && b.category === a.category) score += 30;

  score += keywordScore(a.title,       b.title,       30);
  score += keywordScore(a.description, b.description, 20);

  if (hasCoords(a.location) && hasCoords(b.location)) {
    const d = haversine(
      a.location.lat, a.location.lng,
      b.location.lat, b.location.lng
    );
    if (d < 0.5) score += 20;
    else if (d < 1) score += 10;
  }

  return score;
};

const keywordScore = (textA, textB, max) => {
  if (!textA || !textB) return 0;
  const aWords = textA.toLowerCase().split(/\s+/);
  const bWords = textB.toLowerCase().split(/\s+/);
  let score = 0;
  aWords.forEach(w => {
    if (w.length > 3 && bWords.includes(w)) score += max / aWords.length;
  });
  return score;
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const R  = 6371; // km
  const d1 = deg2rad(lat2 - lat1);
  const d2 = deg2rad(lon2 - lon1);
  const a  =
    Math.sin(d1 / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(d2 / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const deg2rad = (deg) => deg * (Math.PI / 180);
