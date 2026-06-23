import type { SurveillancePoint, AlertItem, CameraFeed } from '@/types';

export const MARKER_COLORS: Record<string, string> = {
  alpr: '#00E5C7',
  facial_recognition: '#FFB800',
  microphone: '#5A6570',
  ice_raid: '#FF453A',
  protest: '#8B5CF6',
};

export const MARKER_SYMBOLS: Record<string, string> = {
  alpr: '◆',
  facial_recognition: '▲',
  microphone: '●',
  ice_raid: '■',
  protest: '◉',
};

export const TYPE_LABELS: Record<string, string> = {
  alpr: 'AUTOMATIC LICENSE PLATE READER',
  facial_recognition: 'FACIAL RECOGNITION CAMERA',
  microphone: 'PUBLIC MICROPHONE ARRAY',
  ice_raid: 'ICE ENFORCEMENT ACTIVITY',
  protest: 'CIVIL DEMONSTRATION ZONE',
};

export const surveillancePoints: SurveillancePoint[] = [
  { id: 'alpr-001', lat: 32.8145, lng: -96.6184, type: 'alpr', title: 'FLOCK-2847', description: 'ALPR cluster — 12 cameras detected', location: 'Garland Rd & I-635', city: 'Dallas', state: 'TX', timestamp: '2024-06-24T14:32:00Z', installDate: '2024-03-15', operator: 'DALLAS PD / FLOCK SAFETY', status: 'ACTIVE', lastVerified: '2 HOURS AGO', intensity: 0.9 },
  { id: 'alpr-002', lat: 32.7767, lng: -96.7970, type: 'alpr', title: 'FLOCK-3102', description: 'High-traffic ALPR installation', location: 'I-35E & Royal Ln', city: 'Dallas', state: 'TX', timestamp: '2024-06-24T13:45:00Z', installDate: '2023-11-20', operator: 'DALLAS PD', status: 'ACTIVE', lastVerified: '1 HOUR AGO', intensity: 0.85 },
  { id: 'alpr-003', lat: 32.7901, lng: -96.8103, type: 'alpr', title: 'NTTA-CAM-47', description: 'Toll authority ALPR array', location: 'DNT & I-635', city: 'Dallas', state: 'TX', timestamp: '2024-06-24T12:20:00Z', installDate: '2024-01-10', operator: 'NTTA / VIGilant Solutions', status: 'ACTIVE', lastVerified: '3 HOURS AGO', intensity: 0.7 },
  { id: 'alpr-004', lat: 32.8482, lng: -96.7694, type: 'alpr', title: 'FLOCK-5129', description: 'New installation spotted', location: 'Skillman St & Walnut Hill Ln', city: 'Dallas', state: 'TX', timestamp: '2024-06-24T11:10:00Z', installDate: '2024-06-20', operator: 'FLOCK SAFETY', status: 'ACTIVE', lastVerified: '5 HOURS AGO', intensity: 0.6 },
  { id: 'alpr-005', lat: 32.7502, lng: -96.8207, type: 'alpr', title: 'FLOCK-0891', description: 'Oak Cliff corridor monitor', location: 'Zang Blvd & Colorado Blvd', city: 'Dallas', state: 'TX', timestamp: '2024-06-24T10:45:00Z', installDate: '2023-08-05', operator: 'DALLAS PD', status: 'ACTIVE', lastVerified: '6 HOURS AGO', intensity: 0.75 },
  { id: 'alpr-006', lat: 32.9259, lng: -96.7694, type: 'alpr', title: 'FLOCK-7623', description: 'Richardson border monitoring', location: 'Belt Line Rd & US-75', city: 'Richardson', state: 'TX', timestamp: '2024-06-24T09:30:00Z', installDate: '2024-04-01', operator: 'RICHARDSON PD', status: 'ACTIVE', lastVerified: '8 HOURS AGO', intensity: 0.5 },
  { id: 'alpr-007', lat: 32.7299, lng: -96.6989, type: 'alpr', title: 'FLOCK-4451', description: 'Pleasant Grove coverage', location: 'Lake June Rd & Masters Dr', city: 'Dallas', state: 'TX', timestamp: '2024-06-24T08:15:00Z', installDate: '2024-02-28', operator: 'DALLAS PD', status: 'ACTIVE', lastVerified: '10 HOURS AGO', intensity: 0.55 },
  { id: 'alpr-101', lat: 29.7604, lng: -95.3698, type: 'alpr', title: 'HPD-ALPR-12', description: 'Houston Police ALPR grid', location: 'I-10 & Loop 610', city: 'Houston', state: 'TX', timestamp: '2024-06-24T14:00:00Z', installDate: '2024-01-15', operator: 'HOUSTON PD', status: 'ACTIVE', lastVerified: '1 HOUR AGO', intensity: 0.8 },
  { id: 'alpr-102', lat: 30.2672, lng: -97.7431, type: 'alpr', title: 'APD-FLOCK-09', description: 'Austin downtown corridor', location: 'I-35 & 6th St', city: 'Austin', state: 'TX', timestamp: '2024-06-24T13:30:00Z', installDate: '2024-02-01', operator: 'AUSTIN PD', status: 'ACTIVE', lastVerified: '2 HOURS AGO', intensity: 0.7 },
  { id: 'alpr-103', lat: 33.7490, lng: -84.3880, type: 'alpr', title: 'ATL-FLOCK-55', description: 'Atlanta perimeter coverage', location: 'I-285 & GA-400', city: 'Atlanta', state: 'GA', timestamp: '2024-06-24T12:00:00Z', installDate: '2023-12-01', operator: 'ATLANTA PD', status: 'ACTIVE', lastVerified: '4 HOURS AGO', intensity: 0.65 },
  { id: 'alpr-104', lat: 34.0522, lng: -118.2437, type: 'alpr', title: 'LAPD-ALPR-88', description: 'LA freeway network node', location: 'I-110 & I-10', city: 'Los Angeles', state: 'CA', timestamp: '2024-06-24T11:30:00Z', installDate: '2024-03-01', operator: 'LAPD', status: 'ACTIVE', lastVerified: '3 HOURS AGO', intensity: 0.9 },
  { id: 'alpr-105', lat: 40.7128, lng: -74.0060, type: 'alpr', title: 'NYPD-ALPR-33', description: 'NYC bridge/tunnel monitoring', location: 'Holland Tunnel approach', city: 'New York', state: 'NY', timestamp: '2024-06-24T10:00:00Z', installDate: '2023-09-15', operator: 'NYPD', status: 'ACTIVE', lastVerified: '5 HOURS AGO', intensity: 0.85 },
  { id: 'alpr-106', lat: 41.8781, lng: -87.6298, type: 'alpr', title: 'CPD-FLOCK-21', description: 'Chicago expressway coverage', location: 'I-90 & I-290', city: 'Chicago', state: 'IL', timestamp: '2024-06-24T09:45:00Z', installDate: '2024-04-15', operator: 'CHICAGO PD', status: 'ACTIVE', lastVerified: '6 HOURS AGO', intensity: 0.75 },
  { id: 'alpr-107', lat: 39.9526, lng: -75.1652, type: 'alpr', title: 'PPD-ALPR-17', description: 'Philadelphia transit corridor', location: 'I-95 & I-676', city: 'Philadelphia', state: 'PA', timestamp: '2024-06-24T08:30:00Z', installDate: '2024-05-01', operator: 'PHILADELPHIA PD', status: 'ACTIVE', lastVerified: '7 HOURS AGO', intensity: 0.6 },
  { id: 'fr-001', lat: 32.7826, lng: -96.7989, type: 'facial_recognition', title: 'FACE-REC-DT01', description: 'Metro center station deployment', location: 'Metro Center Station', city: 'Nashville', state: 'TN', timestamp: '2024-06-24T12:15:00Z', installDate: '2024-05-20', operator: 'METRO NASHVILLE PD / CLEARVIEW AI', status: 'ACTIVE', lastVerified: '4 HOURS AGO', intensity: 0.5 },
  { id: 'fr-002', lat: 32.7767, lng: -96.7970, type: 'facial_recognition', title: 'DFW-FR-02', description: 'Downtown surveillance network', location: 'Main St & Akard St', city: 'Dallas', state: 'TX', timestamp: '2024-06-24T11:00:00Z', installDate: '2024-04-10', operator: 'DALLAS PD / NEC', status: 'ACTIVE', lastVerified: '3 HOURS AGO', intensity: 0.6 },
  { id: 'fr-003', lat: 29.7490, lng: -95.3582, type: 'facial_recognition', title: 'HOU-FR-05', description: 'Convention district monitoring', location: 'Discovery Green', city: 'Houston', state: 'TX', timestamp: '2024-06-24T10:30:00Z', installDate: '2024-03-01', operator: 'HOUSTON PD', status: 'ACTIVE', lastVerified: '5 HOURS AGO', intensity: 0.55 },
  { id: 'fr-004', lat: 33.4484, lng: -112.0740, type: 'facial_recognition', title: 'PHX-FR-12', description: 'Phoenix transit hub', location: 'Central Station', city: 'Phoenix', state: 'AZ', timestamp: '2024-06-24T09:00:00Z', installDate: '2024-01-20', operator: 'PHOENIX PD / AMAZON REKOGNITION', status: 'ACTIVE', lastVerified: '6 HOURS AGO', intensity: 0.45 },
  { id: 'fr-005', lat: 38.9072, lng: -77.0369, type: 'facial_recognition', title: 'DC-FR-01', description: 'Federal corridor surveillance', location: '14th St & Pennsylvania Ave', city: 'Washington', state: 'DC', timestamp: '2024-06-24T08:45:00Z', installDate: '2023-10-01', operator: 'DHS / CBP', status: 'ACTIVE', lastVerified: '8 HOURS AGO', intensity: 0.7 },
  { id: 'fr-006', lat: 37.7749, lng: -122.4194, type: 'facial_recognition', title: 'SF-FR-08', description: 'Union Square business district', location: 'Union Square', city: 'San Francisco', state: 'CA', timestamp: '2024-06-24T07:30:00Z', installDate: '2024-02-15', operator: 'SFPD', status: 'ACTIVE', lastVerified: '9 HOURS AGO', intensity: 0.5 },
  { id: 'fr-007', lat: 47.6062, lng: -122.3321, type: 'facial_recognition', title: 'SEA-FR-03', description: 'Pike Place Market coverage', location: 'Pike Place & 1st Ave', city: 'Seattle', state: 'WA', timestamp: '2024-06-24T06:15:00Z', installDate: '2024-05-01', operator: 'SEATTLE PD', status: 'ACTIVE', lastVerified: '10 HOURS AGO', intensity: 0.4 },
  { id: 'mic-001', lat: 32.7920, lng: -96.7699, type: 'microphone', title: 'SHOTSPOTTER-D14', description: 'Gunshot detection array', location: 'MLK Blvd & Second Ave', city: 'Dallas', state: 'TX', timestamp: '2024-06-24T11:30:00Z', installDate: '2023-06-01', operator: 'DALLAS PD / SOUNDTHINKING', status: 'ACTIVE', lastVerified: '2 HOURS AGO', intensity: 0.4 },
  { id: 'mic-002', lat: 29.7589, lng: -95.3674, type: 'microphone', title: 'SHOTSPOTTER-H09', description: 'Acoustic surveillance node', location: 'Third Ward', city: 'Houston', state: 'TX', timestamp: '2024-06-24T10:00:00Z', installDate: '2023-09-01', operator: 'HOUSTON PD', status: 'ACTIVE', lastVerified: '4 HOURS AGO', intensity: 0.35 },
  { id: 'mic-003', lat: 41.8781, lng: -87.6298, type: 'microphone', title: 'SS-CHI-22', description: 'South Side coverage zone', location: 'Englewood District', city: 'Chicago', state: 'IL', timestamp: '2024-06-24T09:00:00Z', installDate: '2023-03-15', operator: 'CHICAGO PD', status: 'ACTIVE', lastVerified: '6 HOURS AGO', intensity: 0.3 },
  { id: 'mic-004', lat: 40.7128, lng: -74.0060, type: 'microphone', title: 'NYPD-ASA-04', description: 'Broadway corridor audio', location: 'Times Square', city: 'New York', state: 'NY', timestamp: '2024-06-24T08:00:00Z', installDate: '2024-01-01', operator: 'NYPD', status: 'ACTIVE', lastVerified: '8 HOURS AGO', intensity: 0.45 },
  { id: 'ice-001', lat: 29.7604, lng: -95.3390, type: 'ice_raid', title: 'ICE-RAID-HOU-06', description: 'Enforcement spotted — apartment complex', location: 'Pecan Grove Apartments', city: 'Houston', state: 'TX', timestamp: '2024-06-24T13:47:00Z', operator: 'ICE / ERO', status: 'ACTIVE', lastVerified: '1 HOUR AGO', intensity: 0.95 },
  { id: 'ice-002', lat: 34.0522, lng: -118.2437, type: 'ice_raid', title: 'ICE-LA-12', description: 'Workplace enforcement action', location: 'Vernon & Soto St', city: 'Los Angeles', state: 'CA', timestamp: '2024-06-24T12:30:00Z', operator: 'ICE', status: 'ACTIVE', lastVerified: '3 HOURS AGO', intensity: 0.9 },
  { id: 'ice-003', lat: 40.7589, lng: -73.9851, type: 'ice_raid', title: 'ICE-NYC-08', description: 'Courthouse arrest reported', location: '26 Federal Plaza', city: 'New York', state: 'NY', timestamp: '2024-06-24T11:15:00Z', operator: 'ICE', status: 'ACTIVE', lastVerified: '4 HOURS AGO', intensity: 0.85 },
  { id: 'ice-004', lat: 25.7617, lng: -80.1918, type: 'ice_raid', title: 'ICE-MIA-04', description: 'Home raid — early morning', location: 'Little Havana', city: 'Miami', state: 'FL', timestamp: '2024-06-24T09:00:00Z', operator: 'ICE', status: 'ACTIVE', lastVerified: '6 HOURS AGO', intensity: 0.8 },
  { id: 'ice-005', lat: 33.4484, lng: -112.0740, type: 'ice_raid', title: 'ICE-PHX-03', description: 'Traffic stop escalation', location: '27th Ave & Van Buren', city: 'Phoenix', state: 'AZ', timestamp: '2024-06-24T08:30:00Z', operator: 'ICE / BP', status: 'ACTIVE', lastVerified: '7 HOURS AGO', intensity: 0.75 },
  { id: 'ice-006', lat: 44.9778, lng: -93.2650, type: 'ice_raid', title: 'ICE-MIN-02', description: 'Community center surveillance', location: 'Lake St & Chicago Ave', city: 'Minneapolis', state: 'MN', timestamp: '2024-06-24T07:00:00Z', operator: 'ICE', status: 'ACTIVE', lastVerified: '9 HOURS AGO', intensity: 0.7 },
  { id: 'pro-001', lat: 45.5152, lng: -122.6784, type: 'protest', title: 'DEMO-PDX-01', description: 'Demonstration active — city hall', location: 'City Hall Plaza', city: 'Portland', state: 'OR', timestamp: '2024-06-24T11:58:00Z', status: 'ACTIVE', lastVerified: '30 MIN AGO', intensity: 0.5 },
  { id: 'pro-002', lat: 38.9072, lng: -77.0369, type: 'protest', title: 'DEMO-DC-03', description: 'Civil rights march — National Mall', location: 'National Mall', city: 'Washington', state: 'DC', timestamp: '2024-06-24T10:30:00Z', status: 'ACTIVE', lastVerified: '2 HOURS AGO', intensity: 0.6 },
  { id: 'pro-003', lat: 37.8044, lng: -122.2712, type: 'protest', title: 'DEMO-OAK-02', description: 'Port action — waterfront', location: 'Port of Oakland', city: 'Oakland', state: 'CA', timestamp: '2024-06-24T09:00:00Z', status: 'ACTIVE', lastVerified: '4 HOURS AGO', intensity: 0.45 },
  { id: 'pro-004', lat: 41.8756, lng: -87.6244, type: 'protest', title: 'DEMO-CHI-01', description: 'Labor strike — downtown core', location: 'Daley Plaza', city: 'Chicago', state: 'IL', timestamp: '2024-06-24T08:00:00Z', status: 'ACTIVE', lastVerified: '5 HOURS AGO', intensity: 0.4 },
];

