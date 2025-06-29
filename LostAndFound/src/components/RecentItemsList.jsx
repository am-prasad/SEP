import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/* ------------------------------------------------------------------
   Build a BASE prefix only when we get just a filename (item.image).
   If item.imageUrl already contains “http”, we’ll use it directly.
-------------------------------------------------------------------*/
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const RecentItemsList = ({ items, loading }) => {
  /* ---------------- Skeleton while loading ---------------- */
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- No items ---------------- */
  if (!items || items.length === 0) {
    return <p className="text-muted-foreground">No items have been reported yet.</p>;
  }

  /* ---------------- Render list ---------------- */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => {
        const key = item._id || item.id || `fallback-${index}`;

        /* 1️⃣ If backend already gives a full URL in item.imageUrl, use it.
           2️⃣ Otherwise, if we only have the filename in item.image, prefix `${BASE}/uploads/`. */
        let imageSrc = null;
        if (item.imageUrl) {
          imageSrc = item.imageUrl.startsWith('http')
            ? item.imageUrl
            : `${BASE}/uploads/${item.imageUrl}`;
        } else if (item.image) {
          imageSrc = `${BASE}/uploads/${item.image}`;
        }

        return (
          <Link key={key} to={`/item/${item._id || item.id || ''}`}>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors border">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={item.title}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted flex items-center justify-center rounded-md">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium line-clamp-1">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={item.status === 'lost' ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {item.status === 'lost' ? 'Lost' : 'Found'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.location?.description || 'Custom location'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default RecentItemsList;
