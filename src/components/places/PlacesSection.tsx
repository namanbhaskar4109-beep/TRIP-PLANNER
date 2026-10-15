import React, { useState, useMemo } from 'react';
import {
  Compass,
  Utensils,
  Landmark,
  Ticket,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';
import { PlaceItem, PlaceCategory, TravelInterest } from '../../types/trip';

interface PlacesSectionProps {
  places: PlaceItem[];
  savedPlaceIds: string[];
  userInterests: TravelInterest[];
  onToggleSavePlace: (placeId: string) => void;
}

export const PlacesSection: React.FC<PlacesSectionProps> = ({
  places,
  savedPlaceIds,
  userInterests,
  onToggleSavePlace,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | PlaceCategory>('all');
  const [onlyUserInterests, setOnlyUserInterests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // Category filter
      if (selectedCategory !== 'all' && place.category !== selectedCategory) {
        return false;
      }

      // Interest filter
      if (onlyUserInterests && !userInterests.some((i) => place.matchedInterest.includes(i))) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(query);
        const matchesDesc = place.description.toLowerCase().includes(query);
        const matchesSub = place.subcategory.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesSub) return false;
      }

      return true;
    });
  }, [places, selectedCategory, onlyUserInterests, searchQuery, userInterests]);

  const categories = [
    { id: 'all', label: 'All Highlights', icon: Compass },
    { id: 'attraction', label: 'Attractions & Sights', icon: Landmark },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'activity', label: 'Activities & Tours', icon: Ticket },
  ];

  return (
    <section id="places" className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Nearby Food, Attractions & Activities
              </h2>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                Sample Data
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Discover curated local attractions, culinary gems, and immersive activities for your itinerary.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
            />
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(({ id, label, icon: Icon }) => {
              const isActive = selectedCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id as 'all' | PlaceCategory)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Interests Filter Toggle */}
          {userInterests.length > 0 && (
            <button
              onClick={() => setOnlyUserInterests(!onlyUserInterests)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                onlyUserInterests
                  ? 'bg-teal-50 border-teal-500 text-teal-800 ring-1 ring-teal-500/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Only My Interests ({userInterests.length})</span>
              {onlyUserInterests && <Check className="w-3 h-3 text-teal-600 ml-1" />}
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredPlaces.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Matching Places Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the interest filter to see all nearby highlights.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setOnlyUserInterests(false);
            }}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => {
          const isSaved = savedPlaceIds.includes(place.id);
          const matchesUserInterest = userInterests.some((i) => place.matchedInterest.includes(i));

          return (
            <div
              key={place.id}
              className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                isSaved
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md text-white ${
                        place.category === 'attraction'
                          ? 'bg-indigo-600/90'
                          : place.category === 'food'
                          ? 'bg-amber-600/90'
                          : 'bg-emerald-600/90'
                      }`}
                    >
                      {place.subcategory}
                    </span>
                  </div>

                  {/* Sample data label */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-amber-400/95 backdrop-blur-md text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                      Sample Data
                    </span>
                  </div>

                  {/* Rating and Distance Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{place.rating.toFixed(2)}</span>
                      <span className="text-slate-300 font-normal">({place.reviewCount})</span>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-slate-200">
                      {place.distanceKm} km away
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 hover:text-teal-600 transition">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>{place.address}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{place.estimatedDuration}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-900">
                        {place.estimatedCost > 0 ? `~$${place.estimatedCost}` : 'Free Access'}
                      </span>
                    </div>
                  </div>

                  {/* Interest Match tag */}
                  {matchesUserInterest && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>Matches: {place.matchedInterest}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => onToggleSavePlace(place.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-white" />
                      <span>Saved to Itinerary</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-slate-500" />
                      <span>Save to Wishlist</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
