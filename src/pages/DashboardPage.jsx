import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import "./DashboardPage.css";

const INDIA_MAP =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@bcbcba3/geojson/india.geojson";

// Coordinates for major state centers
const STATE_COORDS = {
  Maharashtra: [72.8777, 19.0760],
  Gujarat: [72.5714, 23.0225],
  Delhi: [77.1025, 28.7041],
  Odisha: [85.8245, 20.2961],
  TamilNadu: [80.2707, 13.0827],
  Karnataka: [77.5946, 12.9716],
  Kerala: [76.2711, 9.9312],
  WestBengal: [88.3639, 22.5726],
  Rajasthan: [75.7873, 26.9124],
  Bihar: [85.1376, 25.5941],
  Assam: [91.7362, 26.2006],
};

const severityConfig = {
  1: { color: "#10b981", label: "Low", glow: "rgba(16, 185, 129, 0.4)" },
  2: { color: "#22c55e", label: "Moderate", glow: "rgba(34, 197, 94, 0.4)" },
  3: { color: "#f59e0b", label: "High", glow: "rgba(245, 158, 11, 0.4)" },
  4: { color: "#f97316", label: "Critical", glow: "rgba(249, 115, 22, 0.4)" },
  5: { color: "#ef4444", label: "Severe", glow: "rgba(239, 68, 68, 0.4)" }
};

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showResources, setShowResources] = useState(false);

  useEffect(() => {
    fetch("https://5ujs99pwbg.execute-api.us-east-1.amazonaws.com/devonthetop/latest-incident")
      .then((res) => res.json())
      .then((data) => {
        // Normalize the response into the format your map expects
        const normalized = Array.isArray(data) ? data : [data];

        const formatted = normalized.map((item) => ({
          incident_id: item.incident_id,
          state: item.state,
          severity: item.enriched_severity_score_1_5 || 1,
          description: item.enriched_clean_description || "No description available",
          disaster_type: extractDisasterType(item.enriched_clean_description),
          timestamp: item.timestamp,
          status: item.status,
          
          // Enriched data
          est_people_affected: item.enriched_est_people_affected,
          urgency_score: item.enriched_urgency_score,
          population_density: item.enriched_population_density,
          disaster_risk_index: item.enriched_disaster_risk_index,
          
          // Nearest resources
          nearest_ambulance: item.nearest_resources_ambulances_0_location ? {
            location: item.nearest_resources_ambulances_0_location,
            distance_km: item.nearest_resources_ambulances_0_distance_km,
            resource_id: item.nearest_resources_ambulances_0_resource_id
          } : null,
          
          nearest_hospital: item.nearest_resources_hospitals_0_location ? {
            location: item.nearest_resources_hospitals_0_location,
            distance_km: item.nearest_resources_hospitals_0_distance_km,
            resource_id: item.nearest_resources_hospitals_0_resource_id
          } : null,
          
          nearest_food: item.nearest_resources_food_0_location ? {
            location: item.nearest_resources_food_0_location,
            distance_km: item.nearest_resources_food_0_distance_km,
            resource_id: item.nearest_resources_food_0_resource_id
          } : null,
          
          nearest_shelter: item.nearest_resources_shelters_0_location ? {
            location: item.nearest_resources_shelters_0_location,
            distance_km: item.nearest_resources_shelters_0_distance_km,
            resource_id: item.nearest_resources_shelters_0_resource_id
          } : null,
          
          nearest_response_unit: item.nearest_resources_response_units_0_location ? {
            location: item.nearest_resources_response_units_0_location,
            distance_km: item.nearest_resources_response_units_0_distance_km,
            resource_id: item.nearest_resources_response_units_0_resource_id
          } : null,
        }));

        setIncidents(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching incidents:", err);
        setLoading(false);
      });
  }, []);

  // Helper function to extract disaster type from description
  const extractDisasterType = (description) => {
    if (!description) return "Unknown";
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes("flood") || lowerDesc.includes("rain")) return "Flood";
    if (lowerDesc.includes("earthquake")) return "Earthquake";
    if (lowerDesc.includes("cyclone")) return "Cyclone";
    if (lowerDesc.includes("fire")) return "Fire";
    if (lowerDesc.includes("landslide")) return "Landslide";
    if (lowerDesc.includes("drought")) return "Drought";
    if (lowerDesc.includes("tsunami")) return "Tsunami";
    return "Disaster";
  };

  const getSeverityStats = () => {
    const stats = {};
    incidents.forEach(inc => {
      const severity = inc.severity || 1;
      stats[severity] = (stats[severity] || 0) + 1;
    });
    return stats;
  };

  const handleMarkerClick = (incident) => {
    if (selectedIncident?.incident_id === incident.incident_id) {
      // If clicking the same incident, close it
      setSelectedIncident(null);
      setShowResources(false);
    } else {
      // Open new incident
      setSelectedIncident(incident);
      setShowResources(false);
    }
  };

  const toggleResources = () => {
    setShowResources(!showResources);
  };

  const stats = getSeverityStats();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">🗺️</span>
            Real-Time Disaster Monitor
          </h1>
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span className="live-text">Live</span>
          </div>
        </div>
        <p className="dashboard-subtitle">
          Tracking {incidents.length} active incident{incidents.length !== 1 ? 's' : ''} across India
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {Object.entries(severityConfig).map(([level, config]) => (
          <div key={level} className="stat-card" style={{ borderLeftColor: config.color }}>
            <div className="stat-header">
              <span className="stat-label">{config.label}</span>
              <div 
                className="stat-dot" 
                style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.glow}` }}
              ></div>
            </div>
            <div className="stat-value">{stats[level] || 0}</div>
          </div>
        ))}
      </div>

      {/* Map Section */}
      <div className="map-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading disaster data...</p>
          </div>
        ) : (
          <div className="map-container">
            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ 
                scale: 700,
                center: [80, 15] 
              }}
              width={800}
              height={600}
            >
              <Geographies geography={INDIA_MAP}>
                {({ geographies }) => 
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#d1d5db"
                      stroke="#4b5563"
                      strokeWidth={0.8}
                      style={{
                        default: { 
                          fill: "#d1d5db",
                          stroke: "#4b5563",
                          strokeWidth: 0.8,
                          outline: "none" 
                        },
                        hover: { 
                          fill: "#9ca3af",
                          stroke: "#374151",
                          strokeWidth: 1.2,
                          outline: "none" 
                        },
                        pressed: { 
                          fill: "#9ca3af",
                          outline: "none" 
                        }
                      }}
                    />
                  ))
                }
              </Geographies>

              {incidents.map((incident, idx) => {
                const coords = STATE_COORDS[incident.state];
                if (!coords) return null;

                const severity = incident.severity || 1;
                const config = severityConfig[severity] || severityConfig[1];
                const isSelected = selectedIncident?.incident_id === incident.incident_id;

                return (
                  <g key={idx}>
                    <Marker 
                      coordinates={coords}
                      onClick={() => handleMarkerClick(incident)}
                    >
                      <g className="marker-group">
                        <circle
                          r={10 + severity * 2}
                          fill={config.color}
                          fillOpacity={0.3}
                          className="marker-pulse"
                        />
                        <circle
                          r={5 + severity}
                          fill={config.color}
                          stroke="#fff"
                          strokeWidth={2}
                          className="marker-dot"
                          style={{ 
                            filter: `drop-shadow(0 0 ${severity * 2}px ${config.glow})`,
                            cursor: "pointer"
                          }}
                        />
                      </g>
                    </Marker>

                    {/* On-map popup - CLICKABLE */}
                    {isSelected && (
                      <Annotation
                        subject={coords}
                        dx={80}
                        dy={-50}
                        connectorProps={{
                          stroke: config.color,
                          strokeWidth: 3,
                          strokeLinecap: "round"
                        }}
                      >
                        <foreignObject x={0} y={-180} width={360} height={showResources ? 550 : 450}>
                          <div xmlns="http://www.w3.org/1999/xhtml">
                            <div className="map-popup">
                              {/* Close button */}
                              <button 
                                className="popup-close-btn"
                                onClick={() => {
                                  setSelectedIncident(null);
                                  setShowResources(false);
                                }}
                              >
                                ✕
                              </button>

                              <div className="map-popup-header" style={{ backgroundColor: config.color }}>
                                <div className="popup-header-content">
                                  <span className="map-popup-title">{incident.disaster_type}</span>
                                  <span className="map-popup-id">{incident.incident_id}</span>
                                </div>
                                <span className="map-popup-severity">Level {severity}</span>
                              </div>
                              
                              <div className="map-popup-content">
                                {/* Description */}
                                <div className="map-popup-description">
                                  {incident.description}
                                </div>

                                {/* Key Stats */}
                                <div className="map-popup-stats">
                                  {incident.est_people_affected && (
                                    <div className="map-popup-stat-item">
                                      <span className="stat-icon">👥</span>
                                      <div>
                                        <div className="stat-label">People Affected</div>
                                        <div className="stat-value">{incident.est_people_affected.toLocaleString()}</div>
                                      </div>
                                    </div>
                                  )}

                                  {incident.urgency_score && (
                                    <div className="map-popup-stat-item">
                                      <span className="stat-icon">⚡</span>
                                      <div>
                                        <div className="stat-label">Urgency Score</div>
                                        <div className="stat-value">{(incident.urgency_score * 100).toFixed(0)}%</div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Resources Toggle Button */}
                                <button 
                                  className="resources-toggle-btn"
                                  onClick={toggleResources}
                                >
                                  {showResources ? '▼' : '▶'} Nearest Resources
                                  <span className="resource-count">
                                    ({[incident.nearest_ambulance, incident.nearest_hospital, incident.nearest_food, incident.nearest_shelter, incident.nearest_response_unit].filter(Boolean).length})
                                  </span>
                                </button>

                                {/* Nearest Resources Section - Expandable */}
                                {showResources && (
                                  <div className="resources-section">
                                    {incident.nearest_ambulance && (
                                      <div className="map-popup-item">
                                        <span className="map-popup-icon">🚑</span>
                                        <div className="map-popup-text">
                                          <span className="map-popup-label">Ambulance</span>
                                          <span className="map-popup-value">
                                            {incident.nearest_ambulance.location}
                                            <span className="map-popup-distance"> ({incident.nearest_ambulance.distance_km} km)</span>
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {incident.nearest_hospital && (
                                      <div className="map-popup-item">
                                        <span className="map-popup-icon">🏥</span>
                                        <div className="map-popup-text">
                                          <span className="map-popup-label">Hospital</span>
                                          <span className="map-popup-value">
                                            {incident.nearest_hospital.location}
                                            <span className="map-popup-distance"> ({incident.nearest_hospital.distance_km} km)</span>
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {incident.nearest_food && (
                                      <div className="map-popup-item">
                                        <span className="map-popup-icon">🍲</span>
                                        <div className="map-popup-text">
                                          <span className="map-popup-label">Food Supply</span>
                                          <span className="map-popup-value">
                                            {incident.nearest_food.location}
                                            <span className="map-popup-distance"> ({incident.nearest_food.distance_km} km)</span>
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {incident.nearest_shelter && (
                                      <div className="map-popup-item">
                                        <span className="map-popup-icon">🏠</span>
                                        <div className="map-popup-text">
                                          <span className="map-popup-label">Shelter</span>
                                          <span className="map-popup-value">
                                            {incident.nearest_shelter.location}
                                            <span className="map-popup-distance"> ({incident.nearest_shelter.distance_km} km)</span>
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {incident.nearest_response_unit && (
                                      <div className="map-popup-item">
                                        <span className="map-popup-icon">🚨</span>
                                        <div className="map-popup-text">
                                          <span className="map-popup-label">Response Unit</span>
                                          <span className="map-popup-value">
                                            {incident.nearest_response_unit.location}
                                            <span className="map-popup-distance"> ({incident.nearest_response_unit.distance_km} km)</span>
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Timestamp */}
                                {incident.timestamp && (
                                  <div className="map-popup-footer">
                                    🕒 {new Date(incident.timestamp).toLocaleString('en-IN', {
                                      dateStyle: 'medium',
                                      timeStyle: 'short'
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </foreignObject>
                      </Annotation>
                    )}
                  </g>
                );
              })}
            </ComposableMap>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="legend-container">
        <h3 className="legend-title">Severity Legend</h3>
        <div className="legend-items">
          {Object.entries(severityConfig).map(([level, config]) => (
            <div key={level} className="legend-item">
              <div 
                className="legend-dot" 
                style={{ 
                  backgroundColor: config.color,
                  boxShadow: `0 0 8px ${config.glow}`
                }}
              ></div>
              <span className="legend-label">
                Level {level} - {config.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}