import json
import math

def haversine(lat1, lon1, lat2, lon2):
    """Calculate great-circle distance in km between two lat/lon pairs"""
    R = 6371  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def predict(event):
    incident = event["incident"]
    lat, lon = incident["lat"], incident["lon"]

    results = {}
    for rtype, rlist in event["resources"].items():
        distances = []
        for r in rlist:
            try:
                r_lat = float(r["latitude"])
                r_lon = float(r["longitude"])
                distance = haversine(lat, lon, r_lat, r_lon)
                distances.append({
                    "resource_id": r["resource_id"],
                    "location": r.get("location", "Unknown"),
                    "distance_km": round(distance, 2)
                })
            except Exception:
                continue
        results[rtype] = sorted(distances, key=lambda x: x["distance_km"])[:3]

    return results

# SageMaker handlers
def model_fn(model_dir):
    return None  # No model file needed (rule-based logic)

def input_fn(request_body, request_content_type):
    if request_content_type == 'application/json':
        return json.loads(request_body)
    raise ValueError("Unsupported content type")

def predict_fn(input_data, model):
    return predict(input_data)

def output_fn(prediction, accept):
    return json.dumps(prediction)
