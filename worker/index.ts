import { INITIAL_ALERTS, INITIAL_VERIFICATIONS, INITIAL_WETLANDS, WetlandRecord } from "./data";

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

// Per-isolate state (for production persistence, bind D1 or KV)
const wetlandsState: WetlandRecord[] = structuredClone(INITIAL_WETLANDS);
const alertsState = structuredClone(INITIAL_ALERTS);
const verificationsState = structuredClone(INITIAL_VERIFICATIONS);

function buildGeoJSON(season: string) {
  const features = wetlandsState.map((w) => {
    const m = w.seasons[season] || w.seasons.post_monsoon;
    const [cx, cy] = w.center;
    let coords = w.permanentRing;
    if (season === "monsoon") {
      coords = w.monsoonRing;
    } else if (season === "post_monsoon") {
      coords = w.monsoonRing.map(([x, y]) => [
        Number((cx + (x - cx) * 0.82).toFixed(5)),
        Number((cy + (y - cy) * 0.82).toFixed(5)),
      ]);
    } else if (season === "winter") {
      coords = w.monsoonRing.map(([x, y]) => [
        Number((cx + (x - cx) * 0.68).toFixed(5)),
        Number((cy + (y - cy) * 0.68).toFixed(5)),
      ]);
    }

    return {
      type: "Feature",
      id: w.id,
      properties: {
        id: w.id,
        name: w.name,
        district: w.district,
        block: w.block,
        wetlandType: w.wetlandType,
        primaryUse: w.primaryUse,
        regime: w.regime,
        hydroPeriodPersistencePct: w.hydroPeriodPersistencePct,
        season,
        waterAreaHa: m.waterAreaHa,
        permanentAreaHa: m.permanentAreaHa,
        seasonalAreaHa: m.seasonalAreaHa,
        ndwi: m.ndwi,
        mndwi: m.mndwi,
        ndti: m.ndti,
        sarBackscatterDb: m.sarBackscatterDb,
        sensorSource: m.sensorSource,
        alertStatus: w.alertStatus,
        verificationStatus: w.verificationStatus,
      },
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    };
  });

  return {
    type: "FeatureCollection",
    name: `assam_wetlands_${season}`,
    crs: { type: "name", properties: { name: "urn:ogc:crs:OGC:1.3:CRS84" } },
    features,
  };
}

function buildCSV(season: string): string {
  const headers = [
    "ID", "Name", "District", "Type", "PrimaryUse", "Regime",
    "PersistencePct", "Season", "WaterAreaHa", "PermanentHa",
    "SeasonalHa", "NDWI", "MNDWI", "NDTI", "SAR_dB",
    "AlertStatus", "VerificationStatus",
  ];
  const rows = wetlandsState.map((w) => {
    const m = w.seasons[season] || w.seasons.post_monsoon;
    return [
      w.id, `"${w.name}"`, w.district, `"${w.wetlandType}"`, w.primaryUse,
      w.regime, w.hydroPeriodPersistencePct, season, m.waterAreaHa,
      m.permanentAreaHa, m.seasonalAreaHa, m.ndwi, m.mndwi, m.ndti,
      m.sarBackscatterDb, `"${w.alertStatus}"`, `"${w.verificationStatus}"`,
    ].join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/health") {
      return Response.json({ status: "ok", service: "JalDrishti Assam (Cloudflare Worker)" });
    }

    if (path === "/api/wetlands" && request.method === "GET") {
      const season = url.searchParams.get("season") || "post_monsoon";
      const format = url.searchParams.get("format") || "json";

      if (format === "geojson") {
        return new Response(JSON.stringify(buildGeoJSON(season), null, 2), {
          headers: {
            "Content-Type": "application/geo+json",
            "Content-Disposition": `attachment; filename="assam_wetlands_${season}.geojson"`,
          },
        });
      }
      if (format === "csv") {
        return new Response(buildCSV(season), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="assam_wetlands_${season}_stats.csv"`,
          },
        });
      }
      return Response.json({ wetlands: wetlandsState, geojson: buildGeoJSON(season) });
    }

    if (path === "/api/ogc/wfs" && request.method === "GET") {
      const season = url.searchParams.get("season") || "post_monsoon";
      return Response.json(buildGeoJSON(season));
    }

    if (path === "/api/alerts" && request.method === "GET") {
      return Response.json({ alerts: alertsState });
    }

    if (path.startsWith("/api/alerts/") && request.method === "PATCH") {
      const alertId = path.replace("/api/alerts/", "");
      const body = (await request.json()) as { status: string };
      const target = alertsState.find((a) => a.id === alertId);
      if (!target) {
        return Response.json({ error: "Alert not found" }, { status: 404 });
      }
      target.status = body.status;
      return Response.json({ alert: target });
    }

    if (path === "/api/verifications") {
      if (request.method === "GET") {
        return Response.json({ verifications: verificationsState });
      }
      if (request.method === "POST") {
        const body = (await request.json()) as Record<string, unknown>;
        const record = {
          id: `FV-2026-${String(verificationsState.length + 15).padStart(3, "0")}`,
          submittedAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC",
          wetlandId: String(body.wetlandId || ""),
          wetlandName: String(body.wetlandName || ""),
          district: String(body.district || ""),
          officerName: String(body.officerName || ""),
          role: String(body.role || ""),
          gpsLat: Number(body.gpsLat || 0),
          gpsLng: Number(body.gpsLng || 0),
          waterLevelStatus: String(body.waterLevelStatus || "Normal"),
          hyacinthPresence: String(body.hyacinthPresence || "None"),
          encroachmentObserved: Boolean(body.encroachmentObserved),
          fisheriesActive: Boolean(body.fisheriesActive),
          irrigationActive: Boolean(body.irrigationActive),
          notes: String(body.notes || ""),
        };
        verificationsState.unshift(record);

        const wetland = wetlandsState.find((w) => w.id === record.wetlandId);
        if (wetland) {
          wetland.verificationStatus = record.encroachmentObserved ? "Flagged" : "Verified";
          wetland.lastVerifiedAt = new Date().toISOString().slice(0, 10);
        }
        for (const a of alertsState) {
          if (a.wetlandId === record.wetlandId) {
            a.status = record.encroachmentObserved ? "Field Assigned" : "Resolved";
          }
        }
        return Response.json({ verification: record }, { status: 201 });
      }
    }

    // Serve static assets (index.html, app.js)
    return env.ASSETS.fetch(request);
  },
};
