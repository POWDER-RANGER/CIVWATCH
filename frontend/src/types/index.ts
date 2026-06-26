export type MarkerType = 'alpr' | 'facial_recognition' | 'microphone' | 'ice_raid' | 'protest';

export interface SurveillancePoint {
  id: string;
  lat: number;
  lng: number;
  type: MarkerType;
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  timestamp: string;
  installDate?: string;
  operator?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UNVERIFIED';
  lastVerified: string;
  feedUrl?: string;
  intensity?: number;
}

export interface AlertItem {
  id: string;
  type: MarkerType;
  label: string;
  description: string;
  location: string;
  city: string;
  state: string;
  timestamp: string;
}

export interface CameraFeed {
  id: string;
  label: string;
  location: string;
  status: 'ACTIVE' | 'OFFLINE' | 'INTERMITTENT';
  lastFrame?: string;
}

export interface MapCoords {
  lat: number;
  lng: number;
}

export type LayerVisibility = {
  [key in MarkerType]: boolean;
};
