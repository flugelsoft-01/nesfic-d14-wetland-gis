# NESFIC-D-14 Proposal: JalDrishti Assam — Multi-Sensor Wetland Mapping & Seasonal Monitoring Platform

> **Problem Statement:** NESFIC-D-14 — Wetland Mapping & Seasonal Monitoring for Irrigation and Fisheries  
> **Challenge Owner:** Department of Science & Technology, Government of Assam (ASSAC)  
> **Word Limit:** Maximum 500 words per section

---

## 1. Problem understanding & user workflow

Assam's floodplain wetlands—locally known as *beels*, oxbow lakes, marshes, and seasonal waterbodies—are vital ecological and economic assets supporting inland capture/culture fisheries, minor irrigation, flood buffering, and rural livelihoods. However, wetland extent and water quality fluctuate sharply across Assam's four hydrological seasons: pre-monsoon (dry/low water), monsoon (cloud-covered flood peak), post-monsoon (receding water), and winter.

Currently, wetland mapping and monitoring by the Assam State Space Application Centre (ASSAC) and line departments rely heavily on periodic, resource-intensive field surveys and static, multi-year satellite-derived inventories. Because optical satellite imagery is frequently obstructed by dense cloud cover during the monsoon months (May–October), seasonal dynamics remain poorly captured. Moreover, field officers in Fisheries, Irrigation, and District Administration lack a unified, up-to-date spatial view of permanent versus seasonal water spread, encroachment, siltation, and aquatic weed (e.g., water hyacinth) proliferation.

**Users and Beneficiaries:**
- **ASSAC & State Planners:** Need standardized, statewide wetland polygons, seasonal change statistics, and OGC-compliant GIS layers for inventory updates and restoration planning.
- **Fisheries & Irrigation Departments:** Need timely water-spread area, drought/shrinkage alerts, and command-area water availability metrics to plan stocking, leasing, and irrigation scheduling.
- **District Administration & Field Officers:** Need mobile-friendly field-verification tools to validate anomalies (encroachment, illegal bunding, eutrophication) with geotagged evidence.
- **Local Communities, Farmers & Fishers:** Benefit indirectly through better-informed water allocation, early dry-season stress advisories, and wetland conservation.

**Specific Gaps Addressed:**
1. Lack of all-weather, intra-annual seasonal monitoring due to monsoon cloud cover.
2. Inability to systematically separate permanent waterbodies from seasonal/ephemeral inundation.
3. Disconnected workflows between remote-sensing analytics and ground-truthing by district field staff.
4. Absence of automated, actionable change alerts and standardized GIS services for cross-department use.

**Intended Outcome:**
Deliver an operational, spatially consistent wetland intelligence platform that continuously tracks wetland boundaries and hydrological regimes across Assam, automates seasonal change detection and alerting, and closes the loop with structured field verification.

---

## 2. Proposed solution & key features

We propose **JalDrishti Assam**, an AI-enabled, multi-sensor Web GIS and field-verification platform designed specifically for ASSAC and Assam's Fisheries and Irrigation departments. Instead of relying on infrequent manual digitization or cloud-vulnerable optical-only mapping, JalDrishti fuses **Sentinel-1 Synthetic Aperture Radar (SAR)** (cloud-penetrating, 10m resolution) with **Sentinel-2 optical imagery** and optional **UAV/drone orthomosaics** to produce continuous, season-by-season wetland inventories.

