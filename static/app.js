let allWetlands = [];
let allAlerts = [];
let allVerifications = [];
let activeSeason = "post_monsoon";
let selectedWetlandId = null;
let map = null;
let mapLoaded = false;
let hydroChart = null;
let fvLat = 26.118;
let fvLng = 91.662;

const BASEMAPS = {
  light: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
};

async function init() {
  await loadData();
  initMap();
  populateDistrictFilter();
  populateFieldWetlandSelect();
  renderAll();
}

async function loadData() {
  const [wRes, aRes, vRes] = await Promise.all([
    fetch(`/api/wetlands?season=${activeSeason}`),
    fetch("/api/alerts"),
    fetch("/api/verifications"),
  ]);
  const wData = await wRes.json();
  const aData = await aRes.json();
  const vData = await vRes.json();
  allWetlands = wData.wetlands || [];
  allAlerts = aData.alerts || [];
  allVerifications = vData.verifications || [];
}

function getFilteredWetlands() {
  const dist = document.getElementById("filter-district").value;
  const sec = document.getElementById("filter-sector").value;
  return allWetlands.filter((w) => {
    if (dist !== "All" && w.district !== dist) return false;
    if (sec !== "All" && w.primaryUse !== sec) return false;
    return true;
  });
}

function populateDistrictFilter() {
  const sel = document.getElementById("filter-district");
  const districts = Array.from(new Set(allWetlands.map((w) => w.district))).sort();
  sel.innerHTML = `<option value="All">District: All</option>` +
    districts.map((d) => `<option value="${d}">${d}</option>`).join("");
}

function populateFieldWetlandSelect() {
  const sel = document.getElementById("fv-wetland");
  sel.innerHTML = allWetlands
    .map((w) => `<option value="${w.id}">${w.name} (${w.district}) — ${w.verificationStatus}</option>`)
    .join("");
  if (selectedWetlandId) sel.value = selectedWetlandId;
  updateFieldCoords();
}

function buildMapGeoJSON(items) {
  const seasonalFeatures = items.map((w) => {
    const m = w.seasons[activeSeason];
    const cx = w.center[0];
    const cy = w.center[1];
    let coords = w.permanentRing;
    if (activeSeason === "monsoon") coords = w.monsoonRing;
    else if (activeSeason === "post_monsoon") {
      coords = w.monsoonRing.map(([x, y]) => [cx + (x - cx) * 0.82, cy + (y - cy) * 0.82]);
    } else if (activeSeason === "winter") {
      coords = w.monsoonRing.map(([x, y]) => [cx + (x - cx) * 0.68, cy + (y - cy) * 0.68]);
    }
    return {
      type: "Feature",
      id: w.id,
      properties: {
        id: w.id,
        name: w.name,
        district: w.district,
        regime: w.regime,
        alertStatus: w.alertStatus,
        waterAreaHa: m.waterAreaHa,
        selected: w.id === selectedWetlandId,
      },
      geometry: { type: "Polygon", coordinates: [coords] },
    };
  });

  const permanentFeatures = items.map((w) => ({
    type: "Feature",
    properties: { id: w.id },
    geometry: { type: "Polygon", coordinates: [w.permanentRing] },
  }));

  const pointFeatures = items.map((w) => ({
    type: "Feature",
    properties: {
      id: w.id,
      name: w.name,
      district: w.district,
      regime: w.regime,
      alertStatus: w.alertStatus,
      waterAreaHa: w.seasons[activeSeason].waterAreaHa,
    },
    geometry: { type: "Point", coordinates: w.center },
  }));

  return {
    seasonal: { type: "FeatureCollection", features: seasonalFeatures },
    permanent: { type: "FeatureCollection", features: permanentFeatures },
    points: { type: "FeatureCollection", features: pointFeatures },
  };
}

