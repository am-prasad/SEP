import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ArrowLeft, Mail, Check } from 'lucide-react';
import { format } from 'date-fns';

const MatchCard = ({ item, matchScore }) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {item.imageUrl && (
          <div className="sm:w-1/3 aspect-video sm:aspect-square overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={item.status === 'lost' ? 'destructive' : 'default'}>
                  {item.status === 'lost' ? 'Lost' : 'Found'}
                </Badge>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                {matchScore}% Match
              </span>
            </div>
          </div>
          
          <p className="text-sm line-clamp-2 mt-2 text-muted-foreground">
            {item.description}
          </p>
          
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{item.location.description}</span>
            <span className="mx-2">•</span>
            <Calendar className="h-3 w-3 mr-1" />
            <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="mt-3">
            <Button className="w-full sm:w-auto">View Details</Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const ItemDetails = ({ itemId, onBack, itemsData }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  
  useEffect(() => {
    if (!itemId) return;
    
    const fetchItem = () => {
      // Simulate fetching from data
      const fetchedItem = itemsData.find(item => item.id === itemId);
      setItem(fetchedItem);
      setLoading(false);
      
      if (fetchedItem) {
        fetchMatches(fetchedItem);
      }
    };
    
    fetchItem();
  }, [itemId, itemsData]);
  
  const fetchMatches = async (currentItem) => {
    setLoadingMatches(true);
    try {
      // Simulate API call to find matches
      // In a real app this would be an actual API call
      setTimeout(() => {
        const matches = itemsData
          .filter(i => 
            i.id !== currentItem.id && 
            i.status !== currentItem.status && 
            i.category === currentItem.category
          )
          .map(item => ({
            item,
            matchScore: Math.floor(Math.random() * 40) + 60 // Random score between 60-99
          }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5);
        
        setPotentialMatches(matches);
        setLoadingMatches(false);
      }, 1000);
    } catch (error) {
      console.error('Error finding matches:', error);
      setLoadingMatches(false);
    }
  };
  
  const handleMarkAsResolved = () => {
    if (!item) return;
    
    try {
      // Simulate updating item
      const updatedItem = { ...item, isResolved: true };
      setItem(updatedItem);
      alert("Item marked as resolved! Thank you for updating.");
    } catch (error) {
      console.error('Error updating item:', error);
      alert("Failed to update item status.");
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading item details...</p>
        </div>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertTitle>Item not found</AlertTitle>
          <AlertDescription>
            The item you're looking for doesn't exist or has been removed.
            <div className="mt-4">
              <Button variant="outline" onClick={() => onBack()}>
                Browse Items
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container py-6 pb-20 sm:pb-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{item.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={item.status === 'lost' ? 'destructive' : 'default'}>
                {item.status === 'lost' ? 'Lost' : 'Found'}
              </Badge>
              <Badge variant="outline">{item.category}</Badge>
              {item.isResolved && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" /> Resolved
                </Badge>
              )}
            </div>
          </div>
          
          {!item.isResolved && (
            <Button onClick={handleMarkAsResolved}>
              <Check className="h-4 w-4 mr-2" /> Mark as Resolved
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="matches">
                Potential Matches {potentialMatches.length > 0 && `(${potentialMatches.length})`}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                {item.imageUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="mt-1">{item.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                        <div className="mt-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(item.date), 'MMMM d, yyyy')} at {format(new Date(item.date), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                        <div className="mt-1 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{item.location.description || 'Custom location'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                      <div className="mt-1 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{item.contactInfo}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 pb-6 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Reported by {item.reportedBy || 'Anonymous'} on {format(new Date(item.date), 'MMMM d, yyyy')}
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="matches" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Potential Matches</CardTitle>
                  <CardDescription>
                    {item.status === 'lost'
                      ? 'Items that someone has found that might be yours'
                      : 'Items that someone has reported as lost that might match'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {loadingMatches ? (
                    <p>Finding potential matches...</p>
                  ) : potentialMatches.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        No potential matches found yet. Check back later!
                      </p>
                      <Button variant="outline" onClick={() => onBack()}>
                        Browse All Items
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {potentialMatches.map(({ item: matchedItem, matchScore }) => (
                        <MatchCard 
                          key={matchedItem.id} 
                          item={matchedItem} 
                          matchScore={matchScore} 
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Where this item was {item.status === 'lost' ? 'lost' : 'found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
             <div className="h-64 mb-3 overflow-hidden"> <MapPreview lat={item.location.lat} lng={item.location.lng} /> </div>
              <p className="text-sm">
                <span className="font-medium">{item.location.description || 'Custom location'}</span>
                <br />
                <span className="text-xs text-muted-foreground">
                  Coordinates: {item.location.lat.toFixed(6)}, {item.location.lng.toFixed(6)}
                </span>
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => alert('View map')}>
                View on Campus Map
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                Reach out about this {item.status === 'lost' ? 'lost' : 'found'} item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => alert(`Contact ${item.reportedBy || 'Reporter'}`)}>
                <Mail className="h-4 w-4 mr-2" />
                Contact Reporter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Example usage:
const App = () => {
  const [selectedItemId, setSelectedItemId] = useState('item-123');
  const [showDetails, setShowDetails] = useState(true);
  
  // Sample data - in a real app, this would come from an API or props
  const sampleItemsData = [
    {
      id: 'item-123',
      title: 'Blue Backpack',
      description: 'A navy blue Jansport backpack with a laptop and books inside.',
      status: 'lost',
      category: 'Bags',
      date: '2025-05-10T14:30:00Z',
      location: {
        lat: 42.3601,
        lng: -71.0589,
        description: 'Campus Center'
      },
      contactInfo: 'john.doe@example.edu',
      reportedBy: 'John Doe',
      isResolved: false,
      imageUrl: '/api/placeholder/400/300'
    },
    {
      id: 'item-456',
      title: 'Silver MacBook Pro',
      description: 'MacBook Pro 14" with stickers on the cover. Found in the library.',
      status: 'found',
      category: 'Electronics',
      date: '2025-05-12T09:15:00Z',
      location: {
        lat: 42.3602,
        lng: -71.0588,
        description: 'Main Library'
      },
      contactInfo: 'library@example.edu',
      reportedBy: 'Campus Library',
      isResolved: false,
      imageUrl: '/api/placeholder/400/300'
    }
  ];
  
  const handleBack = () => {
    setShowDetails(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showDetails ? (
        <ItemDetails 
          itemId={selectedItemId}
          onBack={handleBack}
          itemsData={sampleItemsData}
        />
      ) : (
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Lost & Found Items</h1>
          <Button onClick={() => setShowDetails(true)}>
            View Item Details
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;