export interface Official {
  id: string;
  name: string;
  title: string;
  state: string;
  party: string;
  chamber: string;
  accountabilityScore: number;
  promiseFulfilled: number;
  promiseTotal: number;
  totalContributions: number;
  topDonors: Donor[];
  recentVotes: Vote[];
  promises: Promise[];
}

export interface Donor {
  name: string;
  amount: number;
  industry: string;
}

export interface Vote {
  bill: string;
  title: string;
  date: string;
  vote: 'Yea' | 'Nay' | 'Present' | 'Not Voting';
  alignedWithDonors: boolean | null;
}

export interface Promise {
  text: string;
  status: 'fulfilled' | 'broken' | 'in-progress' | 'not-started';
  dateMade: string;
}

export interface ContributionRecord {
  id: string;
  donor: string;
  recipient: string;
  amount: number;
  date: string;
  industry: string;
  type: 'individual' | 'pac' | 'lobbyist';
}

export interface AnomalyFlag {
  id: string;
  score: number;
  label: string;
  method: string;
  color: string;
  timestamp: string;
}

export interface LobbyingRecord {
  id: string;
  client: string;
  amount: number;
  issue: string;
  date: string;
  agency: string;
}

export const OFFICIALS: Official[] = [
  {
    id: '1',
    name: 'Sen. Margaret Chen',
    title: 'Senior Senator',
    state: 'CA',
    party: 'Democrat',
    chamber: 'Senate',
    accountabilityScore: 78,
    promiseFulfilled: 12,
    promiseTotal: 18,
    totalContributions: 2840000,
    topDonors: [
      { name: 'TechNet PAC', amount: 145000, industry: 'Technology' },
      { name: 'GreenFuture Fund', amount: 98000, industry: 'Environment' },
      { name: 'United Healthcare Workers', amount: 87000, industry: 'Healthcare' },
      { name: 'Silicon Valley Innovation', amount: 76000, industry: 'Technology' },
      { name: 'Education Forward', amount: 54000, industry: 'Education' },
    ],
    recentVotes: [
      { bill: 'S.2847', title: 'Infrastructure Modernization Act', date: '2026-05-14', vote: 'Yea', alignedWithDonors: true },
      { bill: 'S.2901', title: 'Data Privacy Protection Act', date: '2026-04-28', vote: 'Yea', alignedWithDonors: true },
      { bill: 'S.2756', title: 'Defense Authorization Increase', date: '2026-04-15', vote: 'Nay', alignedWithDonors: false },
      { bill: 'S.2689', title: 'Healthcare Cost Transparency', date: '2026-03-22', vote: 'Yea', alignedWithDonors: true },
      { bill: 'S.2612', title: 'Tech Antitrust Reform', date: '2026-03-10', vote: 'Yea', alignedWithDonors: false },
    ],
    promises: [
      { text: 'Vote against defense spending increases over 3%', status: 'fulfilled', dateMade: '2024-08-15' },
      { text: 'Co-sponsor data privacy legislation', status: 'fulfilled', dateMade: '2024-09-01' },
      { text: 'Support universal healthcare framework', status: 'in-progress', dateMade: '2024-10-20' },
      { text: 'Oppose fossil fuel subsidies', status: 'fulfilled', dateMade: '2024-08-15' },
    ],
  },
  {
    id: '2',
    name: 'Rep. James Whitfield',
    title: 'Representative',
    state: 'TX',
    party: 'Republican',
    chamber: 'House',
    accountabilityScore: 34,
    promiseFulfilled: 3,
    promiseTotal: 14,
    totalContributions: 1920000,
    topDonors: [
      { name: 'Energy Independence PAC', amount: 187000, industry: 'Energy' },
      { name: 'Texans for Prosperity', amount: 134000, industry: 'Finance' },
      { name: 'NRA Political Fund', amount: 95000, industry: 'Gun Rights' },
      { name: 'American Energy Alliance', amount: 88000, industry: 'Energy' },
      { name: 'Conservative Action Fund', amount: 67000, industry: 'Conservative' },
    ],
    recentVotes: [
      { bill: 'H.R.4102', title: 'Energy Deregulation Act', date: '2026-05-20', vote: 'Yea', alignedWithDonors: true },
      { bill: 'H.R.4089', title: 'Gun Rights Expansion Act', date: '2026-05-12', vote: 'Yea', alignedWithDonors: true },
      { bill: 'H.R.3956', title: 'Campaign Finance Reform', date: '2026-04-18', vote: 'Nay', alignedWithDonors: false },
      { bill: 'H.R.3877', title: 'Renewable Energy Tax Credits', date: '2026-04-05', vote: 'Nay', alignedWithDonors: true },
      { bill: 'H.R.3721', title: 'Financial Regulation Rollback', date: '2026-03-28', vote: 'Yea', alignedWithDonors: true },
    ],
    promises: [
      { text: 'Support term limits for Congress', status: 'not-started', dateMade: '2024-09-10' },
      { text: 'Oppose federal energy regulations', status: 'fulfilled', dateMade: '2024-09-10' },
      { text: 'Vote against tax increases', status: 'fulfilled', dateMade: '2024-09-10' },
      { text: 'Support border security funding', status: 'in-progress', dateMade: '2024-11-05' },
    ],
  },
  {
    id: '3',
    name: 'Sen. Robert Martinez',
    title: 'Junior Senator',
    state: 'FL',
    party: 'Republican',
    chamber: 'Senate',
    accountabilityScore: 52,
    promiseFulfilled: 7,
    promiseTotal: 16,
    totalContributions: 3560000,
    topDonors: [
      { name: 'Florida Real Estate Trust', amount: 210000, industry: 'Real Estate' },
      { name: 'Hospitality PAC', amount: 165000, industry: 'Hospitality' },
      { name: 'Sugar Cane Growers Assoc', amount: 143000, industry: 'Agriculture' },
      { name: 'Coastal Development Fund', amount: 98000, industry: 'Real Estate' },
      { name: 'Maritime Industry Council', amount: 87000, industry: 'Transportation' },
    ],
    recentVotes: [
      { bill: 'S.2847', title: 'Infrastructure Modernization Act', date: '2026-05-14', vote: 'Yea', alignedWithDonors: true },
      { bill: 'S.2901', title: 'Data Privacy Protection Act', date: '2026-04-28', vote: 'Nay', alignedWithDonors: null },
      { bill: 'S.2812', title: 'Coastal Protection Funding', date: '2026-04-20', vote: 'Yea', alignedWithDonors: true },
      { bill: 'S.2756', title: 'Defense Authorization Increase', date: '2026-04-15', vote: 'Yea', alignedWithDonors: null },
      { bill: 'S.2701', title: 'Agricultural Subsidy Reform', date: '2026-03-30', vote: 'Yea', alignedWithDonors: true },
    ],
    promises: [
      { text: 'Support infrastructure investment in FL', status: 'fulfilled', dateMade: '2024-08-20' },
      { text: 'Oppose federal sugar subsidies', status: 'broken', dateMade: '2024-08-20' },
      { text: 'Vote for coastal resilience funding', status: 'fulfilled', dateMade: '2024-10-01' },
    ],
  },
  {
    id: '4',
    name: 'Rep. Aisha Johnson',
    title: 'Representative',
    state: 'NY',
    party: 'Democrat',
    chamber: 'House',
    accountabilityScore: 91,
    promiseFulfilled: 15,
    promiseTotal: 16,
    totalContributions: 1680000,
    topDonors: [
      { name: 'Progressive Action Fund', amount: 78000, industry: 'Progressive' },
      { name: 'Teachers Union PAC', amount: 65000, industry: 'Education' },
      { name: 'Climate Justice Coalition', amount: 54000, industry: 'Environment' },
      { name: 'Public Defender Fund', amount: 43000, industry: 'Justice' },
      { name: 'Small Business Alliance', amount: 38000, industry: 'Small Business' },
    ],
    recentVotes: [
      { bill: 'H.R.4102', title: 'Energy Deregulation Act', date: '2026-05-20', vote: 'Nay', alignedWithDonors: true },
      { bill: 'H.R.4089', title: 'Gun Rights Expansion Act', date: '2026-05-12', vote: 'Nay', alignedWithDonors: true },
      { bill: 'H.R.3956', title: 'Campaign Finance Reform', date: '2026-04-18', vote: 'Yea', alignedWithDonors: true },
      { bill: 'H.R.3877', title: 'Renewable Energy Tax Credits', date: '2026-04-05', vote: 'Yea', alignedWithDonors: true },
      { bill: 'H.R.3721', title: 'Financial Regulation Rollback', date: '2026-03-28', vote: 'Nay', alignedWithDonors: true },
    ],
    promises: [
      { text: 'Support campaign finance reform', status: 'fulfilled', dateMade: '2024-07-15' },
      { text: 'Vote for renewable energy expansion', status: 'fulfilled', dateMade: '2024-07-15' },
      { text: 'Oppose financial deregulation', status: 'fulfilled', dateMade: '2024-07-15' },
      { text: 'Support public education funding', status: 'fulfilled', dateMade: '2024-09-01' },
    ],
  },
  {
    id: '5',
    name: 'Sen. David Park',
    title: 'Senior Senator',
    state: 'WA',
    party: 'Democrat',
    chamber: 'Senate',
    accountabilityScore: 85,
    promiseFulfilled: 11,
    promiseTotal: 14,
    totalContributions: 2340000,
    topDonors: [
      { name: 'Microsoft PAC', amount: 112000, industry: 'Technology' },
      { name: 'Amazon Employee Fund', amount: 98000, industry: 'Technology' },
      { name: 'Boeing Workers Union', amount: 87000, industry: 'Manufacturing' },
      { name: 'Clean Energy Northwest', amount: 76000, industry: 'Environment' },
      { name: 'University Research Alliance', amount: 54000, industry: 'Education' },
    ],
    recentVotes: [
      { bill: 'S.2901', title: 'Data Privacy Protection Act', date: '2026-04-28', vote: 'Yea', alignedWithDonors: true },
      { bill: 'S.2847', title: 'Infrastructure Modernization Act', date: '2026-05-14', vote: 'Yea', alignedWithDonors: true },
      { bill: 'S.2812', title: 'Defense Tech Procurement', date: '2026-04-20', vote: 'Yea', alignedWithDonors: true },
      { bill: 'S.2756', title: 'Defense Authorization Increase', date: '2026-04-15', vote: 'Nay', alignedWithDonors: false },
      { bill: 'S.2689', title: 'Healthcare Cost Transparency', date: '2026-03-22', vote: 'Yea', alignedWithDonors: null },
    ],
    promises: [
      { text: 'Support tech worker protections', status: 'fulfilled', dateMade: '2024-08-01' },
      { text: 'Vote for data privacy legislation', status: 'fulfilled', dateMade: '2024-08-01' },
      { text: 'Support clean energy investment', status: 'fulfilled', dateMade: '2024-09-15' },
      { text: 'Oppose unlimited defense spending', status: 'fulfilled', dateMade: '2024-10-01' },
    ],
  },
  {
    id: '6',
    name: 'Rep. Sarah Mitchell',
    title: 'Representative',
    state: 'OH',
    party: 'Republican',
    chamber: 'House',
    accountabilityScore: 41,
    promiseFulfilled: 4,
    promiseTotal: 12,
    totalContributions: 1280000,
    topDonors: [
      { name: 'Ohio Manufacturers Assoc', amount: 134000, industry: 'Manufacturing' },
      { name: 'Midwest Energy Coalition', amount: 112000, industry: 'Energy' },
      { name: 'Farm Bureau PAC', amount: 98000, industry: 'Agriculture' },
      { name: 'Community Bankers Fund', amount: 76000, industry: 'Finance' },
      { name: 'Home Builders PAC', amount: 54000, industry: 'Construction' },
    ],
    recentVotes: [
      { bill: 'H.R.4102', title: 'Energy Deregulation Act', date: '2026-05-20', vote: 'Yea', alignedWithDonors: true },
      { bill: 'H.R.3956', title: 'Campaign Finance Reform', date: '2026-04-18', vote: 'Nay', alignedWithDonors: false },
      { bill: 'H.R.3877', title: 'Renewable Energy Tax Credits', date: '2026-04-05', vote: 'Nay', alignedWithDonors: true },
      { bill: 'H.R.3721', title: 'Financial Regulation Rollback', date: '2026-03-28', vote: 'Yea', alignedWithDonors: true },
      { bill: 'H.R.3655', title: 'Agricultural Trade Protection', date: '2026-03-15', vote: 'Yea', alignedWithDonors: true },
    ],
    promises: [
      { text: 'Support Ohio manufacturing jobs', status: 'fulfilled', dateMade: '2024-09-01' },
      { text: 'Oppose energy regulations', status: 'fulfilled', dateMade: '2024-09-01' },
      { text: 'Vote for term limits', status: 'not-started', dateMade: '2024-09-01' },
      { text: 'Support campaign finance transparency', status: 'broken', dateMade: '2024-11-01' },
    ],
  },
];

