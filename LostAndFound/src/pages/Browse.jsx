import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useItems } from '@/context/ItemsContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ItemCard from '@/components/ItemCard';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterItems, loading } = useItems();

  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (category !== 'all') params.set('category', category);
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);

    const statusFilter = status === 'all' ? undefined : status;
    const categoryFilter = category === 'all' ? undefined : category;
    const items = filterItems(statusFilter, categoryFilter, searchQuery);
    setFilteredItems(items);
  }, [status, category, searchQuery, filterItems, setSearchParams]);

  const resetFilters = () => {
    setStatus('all');
    setCategory('all');
    setSearchQuery('');
  };

  const hasActiveFilters = status !== 'all' || category !== 'all' || searchQuery !== '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-6 pb-20 bg-white">
      <div className="w-full max-w-6xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Items</h1>
          <p className="text-muted-foreground mb-6">
            Search and filter through all lost and found items on campus
          </p>

          <div className="bg-accent p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={status} onValueChange={(value) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="lost">Lost Items</SelectItem>
                    <SelectItem value="found">Found Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="keys">Keys</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search items"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" /> Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={`loading-skeleton-${i}`} className="border rounded-lg p-4">
                <Skeleton className="h-[200px] w-full rounded-md mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">
              Try changing your filters or search criteria
            </p>
            <Button onClick={resetFilters}>Show All Items</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              // Use item.id if exists, otherwise fallback to index to avoid React warnings
              <ItemCard key={item.id ?? index} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
