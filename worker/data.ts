export interface SeasonalMetrics {
  waterAreaHa: number;
  permanentAreaHa: number;
  seasonalAreaHa: number;
  vegetationCoverPct: number;
  ndwi: number;
  mndwi: number;
  ndti: number;
  sarBackscatterDb: number;
  sensorSource: string;
}

export interface WetlandRecord {
  id: string;
  name: string;
  district: string;
  block: string;
  wetlandType: string;
  primaryUse: string;
  regime: string;
  hydroPeriodPersistencePct: number;
  baselineAreaHa: number;
  center: [number, number];
  monsoonRing: [number, number][];
  permanentRing: [number, number][];
  seasons: Record<string, SeasonalMetrics>;
  alertStatus: string;
  alertSeverity?: string;
  alertDeltaPct?: number;
  verificationStatus: string;
  lastVerifiedAt: string;
  fisheriesDependenceHouseholds: number;
  irrigationCommandHa: number;
}

function makeBeelRing(
  lng: number,
  lat: number,
  rx: number,
  ry: number,
  seed: number
): [number, number][] {
  const points: [number, number][] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const wobble = 0.78 + 0.35 * Math.abs(Math.sin(angle * 2.5 + seed));
    const px = Number((lng + Math.cos(angle) * rx * wobble).toFixed(5));
    const py = Number((lat + Math.sin(angle) * ry * wobble).toFixed(5));
    points.push([px, py]);
  }
  points.push(points[0]);
  return points;
}

