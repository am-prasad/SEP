// src/pages/Report.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useItems } from '@/context/ItemsContext';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MapSelector from '@/components/MapSelector';

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(['electronics', 'clothing', 'accessories', 'documents', 'keys', 'other']),
  status: z.enum(['lost', 'found']),
  imageFile: z.any(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    description: z.string().optional()
  }),
  contactInfo: z.string().optional(),
});

const Report = () => {
  const { items } = useItems();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [authType, setAuthType] = useState('');
  const [srNumber, setSrNumber] = useState('');
  const [srPassword, setSrPassword] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      status: 'lost',
      contactInfo: '',
      imageFile: null,
      location: { lat: 0, lng: 0, description: '' }
    }
  });

  const status = form.watch('status');
  const lostItems = items.filter(item => item.status === 'lost' && !item.isResolved);

  const onLocationSelect = (location) => {
    setSelectedLocation(location);
    form.setValue('location', location);
  };

  const verifyCollegeUser = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/verify/college', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srNo: srNumber, password: srPassword }),
      });
      const data = await res.json();
      return res.ok ? data : null;
    } catch {
      return null;
    }
  };

  const verifyGuestUser = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/verify/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: guestPhone }),
      });
      const data = await res.json();
      return res.ok && data.success;
    } catch {
      return false;
    }
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) return alert('Please select a location on the map.');
    if (!imageFile) return alert('Please upload an image.');

    setIsSubmitting(true);

    try {
      if (data.status === 'found') {
        if (authType === 'college') {
          if (!srNumber || !srPassword) throw new Error('Missing SR number or password.');
          const valid = await verifyCollegeUser();
          if (!valid) throw new Error('Invalid college credentials.');
          if (!data.contactInfo || !data.contactInfo.includes('@')) {
            throw new Error('Valid contact email required.');
          }
        } else if (authType === 'guest') {
          if (!guestPhone) throw new Error('Phone number required.');
          const valid = await verifyGuestUser();
          if (!valid) throw new Error('Guest verification failed.');
          data.contactInfo = guestPhone;
        } else {
          throw new Error('Choose college or guest verification.');
        }
      } else {
        if (!data.contactInfo || !data.contactInfo.includes('@')) {
          throw new Error('Valid contact email required.');
        }
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('status', data.status);
      formData.append('contactInfo', data.contactInfo || '');
      formData.append('image', imageFile);
      formData.append('location[lat]', selectedLocation.lat);
      formData.append('location[lng]', selectedLocation.lng);
      formData.append('location[description]', selectedLocation.description || '');
      formData.append('reportedBy', 'Anonymous User');
      formData.append('isResolved', 'false');
      formData.append('date', new Date().toISOString());

      const res = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Failed to submit item');

      navigate('/browse');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      form.setValue('imageFile', file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Report an Item</h1>
      <p className="text-muted-foreground mb-6">Help reunite lost items with their owners.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl w-full">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Status</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lost" id="lost" />
                          <label htmlFor="lost">Lost</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="found" id="found" />
                          <label htmlFor="found">Found</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Verification */}
              {status === 'found' && (
                <>
                  <p className="font-medium">Verify as:</p>
                  <div className="flex gap-4 mb-4">
                    <Button
                      type="button"
                      variant={authType === 'college' ? 'default' : 'outline'}
                      onClick={() => setAuthType('college')}
                    >
                      College User
                    </Button>
                    <Button
                      type="button"
                      variant={authType === 'guest' ? 'default' : 'outline'}
                      onClick={() => setAuthType('guest')}
                    >
                      Guest User
                    </Button>
                  </div>

                  {authType === 'college' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="SR Number" value={srNumber} onChange={(e) => setSrNumber(e.target.value)} />
                      <Input type="password" placeholder="Password" value={srPassword} onChange={(e) => setSrPassword(e.target.value)} />
                    </div>
                  )}
                  {authType === 'guest' && (
                    <Input placeholder="Phone Number" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                  )}
                </>
              )}

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Title</FormLabel>
                    <FormControl>
                      {status === 'found' ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lost item title" />
                          </SelectTrigger>
                          <SelectContent>
                            {lostItems.map((item) => (
                              <SelectItem key={item._id} value={item.title}>
                                {item.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input placeholder="Enter item title" {...field} />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="keys">Keys</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter a detailed description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input type="file" accept="image/*" onChange={handleImageUpload} />
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mt-2 w-48 h-auto border rounded shadow"
                      />
                    )}
                  </div>
                </FormControl>
              </FormItem>

              {/* Map Selector */}
              <div>
                <FormLabel>Select Location</FormLabel>
                <div className="h-[300px] w-full mt-2">
                  <MapSelector initialLocation={selectedLocation} onLocationSelect={onLocationSelect} />
                </div>
              </div>

              {/* Contact Info */}
              {(status === 'lost' || authType === 'college') && (
                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Submit */}
              <Button type="submit" disabled={isSubmitting}>
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