**Main Modules & Key Features:**
1. **Multi-Sensor Water & Wetland Extraction Engine:** Combines Sentinel-1 VV/VH backscatter thresholding and U-Net/SegFormer deep-learning segmentation with Sentinel-2 spectral indices (MNDWI, NDWI, NDVI, NDTI for turbidity) to delineate wetland boundaries even during peak monsoon cloud cover.
2. **Permanent vs. Seasonal Water Classifier:** Computes pixel-level hydro-period frequency (0–100% inundation persistence across 12-month rolling windows) to classify *Permanent Water* (>75% persistence), *Seasonal Water* (25–75%), and *Ephemeral/Floodplain* (<25%), generating clean vector polygons (GeoJSON/GeoPackage/Shapefile).
3. **Interactive Web GIS Dashboard:** A role-based geospatial portal displaying Assam district/block boundaries, wetland polygons, time-series water-spread charts, seasonal comparison sliders, and irrigation/fisheries suitability indicators.
4. **Automated Change Detection & Alerting Engine:** Flags significant area shrinkage (>15% below seasonal baseline), rapid encroachment/land-use conversion, or aquatic vegetation bloom spikes, routing prioritized alerts to district nodal officers.
5. **Field-Verification Mobile/PWA Tool:** An offline-capable Progressive Web App (PWA) enabling field staff to navigate to flagged wetlands, capture GPS-tagged photos, record water depth/fisheries/encroachment observations, and sync ground-truth data back to the central GIS database.
6. **Standardized GIS Services & Exports:** Exposes OGC-compliant WMS/WFS/Vector Tile endpoints and downloadable CSV/PDF seasonal reports for seamless integration with ASSAC's existing SDI/GIS portals.

**What Changes vs. Current Approach:**
Transitions ASSAC and line departments from static, multi-year manual inventories to automated, sub-monthly all-weather monitoring with quantified seasonal hydro-periods, proactive anomaly alerts, and verified ground-to-satellite feedback loops.

---

## 3. Describe User Journey,Witeframes, Prototype & Proof of Work

**Proposed User Journey:**
1. **State Analyst (ASSAC):** Logs into the JalDrishti Web GIS portal, selects a district (e.g., Morigaon, Nagaon, or Dhemaji) and season (Pre-Monsoon, Monsoon, Post-Monsoon, Winter). Views updated wetland polygons color-coded by permanent vs. seasonal water persistence, inspects time-series area trends, and exports OGC layers or seasonal statistical reports.
2. **Department Officer (Fisheries / Irrigation):** Reviews the *Change Alerts* queue highlighting wetlands experiencing abnormal shrinkage, weed infestation, or encroachment. Clicks an alert to inspect before/after satellite split-views and assigns a verification task to a field officer.
3. **Field Verifier (District Staff):** Opens the offline-capable Field Verification PWA on a smartphone, views assigned wetland pins, navigates on-site, captures geotagged photos, fills a structured verification form (water level, active fishing/irrigation use, encroachment status), and submits. Once synced, the wetland's verification status updates in real time on the central dashboard.

**Prototype & Proof of Work:**
We are developing a functional MVP of **JalDrishti Assam** tailored to NESFIC-D-14's pilot context (representative wetland-rich districts of Assam). The prototype includes:
- An interactive **Web GIS Dashboard** built with React/Next.js and MapLibre GL JS rendering wetland polygons, permanent vs. seasonal water layers, seasonal hydro-period filters, and time-series area/index charts.
- A **Change Alert & Split-View Inspector** demonstrating automated detection of seasonal shrinkage and vegetation encroachment.
- An **Offline-Ready Field Verification Module** allowing GPS-tagged ground-truth submission and status tracking.
- A **Backend Spatial API** serving GeoJSON/Vector features, seasonal statistics, and simulated/sample Sentinel-1/2 processing outputs.

*(Note: Full wireframes, UI screenshots, sample wetland polygon outputs, and test results are compiled in the attached Proof of Work PDF, with live prototype and demo walkthrough links provided in Section 03.)*

---

## 4. Technology & solution architecture

JalDrishti Assam uses a modular, cloud-native geospatial architecture optimized for interoperability with ASSAC's GIS ecosystem and low-bandwidth field environments:

**1. Data Ingestion & Earth Observation (EO) Processing Layer:**
- **Sources:** Sentinel-1 GRD (SAR, 10m, 6–12 day revisit) and Sentinel-2 L2A (Optical, 10m) via Copernicus Data Space / Google Earth Engine / Microsoft Planetary Computer APIs; optional UAV GeoTIFF orthomosaics uploaded via the admin portal.
- **Processing Engine:** Python geospatial stack (`rasterio`, `xarray`, `geopandas`, `scikit-image`, PyTorch). Applies SAR speckle filtering (Lee/Refined Lee), terrain correction, and cloud masking (S2cloudless/SCL) for optical scenes.

