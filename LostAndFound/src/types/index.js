// Item status options
export const ItemStatus = {
  LOST: 'lost',
  FOUND: 'found',
};

// Item category options
export const ItemCategory = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  ACCESSORIES: 'accessories',
  DOCUMENTS: 'documents',
  KEYS: 'keys',
  OTHER: 'other',
};

// Location interface
export function Location(lat, lng, description) {
  this.lat = lat;
  this.lng = lng;
  this.description = description || undefined;
}

// Item interface
export function Item(id, title, description, category, status, date, location, imageUrl, reportedBy, contactInfo, isResolved) {
  this.id = id;
  this.title = title;
  this.description = description;
  this.category = category;
  this.status = status;
  this.date = date;
  this.location = location;
  this.imageUrl = imageUrl || undefined;
  this.reportedBy = reportedBy || undefined;
  this.contactInfo = contactInfo || undefined;
  this.isResolved = isResolved || false;
}

// Matched item interface
export function MatchedItem(item, matchScore) {
  this.item = item;
  this.matchScore = matchScore;
}
