import copy
import csv
import io
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.data import INITIAL_ALERTS, INITIAL_VERIFICATIONS, INITIAL_WETLANDS

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(
    title="JalDrishti Assam API",
    description="NESFIC-D-14 Multi-Sensor Wetland Mapping & Seasonal Monitoring API (ASSAC)",
    version="1.0.0",
)

# Runtime state
wetlands_state: List[Dict[str, Any]] = copy.deepcopy(INITIAL_WETLANDS)
alerts_state: List[Dict[str, Any]] = copy.deepcopy(INITIAL_ALERTS)
verifications_state: List[Dict[str, Any]] = copy.deepcopy(INITIAL_VERIFICATIONS)


class AlertPatch(BaseModel):
    status: str


class VerificationCreate(BaseModel):
    wetlandId: str
    wetlandName: str
    district: str
    officerName: str
    role: str
    gpsLat: float
    gpsLng: float
    waterLevelStatus: str
    hyacinthPresence: str
    encroachmentObserved: bool
    fisheriesActive: bool
    irrigationActive: bool
    notes: str


def build_geojson(season: str) -> Dict[str, Any]:
    features = []
    for w in wetlands_state:
        m = w["seasons"].get(season, w["seasons"]["post_monsoon"])
        if season == "monsoon":
            coords = w["monsoonRing"]
        elif season == "post_monsoon":
            cx, cy = w["center"]
            coords = [
                [round(cx + (x - cx) * 0.82, 5), round(cy + (y - cy) * 0.82, 5)]
                for x, y in w["monsoonRing"]
            ]
        elif season == "winter":
            cx, cy = w["center"]
            coords = [
                [round(cx + (x - cx) * 0.68, 5), round(cy + (y - cy) * 0.68, 5)]
                for x, y in w["monsoonRing"]
            ]
        else:
            coords = w["permanentRing"]

        features.append(
            {
                "type": "Feature",
                "id": w["id"],
                "properties": {
                    "id": w["id"],
                    "name": w["name"],
                    "district": w["district"],
                    "block": w["block"],
                    "wetlandType": w["wetlandType"],
                    "primaryUse": w["primaryUse"],
                    "regime": w["regime"],
                    "hydroPeriodPersistencePct": w["hydroPeriodPersistencePct"],
                    "season": season,
                    "waterAreaHa": m["waterAreaHa"],
                    "permanentAreaHa": m["permanentAreaHa"],
                    "seasonalAreaHa": m["seasonalAreaHa"],
                    "ndwi": m["ndwi"],
                    "mndwi": m["mndwi"],
                    "ndti": m["ndti"],
                    "sarBackscatterDb": m["sarBackscatterDb"],
                    "sensorSource": m["sensorSource"],
                    "alertStatus": w["alertStatus"],
                    "verificationStatus": w["verificationStatus"],
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords],
                },
            }
        )

    return {
        "type": "FeatureCollection",
        "name": f"assam_wetlands_{season}",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:crs:OGC:1.3:CRS84"}},
        "features": features,
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "JalDrishti Assam (NESFIC-D-14)"}


@app.get("/api/wetlands")
def get_wetlands(
    season: str = Query("post_monsoon"),
    format: str = Query("json"),
):
    if format == "geojson":
        gj = build_geojson(season)
        return Response(
            content=json.dumps(gj, indent=2),
            media_type="application/geo+json",
            headers={
                "Content-Disposition": f'attachment; filename="assam_wetlands_{season}.geojson"'
            },
        )
    if format == "csv":
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(
            [
                "ID",
                "Name",
                "District",
                "Type",
                "PrimaryUse",
                "Regime",
                "PersistencePct",
                "Season",
                "WaterAreaHa",
                "PermanentHa",
                "SeasonalHa",
                "NDWI",
                "MNDWI",
                "NDTI",
                "SAR_dB",
                "AlertStatus",
                "VerificationStatus",
            ]
        )
        for w in wetlands_state:
            m = w["seasons"].get(season, w["seasons"]["post_monsoon"])
            writer.writerow(
                [
                    w["id"],
                    w["name"],
                    w["district"],
                    w["wetlandType"],
                    w["primaryUse"],
                    w["regime"],
                    w["hydroPeriodPersistencePct"],
                    season,
                    m["waterAreaHa"],
                    m["permanentAreaHa"],
                    m["seasonalAreaHa"],
                    m["ndwi"],
                    m["mndwi"],
                    m["ndti"],
                    m["sarBackscatterDb"],
                    w["alertStatus"],
                    w["verificationStatus"],
                ]
            )
        return Response(
            content=buf.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="assam_wetlands_{season}_stats.csv"'
            },
        )

    return {"wetlands": wetlands_state, "geojson": build_geojson(season)}


@app.get("/api/ogc/wfs")
def ogc_wfs(season: str = Query("post_monsoon")):
    """OGC WFS-compatible GeoJSON FeatureCollection endpoint for QGIS/ASSAC SDI."""
    return JSONResponse(content=build_geojson(season))


@app.get("/api/alerts")
def get_alerts():
    return {"alerts": alerts_state}


@app.patch("/api/alerts/{alert_id}")
def patch_alert(alert_id: str, body: AlertPatch):
    for a in alerts_state:
        if a["id"] == alert_id:
            a["status"] = body.status
            return {"alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")


@app.get("/api/verifications")
def get_verifications():
    return {"verifications": verifications_state}


@app.post("/api/verifications", status_code=201)
def create_verification(body: VerificationCreate):
    record = body.model_dump()
    record["id"] = f"FV-2026-{len(verifications_state) + 15:03d}"
    record["submittedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M IST")
    verifications_state.insert(0, record)

    for w in wetlands_state:
        if w["id"] == body.wetlandId:
            w["verificationStatus"] = (
                "Flagged" if body.encroachmentObserved else "Verified"
            )
            w["lastVerifiedAt"] = datetime.now().strftime("%Y-%m-%d")

    for a in alerts_state:
        if a["wetlandId"] == body.wetlandId:
            a["status"] = "Field Assigned" if body.encroachmentObserved else "Resolved"

    return {"verification": record}


app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
def index():
    return FileResponse(str(STATIC_DIR / "index.html"))


@app.get("/app.js")
def app_js():
    return FileResponse(str(STATIC_DIR / "app.js"), media_type="application/javascript")


@app.get("/favicon.svg")
def favicon():
    return FileResponse(str(STATIC_DIR / "favicon.svg"), media_type="image/svg+xml")


@app.get("/robots.txt")
def robots():
    return FileResponse(str(STATIC_DIR / "robots.txt"), media_type="text/plain")


@app.get("/sitemap.xml")
def sitemap():
    return FileResponse(str(STATIC_DIR / "sitemap.xml"), media_type="application/xml")