export const ANOMALIES: AnomalyFlag[] = [
  { id: '1', score: 0.94, label: 'PAC contribution surge · Energy Industry → Rep. Whitfield', method: 'DBSCAN', color: '#C94040', timestamp: '2026-06-23T14:32:00Z' },
  { id: '2', score: 0.88, label: 'Lobbying spend spike · Real Estate → Sen. Martinez', method: 'ML', color: '#C94040', timestamp: '2026-06-23T12:15:00Z' },
  { id: '3', score: 0.79, label: 'Network edge: shared donor Rep. A ↔ Sen. B (opposing parties)', method: 'Graph', color: '#B87D28', timestamp: '2026-06-23T10:45:00Z' },
  { id: '4', score: 0.73, label: 'Vote misalignment: Sen. Park votes against Microsoft interests', method: 'z-score', color: '#B87D28', timestamp: '2026-06-22T22:18:00Z' },
  { id: '5', score: 0.67, label: 'Promise pattern: Rep. Johnson 94% fulfillment rate (outlier)', method: 'z-score', color: '#B87D28', timestamp: '2026-06-22T18:30:00Z' },
  { id: '6', score: 0.52, label: 'Contribution timing anomaly · pre-vote clustering detected', method: 'DBSCAN', color: '#3A7044', timestamp: '2026-06-22T14:22:00Z' },
  { id: '7', score: 0.41, label: 'Cross-committee donor correlation flagged for review', method: 'Graph', color: '#3A7044', timestamp: '2026-06-21T09:15:00Z' },
];

