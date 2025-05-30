// Sample campus locations
export const campusLocations = [
  { lat: 40.107126, lng: -88.227326, description: 'Main Quad' },
  { lat: 40.109780, lng: -88.228870, description: 'Student Union' },
  { lat: 40.104980, lng: -88.226690, description: 'University Library' },
  { lat: 40.111680, lng: -88.226844, description: 'Engineering Building' },
  { lat: 40.106220, lng: -88.223870, description: 'Science Hall' },
  { lat: 40.103730, lng: -88.230980, description: 'Recreation Center' },
  { lat: 40.108930, lng: -88.223680, description: 'Business School' },
  { lat: 40.105340, lng: -88.232780, description: 'Arts Center' }
];

// Categories
const categories = [
  'electronics',
  'clothing',
  'accessories',
  'documents',
  'keys',
  'other'
];

// Create mock items
export const mockItems = [
  {
    id: 'item-1',
    title: 'Black Laptop Bag',
    description: 'Found a black Dell laptop bag with some notebooks inside near the main entrance.',
    category: 'accessories',
    status: 'found',
    date: '2023-05-08T14:30:00Z',
    location: campusLocations[0],
    imageUrl: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887',
    reportedBy: 'Sarah Johnson',
    contactInfo: 'sjohnson@example.edu',
    isResolved: false
  },
  {
    id: 'item-2',
    title: 'Blue Water Bottle',
    description: 'Lost my blue Hydro Flask water bottle in the library, has stickers on it.',
    category: 'accessories',
    status: 'lost',
    date: '2023-05-09T10:15:00Z',
    location: campusLocations[2],
    imageUrl: 'https://images.unsplash.com/photo-1594483967100-feeb6183ed0c',
    reportedBy: 'Michael Chen',
    contactInfo: 'mchen@example.edu',
    isResolved: false
  },
  {
    id: 'item-3',
    title: 'Student ID Card',
    description: 'Found a student ID card for Emily Davis near the Business School entrance.',
    category: 'documents',
    status: 'found',
    date: '2023-05-10T16:45:00Z',
    location: campusLocations[6],
    imageUrl: 'https://images.unsplash.com/photo-1622560481153-02f36932d31b',
    reportedBy: 'Professor Wilson',
    contactInfo: 'pwilson@example.edu',
    isResolved: true
  },
  {
    id: 'item-4',
    title: 'AirPods Pro',
    description: 'Lost my AirPods Pro in the Engineering Building classroom 303, white case with a small scratch.',
    category: 'electronics',
    status: 'lost',
    date: '2023-05-11T11:20:00Z',
    location: campusLocations[3],
    imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5',
    reportedBy: 'James Rodriguez',
    contactInfo: 'jrodriguez@example.edu',
    isResolved: false
  },
  {
    id: 'item-5',
    title: 'Car Keys with Keychain',
    description: 'Found a set of car keys with a red keychain in the Recreation Center parking lot.',
    category: 'keys',
    status: 'found',
    date: '2023-05-12T08:30:00Z',
    location: campusLocations[5],
    imageUrl: 'https://images.unsplash.com/photo-1622560481156-2017ae6cdfa5',
    reportedBy: 'Amanda Thompson',
    contactInfo: 'athompson@example.edu',
    isResolved: false
  },
  {
    id: 'item-6',
    title: 'Gray Sweater',
    description: 'Left my gray University sweater in the Science Hall room 201.',
    category: 'clothing',
    status: 'lost',
    date: '2023-05-12T15:10:00Z',
    location: campusLocations[4],
    imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2',
    reportedBy: 'David Kim',
    contactInfo: 'dkim@example.edu',
    isResolved: false
  },
  {
    id: 'item-7',
    title: 'Textbook: Advanced Physics',
    description: 'Found "Advanced Physics 3rd Edition" in the library study room 4.',
    category: 'other',
    status: 'found',
    date: '2023-05-13T12:00:00Z',
    location: campusLocations[2],
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    reportedBy: 'Olivia Patel',
    contactInfo: 'opatel@example.edu',
    isResolved: false
  },
  {
    id: 'item-8',
    title: 'Prescription Glasses',
    description: 'Lost my black-framed prescription glasses somewhere in the Student Union food court.',
    category: 'accessories',
    status: 'lost',
    date: '2023-05-14T13:45:00Z',
    location: campusLocations[1],
    // imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67',
    reportedBy: 'Thomas Martinez',
    contactInfo: 'tmartinez@example.edu',
    isResolved: false
  },
];

// Default campus center coordinates (for map centering)
export const campusCenter = {
  lat: 12.2958,
  lng: 76.6394,
  zoom: 15
};
