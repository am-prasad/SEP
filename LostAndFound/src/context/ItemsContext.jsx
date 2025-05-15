import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, ItemStatus, MatchedItem } from '@/types';
import { mockItems } from '@/data/mockData';
import { toast } from 'sonner';

const ItemsContext = createContext(undefined);

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

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setItems(mockItems);
      setLoading(false);
    };
    initializeData();
  }, []);

  const addItem = async (item) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    setItems(prevItems => [...prevItems, newItem]);
    toast.success("Item reported successfully!");
    return newItem;
  };

  const getItemById = (id) => {
    return items.find(item => item.id === id);
  };

  const updateItem = async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    let updatedItem;
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          updatedItem = { ...item, ...updates };
          return updatedItem;
        }
        return item;
      })
    );

    if (updatedItem) {
      toast.success("Item updated successfully!");
    }

    return updatedItem;
  };

  const deleteItem = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success("Item deleted successfully!");
    return true;
  };

  const findMatches = async (searchItem) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const oppositeStatus = searchItem.status === 'lost' ? 'found' : 'lost';
    const potentialMatches = items.filter(item => item.status === oppositeStatus);

    const matches = potentialMatches.map(item => {
      let score = 0;

      if (searchItem.category && item.category === searchItem.category) {
        score += 30;
      }

      if (searchItem.title && item.title) {
        const searchWords = searchItem.title.toLowerCase().split(' ');
        const itemWords = item.title.toLowerCase().split(' ');

        searchWords.forEach(word => {
          if (word.length > 3 && itemWords.includes(word)) {
            score += 30 / searchWords.length;
          }
        });
      }

      if (searchItem.description && item.description) {
        const searchWords = searchItem.description.toLowerCase().split(' ');
        const itemWords = item.description.toLowerCase().split(' ');

        searchWords.forEach(word => {
          if (word.length > 3 && itemWords.includes(word)) {
            score += 20 / searchWords.length;
          }
        });
      }

      if (searchItem.location && item.location) {
        const distance = calculateDistance(
          searchItem.location.lat,
          searchItem.location.lng,
          item.location.lat,
          item.location.lng
        );

        if (distance < 0.5) {
          score += 20;
        } else if (distance < 1) {
          score += 10;
        }
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
      if (status && item.status !== status) {
        return false;
      }

      if (category && category !== 'all' && item.category !== category) {
        return false;
      }

      if (query && query.length > 0) {
        const searchLower = query.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(searchLower) || false;
        const descMatch = item.description?.toLowerCase().includes(searchLower) || false;
        return titleMatch || descMatch;
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