export const INITIAL_WETLANDS: WetlandRecord[] = [
  {
    id: "AS-KMP-001",
    name: "Deepor Beel",
    district: "Kamrup Metro",
    block: "Rani",
    wetlandType: "Floodplain Marsh",
    primaryUse: "Both",
    regime: "At-Risk",
    hydroPeriodPersistencePct: 68,
    baselineAreaHa: 920,
    center: [91.662, 26.118],
    monsoonRing: makeBeelRing(91.662, 26.118, 0.026, 0.015, 1.2),
    permanentRing: makeBeelRing(91.662, 26.118, 0.014, 0.008, 1.2),
    seasons: {
      pre_monsoon: { waterAreaHa: 485, permanentAreaHa: 410, seasonalAreaHa: 75, vegetationCoverPct: 38, ndwi: 0.24, mndwi: 0.31, ndti: 0.19, sarBackscatterDb: -16.8, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 1040, permanentAreaHa: 410, seasonalAreaHa: 630, vegetationCoverPct: 24, ndwi: 0.48, mndwi: 0.56, ndti: 0.28, sarBackscatterDb: -19.4, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 760, permanentAreaHa: 410, seasonalAreaHa: 350, vegetationCoverPct: 34, ndwi: 0.36, mndwi: 0.44, ndti: 0.22, sarBackscatterDb: -18.1, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 540, permanentAreaHa: 410, seasonalAreaHa: 130, vegetationCoverPct: 41, ndwi: 0.27, mndwi: 0.34, ndti: 0.17, sarBackscatterDb: -17.2, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Hyacinth Bloom",
    alertSeverity: "High",
    alertDeltaPct: -17.4,
    verificationStatus: "Pending Field Check",
    lastVerifiedAt: "2026-10-14",
    fisheriesDependenceHouseholds: 820,
    irrigationCommandHa: 310,
  },
  {
    id: "AS-SRB-002",
    name: "Son Beel",
    district: "Sribhumi",
    block: "Dullavcherra",
    wetlandType: "Tectonic Lake",
    primaryUse: "Both",
    regime: "Seasonal",
    hydroPeriodPersistencePct: 48,
    baselineAreaHa: 2850,
    center: [92.444, 24.675],
    monsoonRing: makeBeelRing(92.444, 24.675, 0.032, 0.044, 2.4),
    permanentRing: makeBeelRing(92.444, 24.675, 0.012, 0.018, 2.4),
    seasons: {
      pre_monsoon: { waterAreaHa: 640, permanentAreaHa: 520, seasonalAreaHa: 120, vegetationCoverPct: 22, ndwi: 0.21, mndwi: 0.29, ndti: 0.14, sarBackscatterDb: -16.1, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 3420, permanentAreaHa: 520, seasonalAreaHa: 2900, vegetationCoverPct: 12, ndwi: 0.54, mndwi: 0.62, ndti: 0.31, sarBackscatterDb: -20.2, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 2150, permanentAreaHa: 520, seasonalAreaHa: 1630, vegetationCoverPct: 18, ndwi: 0.42, mndwi: 0.49, ndti: 0.21, sarBackscatterDb: -18.8, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 780, permanentAreaHa: 520, seasonalAreaHa: 260, vegetationCoverPct: 26, ndwi: 0.25, mndwi: 0.32, ndti: 0.15, sarBackscatterDb: -16.9, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Normal",
    verificationStatus: "Verified",
    lastVerifiedAt: "2026-11-02",
    fisheriesDependenceHouseholds: 1650,
    irrigationCommandHa: 1420,
  },
  {
    id: "AS-MRG-003",
    name: "Tamulidoba Beel",
    district: "Morigaon",
    block: "Mayong",
    wetlandType: "Floodplain Marsh",
    primaryUse: "Fisheries",
    regime: "Permanent",
    hydroPeriodPersistencePct: 82,
    baselineAreaHa: 410,
    center: [92.055, 26.245],
    monsoonRing: makeBeelRing(92.055, 26.245, 0.018, 0.013, 3.1),
    permanentRing: makeBeelRing(92.055, 26.245, 0.012, 0.009, 3.1),
    seasons: {
      pre_monsoon: { waterAreaHa: 315, permanentAreaHa: 290, seasonalAreaHa: 25, vegetationCoverPct: 19, ndwi: 0.38, mndwi: 0.46, ndti: 0.12, sarBackscatterDb: -18.4, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 520, permanentAreaHa: 290, seasonalAreaHa: 230, vegetationCoverPct: 14, ndwi: 0.52, mndwi: 0.60, ndti: 0.25, sarBackscatterDb: -19.9, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 430, permanentAreaHa: 290, seasonalAreaHa: 140, vegetationCoverPct: 16, ndwi: 0.44, mndwi: 0.51, ndti: 0.18, sarBackscatterDb: -18.9, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 360, permanentAreaHa: 290, seasonalAreaHa: 70, vegetationCoverPct: 18, ndwi: 0.40, mndwi: 0.48, ndti: 0.13, sarBackscatterDb: -18.6, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Normal",
    verificationStatus: "Verified",
    lastVerifiedAt: "2026-11-08",
    fisheriesDependenceHouseholds: 430,
    irrigationCommandHa: 180,
  },
  {
    id: "AS-GLP-004",
    name: "Urpad Beel",
    district: "Goalpara",
    block: "Balijana",
    wetlandType: "Beel (Oxbow)",
    primaryUse: "Both",
    regime: "Permanent",
    hydroPeriodPersistencePct: 79,
    baselineAreaHa: 1120,
    center: [90.618, 26.102],
    monsoonRing: makeBeelRing(90.618, 26.102, 0.025, 0.017, 4.7),
    permanentRing: makeBeelRing(90.618, 26.102, 0.016, 0.011, 4.7),
    seasons: {
      pre_monsoon: { waterAreaHa: 810, permanentAreaHa: 760, seasonalAreaHa: 50, vegetationCoverPct: 21, ndwi: 0.35, mndwi: 0.43, ndti: 0.14, sarBackscatterDb: -18.2, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 1380, permanentAreaHa: 760, seasonalAreaHa: 620, vegetationCoverPct: 15, ndwi: 0.51, mndwi: 0.59, ndti: 0.24, sarBackscatterDb: -19.8, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 1160, permanentAreaHa: 760, seasonalAreaHa: 400, vegetationCoverPct: 18, ndwi: 0.43, mndwi: 0.50, ndti: 0.17, sarBackscatterDb: -19.0, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 940, permanentAreaHa: 760, seasonalAreaHa: 180, vegetationCoverPct: 20, ndwi: 0.39, mndwi: 0.46, ndti: 0.15, sarBackscatterDb: -18.5, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Normal",
    verificationStatus: "Verified",
    lastVerifiedAt: "2026-10-29",
    fisheriesDependenceHouseholds: 940,
    irrigationCommandHa: 680,
  },
  {
    id: "AS-NGA-005",
    name: "Morikolong Beel",
    district: "Nagaon",
    block: "Khagarijan",
    wetlandType: "Beel (Oxbow)",
    primaryUse: "Irrigation",
    regime: "At-Risk",
    hydroPeriodPersistencePct: 54,
    baselineAreaHa: 340,
    center: [92.685, 26.338],
    monsoonRing: makeBeelRing(92.685, 26.338, 0.017, 0.010, 5.5),
    permanentRing: makeBeelRing(92.685, 26.338, 0.008, 0.005, 5.5),
    seasons: {
      pre_monsoon: { waterAreaHa: 155, permanentAreaHa: 130, seasonalAreaHa: 25, vegetationCoverPct: 44, ndwi: 0.18, mndwi: 0.24, ndti: 0.24, sarBackscatterDb: -15.4, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 365, permanentAreaHa: 130, seasonalAreaHa: 235, vegetationCoverPct: 29, ndwi: 0.41, mndwi: 0.49, ndti: 0.30, sarBackscatterDb: -18.7, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 260, permanentAreaHa: 130, seasonalAreaHa: 130, vegetationCoverPct: 36, ndwi: 0.29, mndwi: 0.36, ndti: 0.25, sarBackscatterDb: -17.3, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 185, permanentAreaHa: 130, seasonalAreaHa: 55, vegetationCoverPct: 42, ndwi: 0.21, mndwi: 0.27, ndti: 0.22, sarBackscatterDb: -16.0, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Encroachment Risk",
    alertSeverity: "High",
    alertDeltaPct: -21.8,
    verificationStatus: "Flagged",
    lastVerifiedAt: "2026-10-03",
    fisheriesDependenceHouseholds: 290,
    irrigationCommandHa: 540,
  },
  {
    id: "AS-DHM-006",
    name: "Bordoibam Bilmukh",
    district: "Dhemaji",
    block: "Bordoloni",
    wetlandType: "Riverine Swamp",
    primaryUse: "Fisheries",
    regime: "Seasonal",
    hydroPeriodPersistencePct: 62,
    baselineAreaHa: 780,
    center: [94.336, 27.335],
    monsoonRing: makeBeelRing(94.336, 27.335, 0.022, 0.015, 6.2),
    permanentRing: makeBeelRing(94.336, 27.335, 0.011, 0.008, 6.2),
    seasons: {
      pre_monsoon: { waterAreaHa: 390, permanentAreaHa: 340, seasonalAreaHa: 50, vegetationCoverPct: 28, ndwi: 0.26, mndwi: 0.33, ndti: 0.16, sarBackscatterDb: -17.1, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 1120, permanentAreaHa: 340, seasonalAreaHa: 780, vegetationCoverPct: 16, ndwi: 0.53, mndwi: 0.61, ndti: 0.29, sarBackscatterDb: -20.1, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 740, permanentAreaHa: 340, seasonalAreaHa: 400, vegetationCoverPct: 22, ndwi: 0.39, mndwi: 0.47, ndti: 0.20, sarBackscatterDb: -18.5, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 460, permanentAreaHa: 340, seasonalAreaHa: 120, vegetationCoverPct: 26, ndwi: 0.29, mndwi: 0.37, ndti: 0.17, sarBackscatterDb: -17.5, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Shrinkage Alert",
    alertSeverity: "Medium",
    alertDeltaPct: -15.6,
    verificationStatus: "Pending Field Check",
    lastVerifiedAt: "2026-09-28",
    fisheriesDependenceHouseholds: 610,
    irrigationCommandHa: 270,
  },
  {
    id: "AS-DHB-007",
    name: "Dhir Beel",
    district: "Dhubri",
    block: "Chapar",
    wetlandType: "Beel (Oxbow)",
    primaryUse: "Fisheries",
    regime: "Permanent",
    hydroPeriodPersistencePct: 84,
    baselineAreaHa: 620,
    center: [90.372, 26.278],
    monsoonRing: makeBeelRing(90.372, 26.278, 0.020, 0.013, 7.3),
    permanentRing: makeBeelRing(90.372, 26.278, 0.014, 0.009, 7.3),
    seasons: {
      pre_monsoon: { waterAreaHa: 480, permanentAreaHa: 450, seasonalAreaHa: 30, vegetationCoverPct: 17, ndwi: 0.39, mndwi: 0.47, ndti: 0.13, sarBackscatterDb: -18.7, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 790, permanentAreaHa: 450, seasonalAreaHa: 340, vegetationCoverPct: 12, ndwi: 0.55, mndwi: 0.63, ndti: 0.23, sarBackscatterDb: -20.0, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 650, permanentAreaHa: 450, seasonalAreaHa: 200, vegetationCoverPct: 15, ndwi: 0.46, mndwi: 0.53, ndti: 0.16, sarBackscatterDb: -19.1, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 530, permanentAreaHa: 450, seasonalAreaHa: 80, vegetationCoverPct: 16, ndwi: 0.41, mndwi: 0.49, ndti: 0.14, sarBackscatterDb: -18.8, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Normal",
    verificationStatus: "Verified",
    lastVerifiedAt: "2026-11-11",
    fisheriesDependenceHouseholds: 710,
    irrigationCommandHa: 210,
  },
  {
    id: "AS-KMR-008",
    name: "Chandubi Lake",
    district: "Kamrup",
    block: "Boko",
    wetlandType: "Tectonic Lake",
    primaryUse: "Flood Buffer",
    regime: "Permanent",
    hydroPeriodPersistencePct: 91,
    baselineAreaHa: 540,
    center: [91.425, 25.885],
    monsoonRing: makeBeelRing(91.425, 25.885, 0.019, 0.014, 8.1),
    permanentRing: makeBeelRing(91.425, 25.885, 0.015, 0.011, 8.1),
    seasons: {
      pre_monsoon: { waterAreaHa: 470, permanentAreaHa: 455, seasonalAreaHa: 15, vegetationCoverPct: 11, ndwi: 0.46, mndwi: 0.54, ndti: 0.09, sarBackscatterDb: -19.3, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 630, permanentAreaHa: 455, seasonalAreaHa: 175, vegetationCoverPct: 9, ndwi: 0.58, mndwi: 0.65, ndti: 0.16, sarBackscatterDb: -20.4, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 565, permanentAreaHa: 455, seasonalAreaHa: 110, vegetationCoverPct: 10, ndwi: 0.51, mndwi: 0.59, ndti: 0.11, sarBackscatterDb: -19.7, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 500, permanentAreaHa: 455, seasonalAreaHa: 45, vegetationCoverPct: 11, ndwi: 0.48, mndwi: 0.56, ndti: 0.08, sarBackscatterDb: -19.5, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Normal",
    verificationStatus: "Verified",
    lastVerifiedAt: "2026-11-15",
    fisheriesDependenceHouseholds: 340,
    irrigationCommandHa: 120,
  },
  {
    id: "AS-TNS-009",
    name: "Maguri Motapung Beel",
    district: "Tinsukia",
    block: "Guijan",
    wetlandType: "Floodplain Marsh",
    primaryUse: "Flood Buffer",
    regime: "Permanent",
    hydroPeriodPersistencePct: 77,
    baselineAreaHa: 960,
    center: [95.372, 27.575],
    monsoonRing: makeBeelRing(95.372, 27.575, 0.024, 0.016, 9.4),
    permanentRing: makeBeelRing(95.372, 27.575, 0.015, 0.010, 9.4),
    seasons: {
      pre_monsoon: { waterAreaHa: 680, permanentAreaHa: 620, seasonalAreaHa: 60, vegetationCoverPct: 24, ndwi: 0.34, mndwi: 0.41, ndti: 0.15, sarBackscatterDb: -18.0, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 1280, permanentAreaHa: 620, seasonalAreaHa: 660, vegetationCoverPct: 18, ndwi: 0.50, mndwi: 0.58, ndti: 0.27, sarBackscatterDb: -19.6, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 980, permanentAreaHa: 620, seasonalAreaHa: 360, vegetationCoverPct: 21, ndwi: 0.42, mndwi: 0.49, ndti: 0.19, sarBackscatterDb: -18.7, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 740, permanentAreaHa: 620, seasonalAreaHa: 120, vegetationCoverPct: 23, ndwi: 0.36, mndwi: 0.43, ndti: 0.16, sarBackscatterDb: -18.2, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Normal",
    verificationStatus: "Verified",
    lastVerifiedAt: "2026-10-21",
    fisheriesDependenceHouseholds: 520,
    irrigationCommandHa: 95,
  },
  {
    id: "AS-NGA-010",
    name: "Samaguri Beel",
    district: "Nagaon",
    block: "Bajiagaon",
    wetlandType: "Beel (Oxbow)",
    primaryUse: "Irrigation",
    regime: "Seasonal",
    hydroPeriodPersistencePct: 58,
    baselineAreaHa: 290,
    center: [92.852, 26.418],
    monsoonRing: makeBeelRing(92.852, 26.418, 0.015, 0.011, 10.6),
    permanentRing: makeBeelRing(92.852, 26.418, 0.008, 0.006, 10.6),
    seasons: {
      pre_monsoon: { waterAreaHa: 145, permanentAreaHa: 125, seasonalAreaHa: 20, vegetationCoverPct: 33, ndwi: 0.22, mndwi: 0.29, ndti: 0.18, sarBackscatterDb: -16.4, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      monsoon: { waterAreaHa: 345, permanentAreaHa: 125, seasonalAreaHa: 220, vegetationCoverPct: 21, ndwi: 0.46, mndwi: 0.54, ndti: 0.26, sarBackscatterDb: -19.2, sensorSource: "Sentinel-1 SAR" },
      post_monsoon: { waterAreaHa: 255, permanentAreaHa: 125, seasonalAreaHa: 130, vegetationCoverPct: 27, ndwi: 0.35, mndwi: 0.42, ndti: 0.21, sarBackscatterDb: -17.9, sensorSource: "Sentinel-1 SAR + Sentinel-2" },
      winter: { waterAreaHa: 175, permanentAreaHa: 125, seasonalAreaHa: 50, vegetationCoverPct: 31, ndwi: 0.25, mndwi: 0.32, ndti: 0.18, sarBackscatterDb: -16.8, sensorSource: "Sentinel-2 Optical" },
    },
    alertStatus: "Shrinkage Alert",
    alertSeverity: "Medium",
    alertDeltaPct: -16.2,
    verificationStatus: "Pending Field Check",
    lastVerifiedAt: "2026-10-09",
    fisheriesDependenceHouseholds: 260,
    irrigationCommandHa: 480,
  },
];

export const INITIAL_ALERTS = [
  {
    id: "ALT-2026-101",
    wetlandId: "AS-NGA-005",
    wetlandName: "Morikolong Beel",
    district: "Nagaon",
    alertType: "Encroachment Risk",
    severity: "High",
    detectedAt: "2026-11-18",
    season: "post_monsoon",
    areaDeltaPct: -21.8,
    baselineHa: 332,
    observedHa: 260,
    summary: "Sentinel-1/2 fusion detected 72 ha boundary contraction along the eastern margin with persistent high-backscatter earth-fill signatures.",
    assignedTo: "District Nodal Officer, Nagaon",
    status: "Field Assigned",
  },
  {
    id: "ALT-2026-102",
    wetlandId: "AS-KMP-001",
    wetlandName: "Deepor Beel",
    district: "Kamrup Metro",
    alertType: "Hyacinth Bloom",
    severity: "High",
    detectedAt: "2026-11-16",
    season: "post_monsoon",
    areaDeltaPct: -17.4,
    baselineHa: 920,
    observedHa: 760,
    summary: "Floating aquatic vegetation (NDVI > 0.45, VH/VV ratio spike) increased from 24% to 34% across northern fisheries channels.",
    assignedTo: "Fisheries Extension Officer, Kamrup (M)",
    status: "Open",
  },
  {
    id: "ALT-2026-103",
    wetlandId: "AS-DHM-006",
    wetlandName: "Bordoibam Bilmukh",
    district: "Dhemaji",
    alertType: "Shrinkage Alert",
    severity: "Medium",
    detectedAt: "2026-11-12",
    season: "post_monsoon",
    areaDeltaPct: -15.6,
    baselineHa: 877,
    observedHa: 740,
    summary: "Post-monsoon recession occurred 3 weeks earlier than the 5-year hydro-period baseline, impacting minor irrigation intake.",
    assignedTo: "Irrigation Sub-Division, Dhemaji",
    status: "Open",
  },
  {
    id: "ALT-2026-104",
    wetlandId: "AS-NGA-010",
    wetlandName: "Samaguri Beel",
    district: "Nagaon",
    alertType: "Shrinkage Alert",
    severity: "Medium",
    detectedAt: "2026-11-10",
    season: "post_monsoon",
    areaDeltaPct: -16.2,
    baselineHa: 304,
    observedHa: 255,
    summary: "Seasonal water spread 16.2% below post-monsoon reference; recommended pre-rabi irrigation scheduling review.",
    assignedTo: "Irrigation Nodal Officer, Nagaon",
    status: "Open",
  },
];

export const INITIAL_VERIFICATIONS = [
  {
    id: "FV-2026-014",
    wetlandId: "AS-MRG-003",
    wetlandName: "Tamulidoba Beel",
    district: "Morigaon",
    officerName: "B. Kalita",
    role: "District Fisheries Officer",
    submittedAt: "2026-11-08 11:24 IST",
    gpsLat: 26.2452,
    gpsLng: 92.0554,
    waterLevelStatus: "Normal",
    hyacinthPresence: "None",
    encroachmentObserved: false,
    fisheriesActive: true,
    irrigationActive: true,
    notes: "Open water clear; active community fishing and winter lift-irrigation intake operational.",
  },
  {
    id: "FV-2026-013",
    wetlandId: "AS-SRB-002",
    wetlandName: "Son Beel",
    district: "Sribhumi",
    officerName: "R. Das",
    role: "ASSAC Field Surveyor",
    submittedAt: "2026-11-02 15:40 IST",
    gpsLat: 24.6751,
    gpsLng: 92.4441,
    waterLevelStatus: "Normal",
    hyacinthPresence: "Moderate (<30%)",
    encroachmentObserved: false,
    fisheriesActive: true,
    irrigationActive: true,
    notes: "Post-monsoon recession matches normal agricultural transition along southern fringes.",
  },
];
