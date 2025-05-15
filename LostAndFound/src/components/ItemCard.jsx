import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const ItemCard = ({ item }) => {
  return (
    <Card className="h-full flex flex-col card-hover">
      {item.imageUrl ? (
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-accent flex items-center justify-center">
          <span className="text-muted-foreground">No Image</span>
        </div>
      )}
      
      <CardContent className="pt-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{item.title}</h3>
          <Badge variant={item.status === 'lost' ? 'destructive' : 'default'}>
            {item.status === 'lost' ? 'Lost' : 'Found'}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {item.description}
        </p>
        
        <div className="space-y-1.5">
          <div className="flex items-center text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>{format(new Date(item.date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span className="truncate">{item.location.description || 'Custom location'}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 mt-auto">
        <Button asChild className="w-full">
          <Link to={`/item/${item.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
