export type TravelInterest =
  | 'Culture & History'
  | 'Food & Dining'
  | 'Nature & Outdoors'
  | 'Shopping & Markets'
  | 'Nightlife & Bars'
  | 'Adventure & Sports'
  | 'Relaxation & Spa'
  | 'Art & Museums';

export type ExpenseCategory =
  | 'Accommodation'
  | 'Food & Drinks'
  | 'Transportation'
  | 'Activities'
  | 'Shopping'
  | 'Miscellaneous';

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  interests: TravelInterest[];
  selectedHotelId?: string;
  savedPlaceIds: string[];
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'Hotel' | 'Boutique' | 'Resort' | 'Apartment' | 'Hostel' | 'Villa';
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  address: string;
  amenities: string[];
  imageUrl: string;
  description: string;
  matchScore: number;
  highlightTag?: string;
  isSampleData: boolean;
}

export type PlaceCategory = 'food' | 'attraction' | 'activity';

export interface PlaceItem {
  id: string;
  name: string;
  category: PlaceCategory;
  subcategory: string;
  description: string;
  address: string;
  rating: number;
  reviewCount: number;
  estimatedCost: number;
  currency: string;
  estimatedDuration: string;
  openingHours: string;
  distanceKm: number;
  matchedInterest: string;
  imageUrl: string;
  isSampleData: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface WeatherDay {
  date: string;
  maxTempC: number;
  minTempC: number;
  maxTempF: number;
  minTempF: number;
  precipitationProb: number;
  weatherCode: number;
  weatherDescription: string;
  icon: string;
  windSpeedKmh: number;
}

export interface WeatherData {
  resolvedLocation: string;
  latitude: number;
  longitude: number;
  days: WeatherDay[];
  currentTempC: number;
  currentTempF: number;
  currentDescription: string;
  currentIcon: string;
}

export interface WeatherStatus {
  loading: boolean;
  error: string | null;
  data: WeatherData | null;
  isAvailable: boolean;
  unavailableReason?: string;
}
