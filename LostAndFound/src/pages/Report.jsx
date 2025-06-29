// src/pages/Report.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useItems } from '@/context/ItemsContext';

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MapSelector from '@/components/MapSelector';

/* ---------------------- Schema for react-hook-form ---------------------- */
const schema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  category: z.enum(['electronics', 'clothing', 'accessories', 'documents', 'keys', 'other']),
  status: z.enum(['lost', 'found']),
  imageUrl: z.string().min(1, { message: 'Image is required' }),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    description: z.string().optional(),
  }),
  contactInfo: z.string().optional(),
});

const Report = () => {
  /* ---------------------- FIX: hook moved inside component ---------------------- */
  const [imageFile, setImageFile] = useState(null);

  const { items, addItem } = useItems();
  const navigate = useNavigate();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authType, setAuthType] = useState('');
  const [srNumber, setSrNumber] = useState('');
  const [srPassword, setSrPassword] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      status: 'lost',
      contactInfo: '',
      imageUrl: '',
      location: { lat: 0, lng: 0, description: '' },
    },
  });

  /* ---------------------- Local helpers ---------------------- */
  const status = form.watch('status');
  const lostItems = items.filter((i) => i.status === 'lost' && !i.isResolved);

  const onLocationSelect = (loc) => {
    setSelectedLocation(loc);
    form.setValue('location', loc);
  };

  /* ---------------------- College / guest verification ---------------------- */
  const verifyCollegeUser = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/verify/college', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srNo: srNumber, password: srPassword }),
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  };

  const verifyGuestUser = async () => {
    const res = await fetch('http://localhost:5000/api/guest/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: guestPhone }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.verified);
  };

  /* ---------------------- Submit handler ---------------------- */
  const onSubmit = async (data) => {
    if (!selectedLocation) return alert('Please select a location.');

    setIsSubmitting(true);
    try {
      /* ---------- auth checks for “found” status ---------- */
      if (data.status === 'found') {
        if (authType === 'college') {
          if (!srNumber || !srPassword) throw new Error('Missing SR number/password.');
          const ok = await verifyCollegeUser();
          if (!ok) throw new Error('College verification failed.');
          if (!data.contactInfo || !data.contactInfo.includes('@')) throw new Error('Provide email.');
        } else if (authType === 'guest') {
          if (!guestPhone) throw new Error('Phone required.');
          const ok = await verifyGuestUser();
          if (!ok) throw new Error('Guest not verified.');
          data.contactInfo = guestPhone;
        } else {
          throw new Error('Choose College or Guest verification.');
        }
      } else if (!data.contactInfo || !data.contactInfo.includes('@')) {
        throw new Error('Provide email.');
      }

      /* ---------- create item ---------- */
      const reportItem = {
        ...data,
        location: selectedLocation,
        date: new Date().toISOString(),
        reportedBy: 'Anonymous User',
        isResolved: false,
      };

      /* mark match resolved */
      if (data.status === 'found') {
        const match = items.find(
          (i) => i.status === 'lost' && i.title === data.title && !i.isResolved,
        );
        if (match) match.isResolved = true;
      }

      /* Send to backend with File object */
      await addItem({ ...reportItem, image: imageFile });

      navigate('/browse');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------- JSX ---------------------- */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Report an Item</h1>
      <p className="text-muted-foreground mb-6">
        Help lost items get back to their owner.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-3xl w-full"
        >
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* ----- Item status radio ----- */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lost" id="lost" />
                          <label htmlFor="lost" className="cursor-pointer">Lost</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="found" id="found" />
                          <label htmlFor="found" className="cursor-pointer">Found</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ----- Auth type if found ----- */}
              {status === 'found' && (
                <>
                  <p className="font-medium mb-2">Verify as:</p>
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
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="SR Number"
                        value={srNumber}
                        onChange={(e) => setSrNumber(e.target.value)}
                      />
                      <Input
                        placeholder="Password"
                        type="password"
                        value={srPassword}
                        onChange={(e) => setSrPassword(e.target.value)}
                      />
                    </div>
                  )}

                  {authType === 'guest' && (
                    <Input
                      placeholder="Phone (+91...)"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  )}
                </>
              )}

              {/* ----- Title & category ----- */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {status === 'found' ? 'Match Lost Item' : 'Item Title'}
                      </FormLabel>
                      <FormControl>
                        {status === 'found' ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select lost item" />
                            </SelectTrigger>
                            <SelectContent>
                              {lostItems.length === 0 ? (
                                <SelectItem value="no-items" disabled>
                                  No lost items
                                </SelectItem>
                              ) : (
                                lostItems.map((it) => (
                                  <SelectItem key={it._id} value={it.title}>
                                    {it.category} — {it.title}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input placeholder="Enter item title" {...field} />
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
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
              </div>

              {/* ----- Description ----- */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ----- Image upload ----- */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.length) {
                            const file = e.target.files[0];
                            setImageFile(file);      // store File object
                            field.onChange(file.name); // keep filename
                          }
                        }}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ----- Map selector ----- */}
              <div>
                <FormLabel>Select Location on Map</FormLabel>
                <div className="h-[300px] w-full mt-2">
                  <MapSelector
                    initialLocation={selectedLocation}
                    onLocationSelect={onLocationSelect}
                  />
                </div>
              </div>

              {/* ----- Contact email if needed ----- */}
              {(status === 'lost' || authType === 'college') && (
                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* ----- Submit ----- */}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit Report'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default Report;