function initMap() {
  map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      sources: {
        basemap: {
          type: "raster",
          tiles: [BASEMAPS.light],
          tileSize: 256,
          attribution: "Tiles © Esri — Light Gray Canvas",
        },
      },
      layers: [{ id: "basemap-layer", type: "raster", source: "basemap" }],
    },
    center: [92.6, 26.2],
    zoom: 6.4,
    minZoom: 5,
    maxZoom: 15,
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  map.on("load", () => {
    const gj = buildMapGeoJSON(getFilteredWetlands());
    map.addSource("wetlands-seasonal", { type: "geojson", data: gj.seasonal });
    map.addSource("wetlands-permanent", { type: "geojson", data: gj.permanent });
    map.addSource("wetlands-points", { type: "geojson", data: gj.points });

    map.addLayer({
      id: "wetlands-seasonal-fill",
      type: "fill",
      source: "wetlands-seasonal",
      paint: {
        "fill-color": [
          "match", ["get", "regime"],
          "Permanent", "#06b6d4",
          "Seasonal", "#38bdf8",
          "At-Risk", "#f59e0b",
          "#06b6d4",
        ],
        "fill-opacity": 0.45,
      },
    });

    map.addLayer({
      id: "wetlands-seasonal-outline",
      type: "line",
      source: "wetlands-seasonal",
      paint: {
        "line-color": ["case", ["==", ["get", "selected"], true], "#0f172a", "#0284c7"],
        "line-width": ["case", ["==", ["get", "selected"], true], 3, 1.5],
      },
    });

    map.addLayer({
      id: "wetlands-permanent-fill",
      type: "fill",
      source: "wetlands-permanent",
      paint: { "fill-color": "#0284c7", "fill-opacity": 0.65 },
    });

    map.addLayer({
      id: "wetlands-permanent-outline",
      type: "line",
      source: "wetlands-permanent",
      paint: { "line-color": "#0369a1", "line-width": 1, "line-dasharray": [2, 2] },
    });

    map.addLayer({
      id: "wetlands-centers",
      type: "circle",
      source: "wetlands-points",
      paint: {
        "circle-radius": ["case", ["!=", ["get", "alertStatus"], "Normal"], 7, 5],
        "circle-color": ["case", ["!=", ["get", "alertStatus"], "Normal"], "#e11d48", "#0891b2"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
    const onHover = (e) => {
      map.getCanvas().style.cursor = "pointer";
      const p = e.features[0].properties;
      popup
        .setLngLat(e.lngLat)
        .setHTML(`<div class="text-xs">
          <div class="font-semibold text-cyan-700">${p.name}</div>
          <div class="text-slate-600">${p.district} · ${p.regime}</div>
          <div class="mt-1 text-slate-900">Water Spread: <b>${p.waterAreaHa} ha</b></div>
          ${p.alertStatus !== "Normal" ? `<div class="mt-1 text-rose-600 font-medium">⚠ ${p.alertStatus}</div>` : ""}
        </div>`)
        .addTo(map);
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    };
    const onClick = (e) => {
      const id = e.features[0]?.properties?.id;
      if (id) selectWetland(id);
    };

    map.on("mouseenter", "wetlands-seasonal-fill", onHover);
    map.on("mouseleave", "wetlands-seasonal-fill", onLeave);
    map.on("click", "wetlands-seasonal-fill", onClick);
    map.on("mouseenter", "wetlands-centers", onHover);
    map.on("mouseleave", "wetlands-centers", onLeave);
    map.on("click", "wetlands-centers", onClick);

    mapLoaded = true;
  });
}

function updateMapData() {
  if (!map || !mapLoaded) return;
  const gj = buildMapGeoJSON(getFilteredWetlands());
  map.getSource("wetlands-seasonal")?.setData(gj.seasonal);
  map.getSource("wetlands-permanent")?.setData(gj.permanent);
  map.getSource("wetlands-points")?.setData(gj.points);
}

function switchBasemap(style) {
  document.querySelectorAll(".bm-btn").forEach((b) => {
    b.className = "bm-btn px-2.5 py-1 text-xs font-medium rounded-md text-slate-600 hover:bg-slate-100";
  });
  document.getElementById(`bm-${style}`).className =
    "bm-btn px-2.5 py-1 text-xs font-medium rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200";
  if (map && mapLoaded) {
    map.getSource("basemap")?.setTiles([BASEMAPS[style]]);
  }
}

function resetMapView() {
  map?.flyTo({ center: [92.6, 26.2], zoom: 6.4, speed: 1.2 });
}

function togglePermanentLayer() {
  if (!map || !mapLoaded) return;
  const vis = document.getElementById("toggle-permanent").checked ? "visible" : "none";
  map.setLayoutProperty("wetlands-permanent-fill", "visibility", vis);
  map.setLayoutProperty("wetlands-permanent-outline", "visibility", vis);
}

function setSeason(s) {
  activeSeason = s;
  document.querySelectorAll(".season-btn").forEach((btn) => {
    const active = btn.dataset.season === s;
    btn.className = active
      ? "season-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white"
      : "season-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-100";
  });
  document.getElementById("dl-geojson").href = `/api/wetlands?format=geojson&season=${s}`;
  document.getElementById("dl-csv").href = `/api/wetlands?format=csv&season=${s}`;
  document.getElementById("ogc-endpoint-text").textContent = `GET /api/ogc/wfs?season=${s}`;
  renderAll();
}

function applyFilters() {
  selectedWetlandId = null;
  renderAll();
}

function selectWetland(id) {
  selectedWetlandId = id;
  const target = allWetlands.find((w) => w.id === id);
  if (target && map && mapLoaded) {
    map.flyTo({ center: target.center, zoom: 11.8, speed: 1.2 });
  }
  renderAll();
}

function renderAll() {
  const items = getFilteredWetlands();
  renderKPIs(items);
  updateMapData();
  renderChart(items);
  renderInspector(items);
  renderAlerts();
  renderVerifications();
}

function renderKPIs(items) {
  const totalArea = items.reduce((s, w) => s + w.seasons[activeSeason].waterAreaHa, 0);
  const permArea = items.reduce((s, w) => s + w.seasons[activeSeason].permanentAreaHa, 0);
  const seasArea = items.reduce((s, w) => s + w.seasons[activeSeason].seasonalAreaHa, 0);
  const openAlerts = allAlerts.filter((a) => a.status !== "Resolved").length;
  const verified = items.filter((w) => w.verificationStatus === "Verified").length;
  const hh = items.reduce((s, w) => s + w.fisheriesDependenceHouseholds, 0);
  const irr = items.reduce((s, w) => s + w.irrigationCommandHa, 0);

  document.getElementById("kpi-count").textContent = items.length;
  document.getElementById("kpi-verified").textContent = verified;
  document.getElementById("kpi-area").textContent = totalArea.toLocaleString();
  document.getElementById("kpi-split").textContent = `Perm: ${permArea.toLocaleString()} ha · Seas: ${seasArea.toLocaleString()} ha`;
  document.getElementById("kpi-alerts").textContent = openAlerts;
  document.getElementById("alert-badge").textContent = openAlerts;
  document.getElementById("kpi-hh").textContent = hh.toLocaleString();
  document.getElementById("kpi-irr").textContent = irr.toLocaleString();
}

function renderChart(items) {
  const sel = allWetlands.find((w) => w.id === selectedWetlandId);
  document.getElementById("chart-subtitle").textContent = sel
    ? `${sel.name} (${sel.district}) — Permanent vs. Seasonal Water`
    : `Aggregated across ${items.length} monitored Assam wetlands`;

  const keys = ["pre_monsoon", "monsoon", "post_monsoon", "winter"];
  const labels = ["Pre-Monsoon", "Monsoon (SAR)", "Post-Monsoon", "Winter"];

  const permData = keys.map((k) =>
    sel ? sel.seasons[k].permanentAreaHa : items.reduce((s, w) => s + w.seasons[k].permanentAreaHa, 0)
  );
  const seasData = keys.map((k) =>
    sel ? sel.seasons[k].seasonalAreaHa : items.reduce((s, w) => s + w.seasons[k].seasonalAreaHa, 0)
  );

  const ctx = document.getElementById("hydroChart").getContext("2d");
  if (hydroChart) hydroChart.destroy();
  hydroChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Permanent (ha)", data: permData, backgroundColor: "#0284c7" },
        { label: "Seasonal (ha)", data: seasData, backgroundColor: "#38bdf8" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, ticks: { color: "#475569", font: { size: 11 } }, grid: { color: "#e2e8f0" } },
        y: { stacked: true, ticks: { color: "#475569", font: { size: 11 } }, grid: { color: "#e2e8f0" } },
      },
      plugins: {
        legend: { labels: { color: "#334155", font: { size: 11 } } },
      },
    },
  });
}

