import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { useItems } from '@/context/ItemsContext';




import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, MapPin } from 'lucide-react';
import MapSelector from '@/components/MapSelector';

const formSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  category: z.enum(['electronics', 'clothing', 'accessories', 'documents', 'keys', 'other']),
  status: z.enum(['lost', 'found']),
  imageUrl: z.string().min(1, "Image is required"),
  contactInfo: z.string().email(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    description: z.string().optional()
  }),
  userType: z.enum(['college', 'guest', 'none']).optional(),
  srNumber: z.string().optional(),
  password: z.string().optional(),
  guestPhone: z.string().optional(),
});

// Mock async validation for SR Number and Password
async function validateSrNumberPassword(srNumber, password) {
  await new Promise(r => setTimeout(r, 700));
  // Replace with real validation logic. For demo, accept these:
  return srNumber === 'SR123' && password === 'pass123';
}

// Validate guest phone (simple digit check, 10 digits)
function validateGuestPhone(phone) {
  return /^\d{10}$/.test(phone);
}

const Report = () => {
  const { items, addItem } = useItems();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [srValidationError, setSrValidationError] = useState('');
  const [guestPhoneError, setGuestPhoneError] = useState('');

  const lostItems = items.filter(item => item.status === 'lost' && !item.isResolved);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      status: 'lost',
      contactInfo: '',
      imageUrl: '',
      location: { lat: 0, lng: 0, description: '' },
      userType: 'none',
      srNumber: '',
      password: '',
      guestPhone: '',
    }
  });

  const status = form.watch('status');
  const userType = form.watch('userType');

  const onLocationSelect = (location) => {
    setSelectedLocation(location);
    form.setValue('location', location);
  };

  const handleImageUpload = (e) => {
    if (e.target.files?.length) {
      // Keep your existing upload logic or placeholder URL
      const imageUrl = "https://images.unsplash.com/photo-1622560481153-02f36932d31b";
      form.setValue('imageUrl', imageUrl);
    }
  };

  const onSubmit = async (data) => {
    setSrValidationError('');
    setGuestPhoneError('');

    if (!selectedLocation) {
      alert('Please select a location on the map.');
      return;
    }
    if (!data.imageUrl) {
      alert('Please upload an image.');
      return;
    }

    if (data.status === 'found') {
      if (data.userType === 'none') {
        alert('Please select user type.');
        return;
      }

      if (data.userType === 'college') {
        if (!data.srNumber || !data.password) {
          alert('Please enter SR Number and Password.');
          return;
        }
        setIsSubmitting(true);
        const valid = await validateSrNumberPassword(data.srNumber, data.password);
        setIsSubmitting(false);

        if (!valid) {
          setSrValidationError('Invalid SR Number or Password.');
          return;
        }
      }

      if (data.userType === 'guest') {
        if (!data.guestPhone) {
          setGuestPhoneError('Please enter your phone number.');
          return;
        }
        if (!validateGuestPhone(data.guestPhone)) {
          setGuestPhoneError('Phone number must be 10 digits.');
          return;
        }
      }
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
        reportedBy: (data.userType === 'college' ? `College User (${data.srNumber})` : data.userType === 'guest' ? `Guest User (${data.guestPhone})` : 'Anonymous User'),
        contactInfo: data.contactInfo,
        imageUrl: data.imageUrl,
        isResolved: false
      };

      if (data.status === 'found') {
        const matchingLostItem = items.find(
          item => item.status === 'lost' && item.title === data.title && !item.isResolved
        );
        if (matchingLostItem) {
          matchingLostItem.isResolved = true; // Note: ideally update in context with a setter
        }
      }

      await addItem(reportItem);
      navigate('/browse');
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
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
              <FormItem className="mb-6">
                <FormLabel>What are you reporting?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={val => form.setValue('status', val)}
                    value={form.getValues('status')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lost" id="lost" />
                      <label htmlFor="lost" className="font-medium cursor-pointer">I lost an item</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="found" id="found" />
                      <label htmlFor="found" className="font-medium cursor-pointer">I found an item</label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem>
                  <FormLabel>{status === 'found' ? 'Select Lost Item Name' : 'Item Name'}</FormLabel>
                  <Controller
                    name="title"
                    control={form.control}
                    render={({ field }) => (
                      status === 'found' ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lost item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lostItems.length === 0 ? (
                              <SelectItem value="no-items" disabled>No unresolved lost items</SelectItem>
                            ) : lostItems.map(item => (
                              <SelectItem key={item.id} value={item.title}>
                                {item.category} - {item.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input placeholder="E.g., Blue Water Bottle" {...field} />
                      )
                    )}
                  />
                  <FormMessage>{form.formState.errors.title?.message}</FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field }) => (
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
                    )}
                  />
                  <FormMessage>{form.formState.errors.category?.message}</FormMessage>
                </FormItem>
              </div>

              <FormItem className="mt-6">
                <FormLabel>Description</FormLabel>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea placeholder="Describe the item..." {...field} />
                  )}
                />
                <FormMessage>{form.formState.errors.description?.message}</FormMessage>
              </FormItem>

              <FormItem className="mt-6">
                <FormLabel>Upload an Image</FormLabel>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {form.formState.errors.imageUrl && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.imageUrl.message}</p>
                )}
              </FormItem>

              <FormItem className="mt-6">
                <FormLabel>Location (Click on map to select)</FormLabel>
                <MapSelector onLocationSelect={onLocationSelect} />
                {selectedLocation && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: Lat {selectedLocation.lat.toFixed(4)}, Lng {selectedLocation.lng.toFixed(4)}
                  </p>
                )}
              </FormItem>

              <FormItem className="mt-6">
                <FormLabel>Contact Email</FormLabel>
                <Controller
                  name="contactInfo"
                  control={form.control}
                  render={({ field }) => <Input type="email" placeholder="your@email.com" {...field} />}
                />
                <FormMessage>{form.formState.errors.contactInfo?.message}</FormMessage>
              </FormItem>

              {/* Show extra fields only if status is 'found' */}
              {status === 'found' && (
                <>
                  <FormItem className="mt-6">
                    <FormLabel>User Type</FormLabel>
                    <Controller
                      name="userType"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="college">College User</SelectItem>
                            <SelectItem value="guest">Guest User</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormItem>

                  {/* College user SR Number and Password */}
                  {userType === 'college' && (
                    <>
                      <FormItem>
                        <FormLabel>SR Number</FormLabel>
                        <Controller
                          name="srNumber"
                          control={form.control}
                          render={({ field }) => <Input placeholder="Enter SR Number" {...field} />}
                        />
                      </FormItem>
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <Controller
                          name="password"
                          control={form.control}
                          render={({ field }) => <Input type="password" placeholder="Enter Password" {...field} />}
                        />
                      </FormItem>
                      {srValidationError && (
                        <p className="text-red-600 text-sm mt-1">{srValidationError}</p>
                      )}
                    </>
                  )}

                  {/* Guest user Phone Number */}
                  {userType === 'guest' && (
                    <>
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <Controller
                          name="guestPhone"
                          control={form.control}
                          render={({ field }) => <Input placeholder="10-digit phone number" {...field} />}
                        />
                      </FormItem>
                      {guestPhoneError && (
                        <p className="text-red-600 text-sm mt-1">{guestPhoneError}</p>
                      )}
                    </>
                  )}
                </>
              )}

              <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default Report;