**2. AI/ML & Hydrological Analytics Layer:**
- **Water Segmentation:** Ensemble of adaptive Otsu/VV-VH thresholding and a fine-tuned lightweight U-Net/SegFormer model trained on regional wetland masks to separate open water, aquatic vegetation, and wet soil.
- **Time-Series & Change Rules:** Per-pixel inundation frequency across rolling seasonal windows classifies permanent vs. seasonal water. Z-score anomaly detection against a multi-year seasonal baseline triggers shrinkage, flooding, or encroachment alerts.

**3. Geospatial Database & API Layer:**
- **Storage:** PostgreSQL with PostGIS for vector polygons, alert logs, and field-verification records; Cloud-Optimized GeoTIFFs (COGs) stored in S3-compatible object storage.
- **Backend & OGC Services:** FastAPI (Python) REST API + `TiTiler` / `pg_tileserv` for dynamic COG raster tiles and PostGIS vector tiles (MVT), plus OGC WMS/WFS endpoints for QGIS/ArcGIS interoperability.

**4. Frontend Web GIS & Field PWA:**
- **Web Dashboard:** Next.js (React + TypeScript), MapLibre GL JS for hardware-accelerated vector/raster rendering, and Recharts/Apache ECharts for seasonal hydrographs.
- **Field App:** Responsive PWA with IndexedDB offline caching, browser Geolocation API, and camera capture, syncing automatically when connectivity resumes.

**5. Hosting & Deployment:**
Containerized via Docker and deployable on NIC MeghRaj Cloud, AWS/GCP India regions, or ASSAC on-premise servers.

---

## 5. Development methodology & intermediate steps

We follow an agile, iterative geospatial product development methodology structured into five sequential stages, ensuring continuous alignment with ASSAC and department workflows:

**Stage 1: Discovery & Requirements Alignment**
- Finalize wetland classification taxonomy (permanent, seasonal, marsh/vegetated, aquaculture/beel) and alert thresholds with ASSAC, Fisheries, and Irrigation stakeholders.
- Confirm spatial data formats, coordinate reference systems (WGS84 / UTM Zone 46N), and OGC service standards.
- *Key Output:* Approved System Requirements Specification (SRS) and Data Schema.

**Stage 2: UX Design & Spatial Architecture**
- Design role-based wireframes for State Analysts, Department Officers, and Field Verifiers.
- Architect the PostGIS schema, COG storage layout, and automated EO ingestion pipeline.
- *Key Output:* Interactive UI/UX prototype and technical architecture blueprint.

**Stage 3: Core EO Pipeline & MVP Build**
- Implement Sentinel-1 SAR + Sentinel-2 optical ingestion, water-mask extraction, and hydro-period persistence calculation for selected pilot districts.
- Build the Web GIS dashboard, seasonal time-series charts, and Change Alert module.
- *Key Output:* Functional MVP demonstrating multi-season wetland polygons and change detection.

**Stage 4: Field-Verification App & Integration Testing**
- Develop the offline-capable Field Verification PWA and link it to the central PostGIS alert queue.
- Conduct unit, API, and spatial accuracy testing (IoU, F1-score, Kappa) against reference wetland inventories and field samples.
- *Key Output:* Integrated end-to-end platform and accuracy/validation report.

**Stage 5: Pilot Refinement & Handover Readiness**
- Incorporate feedback from ASSAC analysts and district field officers during pilot dry-runs, tune false-positive alert thresholds, and optimize tile rendering performance.
- *Key Output:* Production-ready deployment package, user manuals, and API documentation.

---

## 6. Development timeline & milestones

The application will be developed and made ready for departmental pilot validation over a **24-week (6-month)** schedule divided into four phases:

