import React, { useState, useMemo } from 'react';
import {
  Hotel,
  Star,
  MapPin,
  Check,
  Sparkles,
  SlidersHorizontal,
  PlusCircle,
  CheckCircle2,
  Wifi,
  Coffee,
  Waves,
  ShieldCheck,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Accommodation, TravelInterest } from '../../types/trip';
import { rankAccommodations } from '../../services/sampleData';

interface AccommodationSectionProps {
  accommodations: Accommodation[];
  budget: number;
  nights: number;
  travelers: number;
  interests: TravelInterest[];
  selectedHotelId?: string;
  onSelectHotel: (hotel: Accommodation) => void;
  onAddHotelToExpenses: (hotel: Accommodation, totalCost: number) => void;
}

type SortOption = 'match' | 'price_asc' | 'price_desc' | 'rating_desc' | 'distance_asc';

export const AccommodationSection: React.FC<AccommodationSectionProps> = ({
  accommodations,
  budget,
  nights,
  travelers,
  interests,
  selectedHotelId,
  onSelectHotel,
  onAddHotelToExpenses,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);

  // Rank accommodations using the smart scoring algorithm
  const ranked = useMemo(() => {
    return rankAccommodations(accommodations, budget, nights, travelers, interests);
  }, [accommodations, budget, nights, travelers, interests]);

  // Filter and sort options
  const filteredAndSorted = useMemo(() => {
    let list = [...ranked];

    // Filter by amenity
    if (selectedAmenity !== 'all') {
      list = list.filter((item) =>
        item.amenities.some((a) => a.toLowerCase().includes(selectedAmenity.toLowerCase()))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price_desc':
        list.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'rating_desc':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance_asc':
        list.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case 'match':
      default:
        list.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    return list;
  }, [ranked, sortBy, selectedAmenity]);

  const amenitiesFilterList = [
    { id: 'all', label: 'All Stays' },
    { id: 'wifi', label: 'Free WiFi' },
    { id: 'breakfast', label: 'Breakfast Included' },
    { id: 'pool', label: 'Pool' },
    { id: 'spa', label: 'Spa & Wellness' },
    { id: 'kitchen', label: 'Kitchen / Apartment' },
  ];

  return (
    <section id="accommodations" className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <Hotel className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Recommended Accommodations
              </h2>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-amber-200">
                Sample Data
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Ranked dynamically according to your <strong className="text-slate-800">${budget}</strong> budget ({nights} nights) and travel preferences.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
            >
              <option value="match">✨ Best Match (Recommended)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Guest Rating</option>
              <option value="distance_asc">Closest to City Center</option>
            </select>
          </div>
        </div>

        {/* Amenity Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium mr-1">Filter by:</span>
          {amenitiesFilterList.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedAmenity(filter.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                selectedAmenity === filter.id
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accommodations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSorted.map((hotel) => {
          const isSelected = selectedHotelId === hotel.id;
          const totalCost = hotel.pricePerNight * nights;
          const isExpanded = expandedHotelId === hotel.id;

          return (
            <div
              key={hotel.id}
              className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Image and Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {hotel.type}
                    </span>
                    {hotel.highlightTag && (
                      <span className="bg-teal-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {hotel.highlightTag}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-amber-400/95 backdrop-blur-md text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                      Sample Data
                    </span>
                  </div>

                  {/* Match Score & Rating Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{hotel.rating.toFixed(2)}</span>
                      <span className="text-slate-300 font-normal">({hotel.reviewCount})</span>
                    </div>

                    <div className="bg-teal-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg font-extrabold text-teal-100">
                      {hotel.matchScore}% Match
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 hover:text-teal-600 transition">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>{hotel.distanceKm} km from center • {hotel.address}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>

                  {/* Amenities Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotel.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">
                        +{hotel.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Expanded Amenities list */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <p className="font-bold text-slate-800">All Included Amenities:</p>
                      <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                        {hotel.amenities.map((a) => (
                          <div key={a} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-teal-600" />
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedHotelId(isExpanded ? null : hotel.id)}
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 pt-1"
                  >
                    <span>{isExpanded ? 'Show less' : 'View full details & amenities'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Card Footer: Pricing and Actions */}
              <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-slate-900">
                      ${hotel.pricePerNight}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / night</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700">
                      ${totalCost.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 block">for {nights} nights</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onSelectHotel(hotel)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Selected for Trip</span>
                      </>
                    ) : (
                      <span>Select This Stay</span>
                    )}
                  </button>

                  {/* Add to Expenses shortcut button */}
                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => onAddHotelToExpenses(hotel, totalCost)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Log ${totalCost} to Trip Expenses</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