function renderInspector(items) {
  const panel = document.getElementById("inspector-panel");
  const w = allWetlands.find((x) => x.id === selectedWetlandId);
  if (w) {
    const m = w.seasons[activeSeason];
    panel.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900">${w.name}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">${w.id}</span>
            </div>
            <p class="text-xs text-slate-500">${w.district} (${w.block}) · ${w.wetlandType}</p>
          </div>
          <button onclick="selectWetland(null)" class="text-xs text-slate-500 hover:text-slate-900">Clear</button>
        </div>
        <div class="grid grid-cols-4 gap-2 text-xs">
          <div class="rounded-lg bg-slate-50 p-2 border border-slate-200"><div class="text-[10px] text-slate-500">NDWI</div><div class="font-semibold text-cyan-700">${m.ndwi}</div></div>
          <div class="rounded-lg bg-slate-50 p-2 border border-slate-200"><div class="text-[10px] text-slate-500">MNDWI</div><div class="font-semibold text-sky-700">${m.mndwi}</div></div>
          <div class="rounded-lg bg-slate-50 p-2 border border-slate-200"><div class="text-[10px] text-slate-500">NDTI</div><div class="font-semibold text-amber-700">${m.ndti}</div></div>
          <div class="rounded-lg bg-slate-50 p-2 border border-slate-200"><div class="text-[10px] text-slate-500">SAR dB</div><div class="font-semibold text-emerald-700">${m.sarBackscatterDb}</div></div>
        </div>
        <div class="flex flex-wrap items-center justify-between text-xs text-slate-700">
          <span>Fisher HHs: <b>${w.fisheriesDependenceHouseholds}</b></span>
          <span>Irrigation: <b>${w.irrigationCommandHa} ha</b></span>
          <span>Persistence: <b>${w.hydroPeriodPersistencePct}%</b></span>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-200">
          <span class="text-[11px] text-slate-500">Sensor: ${m.sensorSource}</span>
          <button onclick="goToFieldVerify('${w.id}')" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium">
            Field Verify →
          </button>
        </div>
      </div>`;
    return;
  }

  panel.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-slate-900">Wetland Inventory (${items.length})</h3>
      <span class="text-[11px] text-slate-500">Click row or map polygon</span>
    </div>
    <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
      ${items
        .map(
          (item) => `
        <button onclick="selectWetland('${item.id}')" class="w-full flex items-center justify-between rounded-lg bg-slate-50 hover:bg-cyan-50/60 border border-slate-200 px-3 py-2 text-left text-xs transition">
          <div>
            <div class="font-medium text-slate-900">${item.name}</div>
            <div class="text-[11px] text-slate-500">${item.district} · ${item.regime} (${item.hydroPeriodPersistencePct}%)</div>
          </div>
          <div class="text-right">
            <div class="font-semibold text-cyan-700">${item.seasons[activeSeason].waterAreaHa} ha</div>
            <div class="text-[10px] ${item.alertStatus !== "Normal" ? "text-rose-600 font-medium" : "text-emerald-700"}">${item.alertStatus}</div>
          </div>
        </button>`
        )
        .join("")}
    </div>`;
}

function renderAlerts() {
  const grid = document.getElementById("alerts-grid");
  grid.innerHTML = allAlerts
    .map(
      (a) => `
    <div class="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3 shadow-sm">
      <div>
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">${a.wetlandName}</h3>
            <p class="text-xs text-slate-500">${a.district} · ${a.id} · Detected ${a.detectedAt}</p>
          </div>
          <span class="text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            a.severity === "High"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }">${a.alertType}</span>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs">
          <div><div class="text-[10px] text-slate-500 uppercase">Baseline</div><div class="font-semibold text-slate-900">${a.baselineHa} ha</div></div>
          <div><div class="text-[10px] text-slate-500 uppercase">Observed</div><div class="font-semibold text-slate-900">${a.observedHa} ha</div></div>
          <div><div class="text-[10px] text-slate-500 uppercase">Delta</div><div class="font-semibold text-rose-600">${a.areaDeltaPct}%</div></div>
        </div>
        <p class="mt-3 text-xs text-slate-700 leading-relaxed">${a.summary}</p>
        <p class="mt-1 text-[11px] text-slate-500">Routed to: ${a.assignedTo}</p>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
        <span class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">Status: ${a.status}</span>
        <div class="flex items-center gap-2">
          <button onclick="locateAlert('${a.wetlandId}')" class="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800">Locate</button>
          ${a.status === "Open" ? `<button onclick="dispatchAlert('${a.id}')" class="px-2.5 py-1.5 text-xs rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100">Dispatch</button>` : ""}
          ${a.status !== "Resolved" ? `<button onclick="goToFieldVerify('${a.wetlandId}')" class="px-2.5 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Verify →</button>` : ""}
        </div>
      </div>
    </div>`
    )
    .join("");
}

function renderVerifications() {
  const log = document.getElementById("fv-log");
  log.innerHTML = allVerifications
    .map(
      (v) => `
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5">
      <div class="flex items-start justify-between">
        <div>
          <span class="font-semibold text-cyan-700">${v.wetlandName}</span>
          <span class="text-slate-500">(${v.district})</span>
          <div class="text-[11px] text-slate-500">${v.id} · ${v.officerName} (${v.role})</div>
        </div>
        <span class="text-[11px] text-slate-500">${v.submittedAt}</span>
      </div>
      <div class="flex flex-wrap gap-2 text-[11px]">
        <span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Water: ${v.waterLevelStatus}</span>
        <span class="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Hyacinth: ${v.hyacinthPresence}</span>
        ${v.encroachmentObserved ? `<span class="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Encroachment Flagged</span>` : ""}
      </div>
      <p class="text-slate-700">${v.notes}</p>
      <div class="text-[10px] text-slate-500">GPS: ${v.gpsLat.toFixed(4)}° N, ${v.gpsLng.toFixed(4)}° E</div>
    </div>`
    )
    .join("");
}

function switchTab(tab) {
  ["map", "alerts", "field"].forEach((t) => {
    document.getElementById(`tab-${t}`).classList.toggle("hidden", t !== tab);
    const btn = document.getElementById(`tab-btn-${t}`);
    btn.className =
      t === tab
        ? "px-3 py-1.5 rounded-lg text-xs font-medium transition bg-white text-cyan-700 border border-cyan-200 shadow-sm"
        : "px-3 py-1.5 rounded-lg text-xs font-medium transition text-slate-600 hover:bg-slate-200/70";
  });
  if (tab === "map" && map) setTimeout(() => map.resize(), 100);
}

function locateAlert(wetlandId) {
  switchTab("map");
  selectWetland(wetlandId);
}

function goToFieldVerify(wetlandId) {
  selectedWetlandId = wetlandId;
  document.getElementById("fv-wetland").value = wetlandId;
  updateFieldCoords();
  switchTab("field");
}

async function dispatchAlert(alertId) {
  await fetch(`/api/alerts/${alertId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Field Assigned" }),
  });
  await loadData();
  renderAll();
}

function updateFieldCoords() {
  const id = document.getElementById("fv-wetland").value;
  const w = allWetlands.find((x) => x.id === id);
  if (w) {
    fvLng = w.center[0];
    fvLat = w.center[1];
    document.getElementById("fv-gps-display").textContent = `${fvLat.toFixed(4)}° N, ${fvLng.toFixed(4)}° E`;
  }
}

function refreshDeviceGPS() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    fvLat = Number(pos.coords.latitude.toFixed(5));
    fvLng = Number(pos.coords.longitude.toFixed(5));
    document.getElementById("fv-gps-display").textContent = `${fvLat.toFixed(4)}° N, ${fvLng.toFixed(4)}° E`;
  });
}

