import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

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
    <Layout>

      <div className="page-container">

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Create Tournament Proposal</h1>

            <p>
              Submit a new tournament proposal for review by
              the Sports Coordinator.
            </p>
          </div>
        </div>


        {/* Tournament Form */}
        <div className="content-card tournament-form-card">

          <h2>Tournament Details</h2>

          <form
            className="tournament-form"
            onSubmit={handleSubmit}
          >

            {/* Tournament Name */}
            <div className="form-group">
              <label htmlFor="name">
                Tournament Name <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter tournament name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>


            {/* Sport */}
            <div className="form-group">
              <label htmlFor="sport">
                Sport <span>*</span>
              </label>

              <input
                id="sport"
                type="text"
                name="sport"
                placeholder="Example: Basketball"
                value={formData.sport}
                onChange={handleChange}
              />
            </div>


            {/* Description */}
            <div className="form-group form-group-full">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Enter tournament description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>


            {/* Date and Deadline */}
            <div className="form-row">

              <div className="form-group">
                <label htmlFor="proposed_date">
                  Proposed Date & Time <span>*</span>
                </label>

                <input
                  id="proposed_date"
                  type="datetime-local"
                  name="proposed_date"
                  value={formData.proposed_date}
                  onChange={handleChange}
                />
              </div>


              <div className="form-group">
                <label htmlFor="registration_deadline">
                  Registration Deadline <span>*</span>
                </label>

                <input
                  id="registration_deadline"
                  type="datetime-local"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                />
              </div>

            </div>


            {/* Venue */}
            <div className="form-group">
              <label htmlFor="venue">
                Venue
              </label>

              <input
                id="venue"
                type="text"
                name="venue"
                placeholder="Example: College Sports Complex"
                value={formData.venue}
                onChange={handleChange}
              />
            </div>


            {/* Facility and Teams */}
            <div className="form-row">

              <div className="form-group">
                <label htmlFor="facility_id">
                  Facility ID
                </label>

                <input
                  id="facility_id"
                  type="number"
                  name="facility_id"
                  placeholder="Example: 1"
                  min="1"
                  value={formData.facility_id}
                  onChange={handleChange}
                />
              </div>


              <div className="form-group">
                <label htmlFor="max_teams">
                  Maximum Teams <span>*</span>
                </label>

                <input
                  id="max_teams"
                  type="number"
                  name="max_teams"
                  placeholder="Example: 16"
                  min="1"
                  value={formData.max_teams}
                  onChange={handleChange}
                />
              </div>

            </div>


            {/* Rules */}
            <div className="form-group form-group-full">
              <label htmlFor="rules">
                Rules
              </label>

              <textarea
                id="rules"
                name="rules"
                placeholder="Enter tournament rules"
                value={formData.rules}
                onChange={handleChange}
                rows="4"
              />
            </div>


            {/* Error */}
            {error && (
              <div className="form-error form-group-full">
                {error}
              </div>
            )}


            {/* Success */}
            {message && (
              <div className="form-success form-group-full">
                {message}
              </div>
            )}


            {/* Actions */}
            <div className="form-actions form-group-full">

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
                {loading
                  ? "Submitting..."
                  : "Submit Proposal"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </Layout>
  );
}

export default CreateTournamentProposal;