**Phase 1: Foundation & Design (Weeks 1–4)**
- *Milestones:* Stakeholder kickoff with ASSAC/Fisheries/Irrigation; data-sharing & schema finalization; UI/UX wireframes approved.
- *Deliverables:* SRS document, PostGIS database schema, clickable wireframes.
- *Dependencies:* Confirmation of pilot district boundaries and baseline wetland inventory layers from ASSAC.

**Phase 2: EO Analytics & Core Web GIS (Weeks 5–12)**
- *Milestones:* Automated Sentinel-1/2 ingestion pipeline operational; permanent vs. seasonal water classifier calibrated; Web GIS map viewer and seasonal dashboard live in staging.
- *Deliverables:* Seasonal wetland polygon generator, COG/MVT tile server, Web GIS v1.0.
- *Dependencies:* Access to historical reference masks for model calibration.

**Phase 3: Alerting & Field Verification PWA (Weeks 13–18)**
- *Milestones:* Automated change-detection rules and alert dashboard integrated; offline-capable Field Verification PWA completed; OGC WMS/WFS export endpoints functional.
- *Deliverables:* Change Alert engine, Field PWA v1.0, OGC service endpoints.
- *Dependencies:* Field-officer feedback on mobile form fields and verification workflow.

**Phase 4: Testing, Optimization & Validation Readiness (Weeks 19–24)**
- *Milestones:* End-to-end load, security, and spatial accuracy benchmarking completed; pilot user training conducted; system hardened for field validation.
- *Deliverables:* Validation & Accuracy Report, containerized deployment package, user & admin SOPs.
- *Validation Readiness:* The solution will be **ready for departmental pilot validation at Week 20**, with Weeks 21–24 dedicated to supervised dry-runs and tuning prior to full field rollout.

---

## 7. Data & information requirements

**1. Satellite & Remote Sensing Data (Open & Departmental):**
- **Sentinel-1 GRD (SAR) & Sentinel-2 L2A (Optical):** Publicly accessible via Copernicus Data Space / Planetary Computer (GeoTIFF/SAFE format, 10m resolution) for continuous water-spread and vegetation monitoring.
- **UAV / Drone Imagery (Optional):** High-resolution GeoTIFF orthomosaics (5–20 cm) for micro-level encroachment or critical wetland verification, if provided by ASSAC.