async function submitVerification(e) {
  e.preventDefault();
  const id = document.getElementById("fv-wetland").value;
  const w = allWetlands.find((x) => x.id === id);
  if (!w) return;

  const payload = {
    wetlandId: w.id,
    wetlandName: w.name,
    district: w.district,
    officerName: document.getElementById("fv-officer").value,
    role: document.getElementById("fv-role").value,
    gpsLat: fvLat,
    gpsLng: fvLng,
    waterLevelStatus: document.getElementById("fv-water").value,
    hyacinthPresence: document.getElementById("fv-hyacinth").value,
    encroachmentObserved: document.getElementById("fv-enc").checked,
    fisheriesActive: document.getElementById("fv-fish").checked,
    irrigationActive: document.getElementById("fv-irr").checked,
    notes: document.getElementById("fv-notes").value.trim() || "Field ground-truth verification logged via JalDrishti Field PWA.",
  };

  const res = await fetch("/api/verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    const data = await res.json();
    document.getElementById("fv-notes").value = "";
    const fb = document.getElementById("fv-feedback");
    fb.textContent = `Verification ${data.verification.id} synced for ${w.name}. Dashboard & alert status updated.`;
    fb.classList.remove("hidden");
    await loadData();
    populateFieldWetlandSelect();
    renderAll();
  }
}

function toggleExportModal(open) {
  document.getElementById("export-modal").classList.toggle("hidden", !open);
}

function openInfoModal(which) {
  closeInfoModals();
  const el = document.getElementById(`${which}-modal`);
  if (el) el.classList.remove("hidden");
  if (history.replaceState) history.replaceState(null, "", `#${which}`);
}

function closeInfoModals() {
  document.getElementById("tutorial-modal")?.classList.add("hidden");
  document.getElementById("technical-modal")?.classList.add("hidden");
  if (window.location.hash === "#tutorial" || window.location.hash === "#technical") {
    if (history.replaceState) history.replaceState(null, "", window.location.pathname);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  init();
  if (window.location.hash === "#tutorial") openInfoModal("tutorial");
  if (window.location.hash === "#technical") openInfoModal("technical");
});
