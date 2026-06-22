export interface PricingOption {
  price: number;
  childPrice: number;
}

export interface Review {
  id: string;
  activityId: number;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  verified?: boolean;
}

export interface MenuItem {
  price: number;
  items: string[];
  minimumPeople?: number;
}

export interface MenuOptions {
  tagineMenu?: MenuItem;
  mechouiMenu?: MenuItem;
  specialEvents?: {
    ramadan?: {
      departureTime: string;
    };
    newYear?: {
      price: number;
      description: string;
    };
  };
}

export interface GalleryItem {
  url: string;
  type?: 'image' | 'video';
}

export interface Activity {
  id: number;
  baseId?: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  location: string;
  category: string;
  rating: number;
  gallery?: GalleryItem[];
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  recommendations?: string[];
  durations?: {
    hours: number;
    description: string;
    features: string[];
    groupPrice: number;
    privatePrice: number;
  }[];
  buggyTypes?: {
    name: string;
    specs: {
      engine: string;
      power: string;
      topSpeed: string;
      terrain: string;
    };
    features: string[];
    groupPrice: number;
    privatePrice: number;
  }[];
  price: number;
  childPrice: number;
  reviewCount: number;
  pricingType?: 'tiered' | 'fixed' | 'custom_note';
  video?: string;
  itinerary?: {
    activity: string;
    coordinates?: [number, number];
    description?: string;
  }[];
  reviews?: Review[];
  selectedDuration?: {
    hours: number;
    description: string;
    features: string[];
    groupPrice: number;
    privatePrice: number;
  };
  selectedBuggyType?: {
    name: string;
    specs: {
      engine: string;
      power: string;
      topSpeed: string;
      terrain: string;
    };
    features: string[];
    groupPrice: number;
    privatePrice: number;
  };
}

export interface BookingSummaryProps {
  selectedActivities: (Activity & {
    isMainActivity?: boolean;
    variant?: {
      type: 'duration' | 'buggy';
      value: string | number;
      name?: string;
    };
  })[];
  guests?: {
    adults: number;
    children: number;
  };
  airportPickup?: {
    enabled: boolean;
    city: string;
    price: number;
  };
  paymentMethod?: 'card' | 'cash';
  showFinishBooking?: boolean;
  onFinishBooking?: () => Promise<void>;
  isDisabled?: boolean;
  activityDate?: string;
  airportDetails?: {
    enabled: boolean;
    city: string;
    airport: string;
    price: number;
  };
  bookingReference?: string;
  tourType?: 'group' | 'private';
  totalAmount?: string;
  onPaymentMethodChange?: (method: 'card' | 'cash') => void;
  onRemoveActivity?: (activityId: number) => void;
}

interface ReviewSectionProps {
  activityId: number;
  reviews: Review[];
  onReviewAdded: () => void;
  rating: number;
  totalReviews: number;
  showForm?: boolean;
  onClose?: () => void;
}