export const alerts: AlertItem[] = [
  { id: 'a-001', type: 'alpr', label: 'ALPR CLUSTER', description: '12 cameras detected', location: 'I-35E & Royal Ln', city: 'Dallas', state: 'TX', timestamp: '14:32 UTC' },
  { id: 'a-002', type: 'ice_raid', label: 'ICE ACTIVITY', description: 'Enforcement spotted', location: 'Pecan Grove Apartments', city: 'Houston', state: 'TX', timestamp: '13:47 UTC' },
  { id: 'a-003', type: 'facial_recognition', label: 'FACE REC', description: 'New installation', location: 'Metro Center Station', city: 'Nashville', state: 'TN', timestamp: '12:15 UTC' },
  { id: 'a-004', type: 'protest', label: 'PROTEST', description: 'Demonstration active', location: 'City Hall Plaza', city: 'Portland', state: 'OR', timestamp: '11:58 UTC' },
  { id: 'a-005', type: 'alpr', label: 'ALPR DEPLOYED', description: 'Flock camera installation confirmed', location: 'Garland Rd & I-635', city: 'Dallas', state: 'TX', timestamp: '11:22 UTC' },
  { id: 'a-006', type: 'ice_raid', label: 'ICE RAID', description: 'Early morning enforcement', location: 'Little Havana', city: 'Miami', state: 'FL', timestamp: '10:45 UTC' },
  { id: 'a-007', type: 'microphone', label: 'MIC ARRAY', description: 'ShotSpotter expansion', location: 'MLK Blvd & Second Ave', city: 'Dallas', state: 'TX', timestamp: '10:15 UTC' },
  { id: 'a-008', type: 'facial_recognition', label: 'FACE REC', description: 'Federal corridor deployment', location: '14th St corridor', city: 'Washington', state: 'DC', timestamp: '09:30 UTC' },
  { id: 'a-009', type: 'protest', label: 'PROTEST', description: 'Civil rights march forming', location: 'National Mall', city: 'Washington', state: 'DC', timestamp: '09:00 UTC' },
  { id: 'a-010', type: 'ice_raid', label: 'ICE ACTIVITY', description: 'Courthouse arrest reported', location: '26 Federal Plaza', city: 'New York', state: 'NY', timestamp: '08:45 UTC' },
];

