
import React from 'react';

export type ViewMode = 'homes' | 'experiences' | 'services';

export interface Property {
  id: string;
  title: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  distance?: string;
  dates?: string;
  isGuestFavorite?: boolean;
  comingSoon?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string | React.ReactNode;
}

export interface RoomFeature {
  icon: React.ReactNode;
  label: string;
}

export interface Room {
  id: string;
  imageUrl: string;
  imageAlt: string;
  roomType: string;
  roomName: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  features: RoomFeature[];
  available: boolean;
  beds: string;
  size: string;
  guests: number;
  images?: string[];
}