**2. Departmental & Reference GIS Layers (Subject to Official Permissions):**
- Existing Assam wetland inventory polygons, administrative boundaries (district/block/revenue village), irrigation command areas, and registered fishery/*beel* boundaries (Shapefile, GeoJSON, or GeoPackage).
- Any access to departmental datasets remains strictly subject to ASSAC and Government of Assam data-sharing, privacy, and security approvals.

**3. Ground-Truth & Field Annotation Data:**
- Historical field-survey points or newly collected GPS-tagged photos and status labels (open water, aquatic weeds, dry bed, encroachment, aquaculture) via the Field Verification PWA.
- **Processing & Annotation Needs:** Reprojection to a common CRS (EPSG:4326 / EPSG:32646), topological cleaning of polygons, cloud/shadow masking, and labeling of ~500–1,000 representative wetland patches across Assam's agro-climatic zones for model validation.

**4. Dependencies & Assumptions:**
- No unconfirmed access to restricted datasets is assumed; initial development and testing rely on open Sentinel-1/2 imagery and public administrative boundaries, with seamless plug-in support once departmental layers are provisioned.
- Assumes standard smartphone GPS accuracy (3–10m) and intermittent 3G/4G connectivity for field verification (mitigated via offline PWA caching).

---

## 8. Team, manpower & expertise

Delivering JalDrishti Assam requires a multidisciplinary team combining geospatial AI, full-stack Web GIS engineering, and regional hydrology/domain expertise:

**Core Roles & Expertise:**
1. **Geospatial Lead / Remote Sensing Specialist (1 FTE):** Expertise in SAR (Sentinel-1) and optical (Sentinel-2) processing, wetland hydrology, and accuracy assessment; leads EO pipeline design and seasonal classification rules.
2. **AI/ML Engineer (1 FTE):** Specializes in computer vision and semantic segmentation (PyTorch, U-Net/SegFormer) on satellite imagery and time-series anomaly detection.
3. **Full-Stack Web GIS Developer (1–2 FTEs):** Proficient in Next.js/React, MapLibre GL JS, FastAPI, PostGIS, and OGC standards (WMS/WFS/MVT); builds the interactive dashboard, tile services, and offline Field PWA.
4. **Cloud / DevOps & Data Engineer (0.5–1 FTE):** Manages containerized deployment, automated EO ingestion pipelines, COG object storage, and security hardening.
5. **Domain & Field Liaison Specialist (0.5 FTE):** Familiar with Assam's *beel* fisheries, irrigation planning, and district workflows; coordinates ground-truth campaigns and user acceptance testing (UAT).

**Indicative Manpower by Phase:**
- **Phase 1 (Weeks 1–4):** Remote Sensing Lead, Full-Stack Lead, Domain Liaison (3.0 FTE).
- **Phase 2 (Weeks 5–12):** Full team active for EO pipeline and Web GIS build (4.5 FTE).
- **Phase 3 (Weeks 13–18):** Full-Stack, AI/ML, DevOps, and Domain Liaison for PWA & alerting (4.0 FTE).
- **Phase 4 (Weeks 19–24):** QA, DevOps, Remote Sensing Lead, and Domain Liaison for validation & handover (3.0 FTE).

---

## 9. Testing, validation & evidence

**Development & Technical Testing:**
- **Unit & API Testing:** Automated `pytest` suites for FastAPI endpoints, PostGIS spatial queries, and OGC service compliance; Jest/Playwright tests for Web GIS UI and offline PWA sync behavior.
- **Performance & Load Testing:** Tile-rendering latency benchmarks (<300 ms for cached MVT/COG tiles) and concurrent user stress tests.

**Spatial Accuracy & Quality Measures:**
- **Water & Wetland Extraction:** Evaluated against manually digitized reference masks and field ground-truth points using **Intersection over Union (IoU ≥ 0.85)**, **F1-Score (≥ 0.90)**, **Overall Accuracy**, and **Cohen's Kappa**.
- **Permanent vs. Seasonal Classification:** Cross-validated across multi-year hydrological cycles (pre-monsoon vs. monsoon) to verify hydro-period consistency.
- **Change Alert Precision:** Measured via false-positive rate during pilot dry-runs, targeting >85% actionable alert precision after field verification.

**Evidence of Progress & Product Readiness:**
- A working **JalDrishti Assam MVP** is being built alongside this proposal, demonstrating interactive Assam wetland polygon rendering, permanent vs. seasonal water visualization, seasonal trend analytics, automated change alerts, and a functional field-verification workflow.
- The accompanying Proof of Work PDF documents the system wireframes, prototype screenshots, sample spatial outputs, and initial test results.

---

## 10. Security, privacy, safety & compliance

JalDrishti Assam is designed to meet Government of Assam and NIC cybersecurity, data governance, and operational auditability standards:

- **Access Control & Authentication:** Role-Based Access Control (RBAC) separating *Public/Viewer* (aggregated statistics), *Department Analyst* (full GIS & exports), *Field Verifier* (assigned task submission), and *System Admin* (user/layer management), secured via JWT/OAuth2 and HTTPS/TLS 1.3 encryption.
- **Data Privacy & Sovereignty:** All departmental GIS layers, field photos, and user records are hosted within Indian sovereign cloud infrastructure (NIC MeghRaj or India-region cloud) or ASSAC on-premise servers. Personally Identifiable Information (PII) of field officers is minimized and encrypted at rest (AES-256).
- **Auditability & Traceability:** Every automated wetland polygon update, alert trigger, and field-verification submission is logged with immutable timestamps, user IDs, model version tags, and source satellite scene IDs for full administrative auditability.
- **Human-in-the-Loop & Safety:** Automated change alerts (e.g., potential encroachment or severe shrinkage) are flagged as *Pending Verification* and never trigger automated administrative/legal actions without human analyst review and geotagged field confirmation.
- **Interoperability & Standards Compliance:** Adheres to OGC standards (WMS, WFS, GeoJSON, COG) and Indian National Geospatial Policy / NSDI metadata guidelines, ensuring seamless data exchange with ASSAC and line-department systems.

---

## 11. Innovation & differentiation

**Core Novelty:**
1. **Cloud-Penetrating SAR + Optical Fusion for Assam:** Unlike conventional optical-only tools (which fail during Assam's 5–6 month monsoon), JalDrishti fuses Sentinel-1 SAR backscatter with Sentinel-2 optical indices, maintaining uninterrupted seasonal visibility.
2. **Quantified Hydro-Period Persistence:** Rather than binary "water/non-water" snapshots, pixel-level inundation frequency distinguishes permanent *beels* from seasonal floodplains, directly supporting fisheries leasing and irrigation planning.
3. **Closed-Loop Satellite-to-Field Workflow:** Bridges remote sensing and ground administration by routing automated change alerts directly to an offline-capable Field PWA, whose verified ground-truth feeds back to refine ML accuracy.

**Existing Alternatives & Basis of Differentiation:**
- *Static Inventories (e.g., NWIA):* Updated every few years; lack intra-annual seasonal tracking and alerting.
- *Generic Global Water Layers (e.g., JRC Global Surface Water):* Too coarse/lagged for district-level *beel* management, lack Assam-specific weed/turbidity indicators, and offer no field-verification or OGC departmental workflow.
- *Desktop GIS (QGIS/ArcGIS):* Require specialist skills; JalDrishti delivers zero-install Web GIS and mobile tools for non-GIS fisheries/irrigation staff.

**IP & Dependencies:**
- **Open-Source Core:** Built on open geospatial standards (PostGIS, MapLibre GL, TiTiler, FastAPI, PyTorch, Copernicus Sentinel data), avoiding vendor lock-in.
- **Proprietary IP:** Custom Assam-calibrated SAR-optical fusion pipelines, hydro-period classification heuristics, and the integrated alert-to-field verification software architecture.

---

## 12. Resources, risks & pilot validation

**Indicative Resource & Cost Drivers:**
- **Manpower (~65–70% of budget):** Multidisciplinary engineering, remote sensing, and AI/ML team over 6 months.
- **Cloud & Compute (~15–20%):** GPU instances for model training/inference, PostGIS/COG storage, and tile-server hosting (minimized by using open Sentinel data and serverless/on-demand EO processing).
- **Field Validation & Training (~10–15%):** Ground-truth campaigns, GNSS/mobile testing, and capacity-building workshops for ASSAC and district staff.

**Key Risks & Mitigations:**
1. *Persistent Monsoon Cloud Cover:* Mitigated by prioritizing Sentinel-1 SAR as the primary all-weather water sensor, supplemented by optical imagery when cloud-free.
2. *Aquatic Vegetation (Water Hyacinth) Confusion:* Floating weeds mask open water in optical/SAR signals; mitigated via multi-index classification (NDVI + VH/VV polarization ratio) and field-verified training labels.
3. *Low Field Connectivity:* Mitigated through offline-first PWA storage (IndexedDB) with background sync.
4. *Departmental Data Delays:* Mitigated by developing against open Sentinel/administrative data first, with modular ingestion for ASSAC layers.

**Pilot Validation Plan:**
Following Week 20 readiness, the platform will be pilot-validated across **2–3 wetland-rich districts of Assam** (e.g., Morigaon, Nagaon, or Dhemaji) in partnership with ASSAC, Fisheries, and Irrigation officers. Validation will compare platform-generated seasonal polygons and change alerts against 50+ field-verified wetland sites across pre-monsoon and monsoon transitions, measuring spatial accuracy (IoU ≥ 0.85), alert precision, and officer usability before statewide scaling.