export const cameraFeeds: CameraFeed[] = [
  { id: 'feed-001', label: 'FLOCK-2847 // GARLAND RD', location: 'Garland Rd & I-635, Dallas, TX', status: 'ACTIVE' },
  { id: 'feed-002', label: 'DOT-CAM-91 // I-35E N', location: 'I-35E & Royal Ln, Dallas, TX', status: 'ACTIVE' },
  { id: 'feed-003', label: 'PRIV-SAFE-03 // KNOLLWOOD', location: 'Knollwood & Lovers Ln, Dallas, TX', status: 'INTERMITTENT' },
  { id: 'feed-004', label: 'NTTA-47 // DNT S', location: 'DNT & I-635, Dallas, TX', status: 'OFFLINE' },
  { id: 'feed-005', label: 'HPD-FEED-12 // I-10', location: 'I-10 & Loop 610, Houston, TX', status: 'ACTIVE' },
];

export const tickerText = '[LIVE] ICE enforcement activity reported — Pecan Grove Apartments, Houston :: [ALERT] Flock camera installation confirmed — Garland Rd & I-635, Dallas :: [UPDATE] Facial recognition deployment — 14th St corridor, DC :: [PROTEST] Demonstration forming — City Hall Plaza, Portland :: [RAID] Early morning ICE action — Little Havana, Miami :: [NEW] ShotSpotter array expanded — MLK Blvd, Dallas';
