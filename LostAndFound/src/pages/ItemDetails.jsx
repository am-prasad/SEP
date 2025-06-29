import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import MapPreview from '@/components/MapPreview';
import {
  Calendar,
  Check,
  ArrowLeft,
  Mail,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const [resolved, setResolved] = useState(false);

  /* ---------------- Fetch item ---------------- */
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/items/${id}`);
        if (!res.ok) throw new Error(`Item not found: ${res.status}`);
        const data = await res.json();
        setItem(data);
        setResolved(data.isResolved || false);
        fetchMatches(data);
      } catch (err) {
        console.error('Fetch item error:', err.message);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  /* ---------------- Possible matches ---------------- */
  const fetchMatches = async (currentItem) => {
    setLoadingMatches(true);
    try {
      const res = await fetch(`${API_BASE}/api/items`);
      const allItems = await res.json();

      const matches = allItems
        .filter(
          (i) =>
            i._id !== currentItem._id &&
            i.status !== currentItem.status &&
            i.category === currentItem.category
        )
        .map((i) => ({
          item: i,
          matchScore: Math.floor(Math.random() * 40) + 60,
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      setPotentialMatches(matches);
    } catch (err) {
      console.error('Match fetch failed:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  /* ---------------- Handlers ---------------- */
  const handleMarkAsResolved = () => {
    setResolved(true);
    alert('Item marked as resolved!');
    // OPTIONAL: send PATCH request to backend here.
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <p>Loading item details…</p>
      </div>
    );

  if (!item)
    return (
      <div className="flex justify-center py-8">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertTitle>Item not found</AlertTitle>
          <AlertDescription>
            The item you’re looking for doesn’t exist or has been removed.
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                Browse Items
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );

  return (
    <div className="flex justify-center py-6 pb-20 sm:pb-6">
      <div className="w-full max-w-screen-xl px-4">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{item.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={item.status === 'lost' ? 'destructive' : 'default'}>
                {item.status === 'lost' ? 'Lost' : 'Found'}
              </Badge>
              <Badge variant="outline">{item.category}</Badge>
              {resolved && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" /> Resolved
                </Badge>
              )}
            </div>
          </div>

          {!resolved && (
            <Button onClick={handleMarkAsResolved}>
              <Check className="h-4 w-4 mr-2" /> Mark as Resolved
            </Button>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left (tabs) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="matches">
                  Potential Matches {potentialMatches.length ? `(${potentialMatches.length})` : ''}
                </TabsTrigger>
              </TabsList>

              {/* DETAILS TAB */}
              <TabsContent value="details" className="mt-6">
                <Card>
                  {/* Image */}
                  {item.imageUrl && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={`${API_BASE}/uploads/${item.imageUrl}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardContent className="pt-6 space-y-4">
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Description
                      </h3>
                      <p>{item.description}</p>
                    </div>

                    {/* Date & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(item.date), 'MMMM d, yyyy h:mm a')}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {item.location?.description || 'Custom location'}
                      </div>
                    </div>

                    <Separator />

                    {/* Contact */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {item.contactInfo}
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/50 pb-6 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Reported by {item.reportedBy || 'Anonymous'} on{' '}
                      {format(new Date(item.date), 'MMMM d, yyyy')}
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* MATCHES TAB */}
              <TabsContent value="matches" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Potential Matches</CardTitle>
                    <CardDescription>
                      {item.status === 'lost'
                        ? 'Found items that might be yours'
                        : 'Lost items that might match this one'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {loadingMatches ? (
                      <p>Finding matches…</p>
                    ) : potentialMatches.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6">
                        No matches found.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {potentialMatches.map(({ item: match, matchScore }) => (
                          <Card key={match._id} className="p-4">
                            <div className="flex gap-4">
                              {match.imageUrl && (
                                <img
                                  src={`${API_BASE}/uploads/${match.imageUrl}`}
                                  className="w-24 h-24 object-cover rounded"
                                  alt={match.title}
                                />
                              )}
                              <div>
                                <h4 className="font-medium">{match.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {match.description}
                                </p>
                                <Badge className="mt-2">{matchScore}% Match</Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right (map) */}
          <div>
            {item.location?.lat != null && item.location?.lng != null ? (
              <MapPreview location={item.location} />
            ) : (
              <div className="text-muted-foreground text-sm italic px-2 py-4">
                No map data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
