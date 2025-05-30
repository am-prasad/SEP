import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useItems } from '@/context/ItemsContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, MapPin } from 'lucide-react';
import MapSelector from '@/components/MapSelector';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.enum(['electronics', 'clothing', 'accessories', 'documents', 'keys', 'other']),
  status: z.enum(['lost', 'found']),
  imageUrl: z.string().optional(),
  contactInfo: z.string().email({ message: 'Please enter a valid email address' }),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    description: z.string().optional()
  })
});

const Report = () => {
  const { items, addItem } = useItems();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter lost items to show in dropdown when reporting a found item
  const lostItems = items.filter(item => item.status === 'lost');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      status: 'lost',
      contactInfo: '',
      imageUrl: '',
      location: {
        lat: 0,
        lng: 0,
        description: ''
      }
    }
  });

  // Watch status field to toggle item name input/dropdown
  const status = form.watch('status');

  const onLocationSelect = (location) => {
    setSelectedLocation(location);
    form.setValue('location', location);
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reportItem = {
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        location: {
          lat: data.location.lat,
          lng: data.location.lng,
          description: data.location.description || ''
        },
        date: new Date().toISOString(),
        reportedBy: 'Anonymous User',
        contactInfo: data.contactInfo,
        imageUrl: data.imageUrl,
        isResolved: false
      };

      await addItem(reportItem);
      navigate('/browse');
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Replace this with actual image upload logic if needed
      const imageUrl = "https://images.unsplash.com/photo-1622560481153-02f36932d31b";
      form.setValue('imageUrl', imageUrl);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen w-screen px-4">
      <h1 className="text-3xl font-bold mb-4">Report an Item</h1>
      <p className="text-muted-foreground mb-6">
        Report a lost or found item on campus to help it find its way back home
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl w-full">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>What are you reporting?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lost" id="lost" />
                          <label htmlFor="lost" className="font-medium cursor-pointer">
                            I lost an item
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="found" id="found" />
                          <label htmlFor="found" className="font-medium cursor-pointer">
                            I found an item
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => {
                    if (status === 'found') {
                      // Dropdown of lost items when reporting a found item
                      return (
                        <FormItem>
                          <FormLabel>Select Lost Item Name</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select lost item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {lostItems.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No lost items found
                                </SelectItem>
                              ) : (
                                lostItems.map((item) => (
                                  <SelectItem key={item.id} value={item.title}>
                                    {item.title}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }
                    // Normal input for lost item report
                    return (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Blue Water Bottle" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="keys">Keys</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the item with any identifying features..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Item Image</h3>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                    id="image-upload"
                  />
                </div>
                <div className="flex-shrink-0">
                  <label htmlFor="image-upload">
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                  </label>
                </div>
              </div>

              {form.watch('imageUrl') && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Image preview:</p>
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <img
                      src={form.watch('imageUrl')}
                      alt="Item preview"
                      className="max-h-60 w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" /> Location Information
              </h3>
              <p className="text-muted-foreground mb-4">
                Select the location where you lost or found the item on the map
              </p>

              <div className="h-80 mb-4 border rounded-md overflow-hidden">
                <MapSelector onLocationSelect={onLocationSelect} />
              </div>

              {selectedLocation && (
                <div className="bg-accent p-3 rounded-md text-sm">
                  <p>Selected location: {selectedLocation.description || 'Custom location'}</p>
                  <p className="text-xs text-muted-foreground">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.edu"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedLocation}>
              Submit Report
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Report;