export const LOBBYING: LobbyingRecord[] = [
  { id: '1', client: 'American Energy Alliance', amount: 2840000, issue: 'Energy Deregulation', date: '2026-06-15', agency: 'House Energy Committee' },
  { id: '2', client: 'TechNet Coalition', amount: 1920000, issue: 'Data Privacy Standards', date: '2026-06-10', agency: 'Senate Commerce Committee' },
  { id: '3', client: 'Real Estate Investment Trust', amount: 1560000, issue: 'Tax Code Provisions', date: '2026-06-08', agency: 'Ways and Means Committee' },
  { id: '4', client: 'Pharmaceutical Research Alliance', amount: 3420000, issue: 'Drug Pricing Reform Opposition', date: '2026-06-01', agency: 'Senate Health Committee' },
  { id: '5', client: 'Financial Services Roundtable', amount: 2180000, issue: 'Regulatory Rollback', date: '2026-05-28', agency: 'Banking Committee' },
  { id: '6', client: 'Defense Contractors Association', amount: 4100000, issue: 'Defense Authorization', date: '2026-05-22', agency: 'Armed Services Committee' },
];

export const PLATFORM_STATS = {
  officialsTracked: 537,
  contributionsAnalyzed: 2840000,
  votesRecorded: 12847,
  promisesTracked: 3421,
  lobbyistsTracked: 1847,
  anomaliesFlagged: 23,
  dataSources: 14,
  lastUpdated: '2026-06-24T06:00:00Z',
};

export const CHART_COLORS = {
  red: '#C94040',
  redHi: '#E05050',
  amber: '#B87D28',
  amberHi: '#D4943A',
  green: '#3A7044',
  greenHi: '#4A8A56',
  blue: '#2A6096',
  blueHi: '#3A80C0',
  text: '#D8CFC0',
  textDim: '#6B6358',
  textMid: '#9B9080',
  border: '#2A2620',
  bg: '#0C0B09',
  bgPanel: '#111009',
};
