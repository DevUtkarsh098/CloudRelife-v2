import { useState } from "react";
import "./ReportPage.css";

export default function ReportPage() {
  const [form, setForm] = useState({
    incident_id: "",
    disaster_type: "",
    severity: "",
    description: "",
    timestamp: "",
    state: "",
    district: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("https://jwfalabtd7.execute-api.us-east-1.amazonaws.com/dev/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setForm({
          incident_id: "",
          disaster_type: "",
          severity: "",
          description: "",
          timestamp: "",
          state: "",
          district: "",
        });
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting incident:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disasterTypes = [
    "Earthquake",
    "Flood",
    "Cyclone",
    "Landslide",
    "Drought",
    "Fire",
    "Tsunami",
    "Other"
  ];

  const states = [
    "Maharashtra",
    "Gujarat",
    "Delhi",
    "Odisha",
    "TamilNadu",
    "Karnataka",
    "Kerala",
    "WestBengal",
    "Rajasthan",
    "Bihar",
    "Assam"
  ];

  return (
    <div className="report-container">
      <div className="report-content">
        <div className="report-header">
          <div className="header-icon">📝</div>
          <h1 className="report-title">Report New Incident</h1>
          <p className="report-subtitle">
            Submit disaster information to help emergency response teams
          </p>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="incident_id" className="form-label">
                <span className="label-icon">🆔</span>
                Incident ID
              </label>
              <input
                id="incident_id"
                name="incident_id"
                type="text"
                placeholder="e.g., INC-2025-001"
                value={form.incident_id}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="disaster_type" className="form-label">
                <span className="label-icon">⚠️</span>
                Disaster Type
              </label>
              <select
                id="disaster_type"
                name="disaster_type"
                value={form.disaster_type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select disaster type</option>
                {disasterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity" className="form-label">
                <span className="label-icon">📊</span>
                Severity Level
              </label>
              <select
                id="severity"
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select severity</option>
                <option value="1">Level 1 - Low</option>
                <option value="2">Level 2 - Moderate</option>
                <option value="3">Level 3 - High</option>
                <option value="4">Level 4 - Critical</option>
                <option value="5">Level 5 - Severe</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="state" className="form-label">
                <span className="label-icon">📍</span>
                State
              </label>
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select state</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="district" className="form-label">
                <span className="label-icon">🏘️</span>
                District
              </label>
              <input
                id="district"
                name="district"
                type="text"
                placeholder="Enter district name"
                value={form.district}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="timestamp" className="form-label">
                <span className="label-icon">🕒</span>
                Date & Time
              </label>
              <input
                id="timestamp"
                name="timestamp"
                type="datetime-local"
                value={form.timestamp}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="description" className="form-label">
              <span className="label-icon">📄</span>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Provide detailed information about the incident..."
              value={form.description}
              onChange={handleChange}
              className="form-textarea"
              rows="5"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                Submitting...
              </>
            ) : (
              <>
                <span className="button-icon">✓</span>
                Submit Report
              </>
            )}
          </button>

          {submitStatus === "success" && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              Incident reported successfully!
            </div>
          )}

          {submitStatus === "error" && (
            <div className="alert alert-error">
              <span className="alert-icon">✕</span>
              Failed to report incident. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}