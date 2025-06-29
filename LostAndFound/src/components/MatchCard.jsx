import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import { format } from 'date-fns';

const MatchCard = ({ item, matchScore }) => {
  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="sm:col-span-1">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full aspect-square object-cover rounded"
            />
          ) : (
            <div className="w-full aspect-square bg-accent flex items-center justify-center rounded">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
        
        <div className="sm:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{item.title}</h3>
              <Badge variant={item.status === 'lost' ? 'destructive' : 'default'} className="mt-1">
                {item.status === 'lost' ? 'Lost' : 'Found'}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {item.description}
          </p>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-xs flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
              {format(new Date(item.date), 'MMM d, yyyy')}
            </div>
            <div className="text-xs flex items-center">
              <MapPinIcon className="h-3 w-3 mr-1 text-muted-foreground" />
              {item.location.description || 'Custom location'}
            </div>
          </div>
        </div>
        
        <div className="sm:col-span-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Match score</p>
            <div className="flex items-center gap-2 mb-2">
              <Progress value={matchScore} className="h-2" />
              <span className="text-sm font-medium">{matchScore}%</span>
            </div>
          </div>
          
          <Button asChild size="sm" className="w-full">
            <Link to={`/item/${item.id}`}>
              View Item
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
