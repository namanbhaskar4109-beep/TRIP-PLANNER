import { Accommodation, PlaceItem, TravelInterest } from '../types/trip';

// Curated high quality imagery for sample items
const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
];

const DESTINATION_HERO_IMAGES: Record<string, string> = {
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
  swiss: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
};

export function getDestinationHeroImage(destination: string): string {
  const lower = destination.toLowerCase().trim();
  for (const [key, url] of Object.entries(DESTINATION_HERO_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return DESTINATION_HERO_IMAGES.default;
}

export function generateSampleAccommodations(destination: string): Accommodation[] {
  const dest = destination.trim() || 'Central City';
  const cleanDest = dest.split(',')[0].trim();

  return [
    {
      id: 'acc-1',
      name: `${cleanDest} Grand Heritage Hotel & Spa`,
      type: 'Hotel',
      pricePerNight: 195,
      currency: 'USD',
      rating: 4.85,
      reviewCount: 524,
      distanceKm: 0.7,
      address: `14 Royal Boulevard, Historic District, ${cleanDest}`,
      amenities: ['Free WiFi', 'Breakfast Included', 'Spa & Wellness', 'Fitness Center', 'Rooftop Terrace', 'Air Conditioning'],
      imageUrl: HOTEL_IMAGES[0],
      description: 'Elegant luxury hotel nestled in the heart of the city, walking distance to major historic landmarks, with panoramic rooftop city views.',
      matchScore: 95,
      highlightTag: 'Top Recommended',
      isSampleData: true,
    },
    {
      id: 'acc-2',
      name: `The Artisan Boutique Suites`,
      type: 'Boutique',
      pricePerNight: 145,
      currency: 'USD',
      rating: 4.75,
      reviewCount: 340,
      distanceKm: 1.2,
      address: `28 Designer Lane, Arts Quarter, ${cleanDest}`,
      amenities: ['Free WiFi', 'Artisan Coffee Bar', 'Pet-Friendly', 'Air Conditioning', 'Bicycle Rental'],
      imageUrl: HOTEL_IMAGES[1],
      description: 'Chic urban boutique hotel curated with local artwork, designer furnishing, and a vibrant evening cocktail lounge.',
      matchScore: 90,
      highlightTag: 'Great Value',
      isSampleData: true,
    },
    {
      id: 'acc-3',
      name: `${cleanDest} Panorama Luxury Suites`,
      type: 'Resort',
      pricePerNight: 320,
      currency: 'USD',
      rating: 4.92,
      reviewCount: 680,
      distanceKm: 2.1,
      address: `100 Skyline Promenade, Hillside, ${cleanDest}`,
      amenities: ['Free WiFi', 'Infinity Pool', 'Fine Dining Restaurant', '24/7 Butler Service', 'Airport Shuttle', 'Spa & Wellness'],
      imageUrl: HOTEL_IMAGES[2],
      description: 'Ultra-luxurious 5-star haven offering private balcony vistas, world-class culinary experiences, and an iconic heated infinity pool.',
      matchScore: 82,
      highlightTag: 'Luxury Pick',
      isSampleData: true,
    },
    {
      id: 'acc-4',
      name: `Urban Loft Central Living`,
      type: 'Apartment',
      pricePerNight: 110,
      currency: 'USD',
      rating: 4.65,
      reviewCount: 290,
      distanceKm: 1.5,
      address: `45 Riverside Walk, Downtown, ${cleanDest}`,
      amenities: ['Free WiFi', 'Full Kitchen', 'Washing Machine', 'Self Check-in', 'Workspace'],
      imageUrl: HOTEL_IMAGES[3],
      description: 'Spacious modern serviced apartment with open-plan kitchen, dedicated remote workstation, and easy transit metro links.',
      matchScore: 88,
      highlightTag: 'Ideal for Long Stays',
      isSampleData: true,
    },
    {
      id: 'acc-5',
      name: `Wanderer Social Hub & Pods`,
      type: 'Hostel',
      pricePerNight: 48,
      currency: 'USD',
      rating: 4.58,
      reviewCount: 812,
      distanceKm: 0.9,
      address: `12 Backpacker Alley, Old Town, ${cleanDest}`,
      amenities: ['Free WiFi', 'Communal Kitchen', 'Game Room', 'Daily Walking Tours', 'Lockers', 'Luggage Storage'],
      imageUrl: HOTEL_IMAGES[4],
      description: 'Award-winning eco hostel with vibrant communal spaces, private en-suite pods, organized pub crawls, and friendly community vibe.',
      matchScore: 78,
      highlightTag: 'Budget Friendly',
      isSampleData: true,
    },
    {
      id: 'acc-6',
      name: `Villa Serena Private Garden Sanctuary`,
      type: 'Villa',
      pricePerNight: 260,
      currency: 'USD',
      rating: 4.88,
      reviewCount: 195,
      distanceKm: 3.4,
      address: `8 Botanica Way, Quiet Valley, ${cleanDest}`,
      amenities: ['Free WiFi', 'Private Garden', 'Swimming Pool', 'BBQ Grill', 'Complimentary Breakfast', 'Free Parking'],
      imageUrl: HOTEL_IMAGES[5],
      description: 'Peaceful private retreat surrounded by tranquil gardens, complete with a private dip pool and scenic outdoor alfresco dining.',
      matchScore: 84,
      highlightTag: 'Serene Getaway',
      isSampleData: true,
    },
  ];
}

export function generateSamplePlaces(destination: string): PlaceItem[] {
  const dest = destination.trim() || 'Central City';
  const cleanDest = dest.split(',')[0].trim();

  return [
    // Attractions
    {
      id: 'place-att-1',
      name: `${cleanDest} Historic Cathedral & Bell Tower`,
      category: 'attraction',
      subcategory: 'Architectural Landmark',
      description: 'Magnificent centuries-old Gothic landmark featuring ornate stone carvings, grand stained glass windows, and 360-degree city observation tower.',
      address: `Piazza Monumentale 1, ${cleanDest}`,
      rating: 4.85,
      reviewCount: 4120,
      estimatedCost: 15,
      currency: 'USD',
      estimatedDuration: '1.5 - 2 hours',
      openingHours: '09:00 - 18:30 (Daily)',
      distanceKm: 0.5,
      matchedInterest: 'Culture & History',
      imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },
    {
      id: 'place-att-2',
      name: `${cleanDest} National Gallery of Fine Arts`,
      category: 'attraction',
      subcategory: 'Art & History Museum',
      description: 'World-renowned art collection spanning Renaissance masterpieces, Impressionist galleries, and interactive contemporary sculpture exhibits.',
      address: `Museum Boulevard 88, ${cleanDest}`,
      rating: 4.78,
      reviewCount: 3290,
      estimatedCost: 20,
      currency: 'USD',
      estimatedDuration: '2 - 3 hours',
      openingHours: '10:00 - 19:00 (Tue - Sun)',
      distanceKm: 1.1,
      matchedInterest: 'Art & Museums',
      imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },
    {
      id: 'place-att-3',
      name: 'Skyline Panorama Observation Deck',
      category: 'attraction',
      subcategory: 'Scenic Viewpoint',
      description: 'High-speed glass elevator to the 64th floor offering breathtaking horizon views, sunset golden hour drinks, and glass-floor photo stations.',
      address: `Tower Central, 400 Main St, ${cleanDest}`,
      rating: 4.70,
      reviewCount: 2850,
      estimatedCost: 28,
      currency: 'USD',
      estimatedDuration: '1 - 1.5 hours',
      openingHours: '08:30 - 22:00 (Daily)',
      distanceKm: 1.8,
      matchedInterest: 'Nature & Outdoors',
      imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },

    // Food & Dining
    {
      id: 'place-food-1',
      name: `Le Petit Bistro & Terrace`,
      category: 'food',
      subcategory: 'Local Gourmet & Wine',
      description: 'Warm, candle-lit bistro loved by locals for traditional seasonal recipes, slow-braised meats, hand-tossed pasta, and curated regional wines.',
      address: `15 Cobblestone Alley, Old Quarter, ${cleanDest}`,
      rating: 4.88,
      reviewCount: 1640,
      estimatedCost: 35,
      currency: 'USD',
      estimatedDuration: '1.5 - 2 hours',
      openingHours: '12:00 - 15:00, 18:30 - 23:00',
      distanceKm: 0.8,
      matchedInterest: 'Food & Dining',
      imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },
    {
      id: 'place-food-2',
      name: `Central Grand Gourmet Food Hall`,
      category: 'food',
      subcategory: 'Artisanal Street Food',
      description: 'Lively covered artisanal market featuring 30+ indie food stalls: wood-fired oven flatbreads, fresh seafood ceviche, handcrafted gelato, and craft beers.',
      address: `Market Square 4, ${cleanDest}`,
      rating: 4.75,
      reviewCount: 3890,
      estimatedCost: 18,
      currency: 'USD',
      estimatedDuration: '1 hour',
      openingHours: '08:00 - 21:00 (Daily)',
      distanceKm: 0.6,
      matchedInterest: 'Food & Dining',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },
    {
      id: 'place-food-3',
      name: `Velvet & Ember Speakeasy Lounge`,
      category: 'food',
      subcategory: 'Craft Cocktails & Small Plates',
      description: 'Hidden basement cocktail den concealed behind an antique bookcase. Features smoky bespoke concoctions, live jazz piano, and gourmet truffle tapas.',
      address: `Secret Entrance, 7 Amber St, ${cleanDest}`,
      rating: 4.82,
      reviewCount: 940,
      estimatedCost: 25,
      currency: 'USD',
      estimatedDuration: '2 hours',
      openingHours: '18:00 - 02:00 (Wed - Sun)',
      distanceKm: 1.4,
      matchedInterest: 'Nightlife & Bars',
      imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },

    // Activities & Experiences
    {
      id: 'place-act-1',
      name: `Sunset River & Heritage Cruise`,
      category: 'activity',
      subcategory: 'Boat Tour & Sightseeing',
      description: 'Scenic evening boat ride gliding past illuminated bridges and historic waterfront palaces. Includes a complimentary glass of sparkling wine and audio guide.',
      address: `Pier 3 Marina Promenade, ${cleanDest}`,
      rating: 4.86,
      reviewCount: 2150,
      estimatedCost: 32,
      currency: 'USD',
      estimatedDuration: '1.5 hours',
      openingHours: 'Departures at 17:00, 18:30, 20:00',
      distanceKm: 1.2,
      matchedInterest: 'Relaxation & Spa',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },
    {
      id: 'place-act-2',
      name: `Secret Hidden Alleyways Bike Tour`,
      category: 'activity',
      subcategory: 'Guided Adventure & Cycling',
      description: 'Fun, small-group cycling journey through hidden courtyards, quiet canals, vibrant street art murals, and historic pocket parks led by a charismatic local guide.',
      address: `Station Velov, Central Plaza, ${cleanDest}`,
      rating: 4.92,
      reviewCount: 1420,
      estimatedCost: 40,
      currency: 'USD',
      estimatedDuration: '3 hours',
      openingHours: 'Tours at 10:00 and 14:30',
      distanceKm: 0.9,
      matchedInterest: 'Adventure & Sports',
      imageUrl: 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },
    {
      id: 'place-act-3',
      name: `Artisan Cooking & Wine Masterclass`,
      category: 'activity',
      subcategory: 'Culinary Workshop',
      description: 'Hands-on culinary session with a local chef. Source fresh ingredients at morning market, master traditional cooking techniques, and enjoy a communal feast.',
      address: `Cooking Studio 22, Via Gusto, ${cleanDest}`,
      rating: 4.95,
      reviewCount: 880,
      estimatedCost: 65,
      currency: 'USD',
      estimatedDuration: '3.5 hours',
      openingHours: 'Sessions daily: 10:30 & 16:30',
      distanceKm: 1.6,
      matchedInterest: 'Food & Dining',
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
      isSampleData: true,
    },
  ];
}

// Ranking algorithm that ranks accommodations based on entered budget, trip duration, travelers, and interests
export function rankAccommodations(
  accommodations: Accommodation[],
  budget: number,
  tripDays: number,
  travelers: number,
  interests: TravelInterest[]
): Accommodation[] {
  const safeDays = Math.max(1, tripDays);
  // Allocate typical 35-45% of total budget to accommodation
  const targetPerNight = (budget * 0.40) / safeDays;

  return accommodations
    .map((item) => {
      let score = 50;

      // 1. Budget proximity (max 30 pts)
      const diffRatio = (item.pricePerNight - targetPerNight) / (targetPerNight || 1);
      if (Math.abs(diffRatio) <= 0.25) {
        score += 30; // Within comfortable target zone
      } else if (item.pricePerNight < targetPerNight) {
        score += 24; // Cheaper than target is still great
      } else if (diffRatio <= 0.5) {
        score += 15; // Moderately over target
      } else {
        score -= 10; // Significantly over target
      }

      // 2. Rating score (max 15 pts)
      score += (item.rating - 4.0) * 15;

      // 3. Distance from center (max 10 pts)
      if (item.distanceKm <= 1.0) score += 10;
      else if (item.distanceKm <= 2.0) score += 6;
      else score += 2;

      // 4. Interest & Amenities match (max 15 pts)
      let matchedAmenitiesCount = 0;
      if (interests.includes('Relaxation & Spa') && item.amenities.some((a) => a.toLowerCase().includes('spa') || a.toLowerCase().includes('pool'))) {
        matchedAmenitiesCount++;
      }
      if (interests.includes('Food & Dining') && item.amenities.some((a) => a.toLowerCase().includes('breakfast') || a.toLowerCase().includes('restaurant'))) {
        matchedAmenitiesCount++;
      }
      if (interests.includes('Adventure & Sports') && item.amenities.some((a) => a.toLowerCase().includes('tour') || a.toLowerCase().includes('rental') || a.toLowerCase().includes('fitness'))) {
        matchedAmenitiesCount++;
      }
      score += matchedAmenitiesCount * 5;

      // Normalize score between 60 and 99
      const normalizedScore = Math.min(99, Math.max(60, Math.round(score)));

      return {
        ...item,
        matchScore: normalizedScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
