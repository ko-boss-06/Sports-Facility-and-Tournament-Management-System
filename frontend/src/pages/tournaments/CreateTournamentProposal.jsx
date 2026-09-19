import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/v1";

function CreateTournamentProposal() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    description: "",
    proposed_date: "",
    venue: "",
    facility_id: "",
    max_teams: "",
    registration_deadline: "",
    rules: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.name ||
      !formData.sport ||
      !formData.proposed_date ||
      !formData.max_teams ||
      !formData.registration_deadline
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      new Date(formData.registration_deadline) >=
      new Date(formData.proposed_date)
    ) {
      setError(
        "Registration deadline must be before the proposed tournament date."
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in. Please login again.");
        navigate("/");
        return;
      }

      const payload = {
        name: formData.name,
        sport: formData.sport,
        description: formData.description || null,
        proposed_date: formData.proposed_date,
        venue: formData.venue || null,
        facility_id: formData.facility_id
          ? Number(formData.facility_id)
          : null,
        max_teams: Number(formData.max_teams),
        registration_deadline: formData.registration_deadline,
        rules: formData.rules || null,
      };

      const response = await axios.post(
        `${API_URL}/tournaments/proposals`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Tournament proposal created successfully. Tournament ID: ${response.data.id}`
      );

      setFormData({
        name: "",
        sport: "",
        description: "",
        proposed_date: "",
        venue: "",
        facility_id: "",
        max_teams: "",
        registration_deadline: "",
        rules: "",
      });
    } catch (err) {
      console.error("Tournament proposal error:", err);

      if (err.response) {
        setError(
          err.response.data?.detail ||
            "Unable to create tournament proposal."
        );
      } else {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tournament-page">
      <div className="tournament-card">
        <div className="tournament-header">
          <h1>Create Tournament Proposal</h1>
          <p>
            Submit a new tournament proposal for review by the Sports
            Coordinator.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Tournament Name <span>*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter tournament name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Sport <span>*</span>
            </label>
            <input
              type="text"
              name="sport"
              placeholder="Example: Basketball"
              value={formData.sport}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Enter tournament description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Proposed Date & Time <span>*</span>
              </label>
              <input
                type="datetime-local"
                name="proposed_date"
                value={formData.proposed_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Registration Deadline <span>*</span>
              </label>
              <input
                type="datetime-local"
                name="registration_deadline"
                value={formData.registration_deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input
              type="text"
              name="venue"
              placeholder="Example: College Sports Complex"
              value={formData.venue}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Facility ID</label>
              <input
                type="number"
                name="facility_id"
                placeholder="Example: 1"
                min="1"
                value={formData.facility_id}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Maximum Teams <span>*</span>
              </label>
              <input
                type="number"
                name="max_teams"
                placeholder="Example: 16"
                min="1"
                value={formData.max_teams}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Rules</label>
            <textarea
              name="rules"
              placeholder="Enter tournament rules"
              value={formData.rules}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-success">
              {message}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/dashboard/coach")}
            >
              Back to Dashboard
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTournamentProposal;