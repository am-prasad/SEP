import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Plus } from 'lucide-react';
import { useItems } from '@/context/ItemsContext';
import RecentItemsList from '@/components/RecentItemsList';

const Home = () => {
  const { items, loading } = useItems();
  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  
  useEffect(() => {
    if (!loading) {
      setLostCount(items.filter(item => item.status === 'lost').length);
      setFoundCount(items.filter(item => item.status === 'found').length);
      
      // Get 6 most recent items
      const recent = [...items]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);
      setRecentItems(recent);
    }
  }, [items, loading]);
  
  return (
    <div className="container py-6 pb-20 sm:pb-6 h-screen w-screen">
      <section className="flex flex-col items-center text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4">CampoFound</h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-8">
          A simple way to report lost items and find what you're looking for on campus.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button asChild className="flex-1" size="lg">
            <Link to="/report">
              <Plus className="mr-2 h-5 w-5" />
              Report Item
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link to="/browse">
              <Search className="mr-2 h-5 w-5" />
              Browse Items
            </Link>
          </Button>
        </div>
      </section>
      
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Card className="card-hover bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800 text-xl">
              <span className="text-4xl font-bold mr-2">{lostCount}</span> Lost Items
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p>Items that have been reported missing on campus</p>
          </CardContent>
          <CardFooter>
            <Link to="/browse?status=lost">
              <Button variant="ghost" className="text-blue-700 hover:bg-blue-100">
                <Search className="mr-2 h-4 w-4" /> View Lost Items
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="card-hover bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800 text-xl">
              <span className="text-4xl font-bold mr-2">{foundCount}</span> Found Items
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-700">
            <p>Items that have been found and reported on campus</p>
          </CardContent>
          <CardFooter>
            <Link to="/browse?status=found">
              <Button variant="ghost" className="text-green-700 hover:bg-green-100">
                <Search className="mr-2 h-4 w-4" /> View Found Items
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </section>
      
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recently Reported</h2>
          <Link to="/browse" className="text-primary hover:underline flex items-center">
            View All <Search className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <RecentItemsList items={recentItems} loading={loading} />
      </section>
      
      <section className="text-center mb-10">
        <h2 className="text-2xl font-bold mb-4">Check the Map</h2>
        <p className="text-muted-foreground mb-6">
          See where items have been lost and found across campus
        </p>
        <Link to="/map">
          <Button variant="outline" size="lg">
            <MapPin className="mr-2 h-5 w-5" /> Open Campus Map
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
