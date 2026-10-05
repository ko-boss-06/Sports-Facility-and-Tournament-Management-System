import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout";

function CoordinatorTournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    description: "",
    proposed_date: "",
    venue: "",
    facility_id: "",
    max_teams: "",
    registration_deadline: "",
    rules: ""
  });

  // =====================================================
  // GET AUTH TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =====================================================
  // LOAD APPROVED TOURNAMENTS
  // =====================================================

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await axios.get(
        "http://127.0.0.1:8000/api/v1/tournaments/approved",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTournaments(response.data);

    } catch (err) {
      console.error("Error loading tournaments:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load approved tournaments."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    loadTournaments();
  }, []);

  // =====================================================
  // SELECT TOURNAMENT
  // =====================================================

  const handleSelectTournament = (tournament) => {
    setSelectedTournament(tournament);

    setMessage("");
    setError("");

    setFormData({
      name: tournament.name || "",
      sport: tournament.sport || "",
      description: tournament.description || "",
      proposed_date: tournament.proposed_date
        ? tournament.proposed_date.slice(0, 16)
        : "",
      venue: tournament.venue || "",
      facility_id: tournament.facility_id || "",
      max_teams: tournament.max_teams || "",
      registration_deadline:
        tournament.registration_deadline
          ? tournament.registration_deadline.slice(0, 16)
          : "",
      rules: tournament.rules || ""
    });
  };

  // =====================================================
  // HANDLE FORM INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =====================================================
  // UPDATE TOURNAMENT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTournament) {
      setError("Please select a tournament first.");
      return;
    }

    setMessage("");
    setError("");

    // ---------------------------------------------------
    // Required field validation
    // ---------------------------------------------------

    if (
      !formData.name.trim() ||
      !formData.sport.trim() ||
      !formData.proposed_date ||
      !formData.max_teams ||
      !formData.registration_deadline
    ) {
      setError(
        "Please fill in all required tournament information."
      );

      return;
    }

    // ---------------------------------------------------
    // Date validation
    // ---------------------------------------------------

    const proposedDate = new Date(
      formData.proposed_date
    );

    const registrationDeadline = new Date(
      formData.registration_deadline
    );

    if (registrationDeadline >= proposedDate) {
      setError(
        "Registration deadline must be before the tournament date."
      );

      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const payload = {
        name: formData.name.trim(),
        sport: formData.sport.trim(),
        description:
          formData.description.trim() || null,
        proposed_date: proposedDate.toISOString(),
        venue:
          formData.venue.trim() || null,
        facility_id:
          formData.facility_id
            ? Number(formData.facility_id)
            : null,
        max_teams: Number(formData.max_teams),
        registration_deadline:
          registrationDeadline.toISOString(),
        rules:
          formData.rules.trim() || null
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/api/v1/tournaments/${selectedTournament.id}/manage`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // ---------------------------------------------------
      // Update selected tournament
      // ---------------------------------------------------

      setSelectedTournament(response.data);

      // ---------------------------------------------------
      // Update tournament list
      // ---------------------------------------------------

      setTournaments((previous) =>
        previous.map((tournament) =>
          tournament.id === response.data.id
            ? response.data
            : tournament
        )
      );

      setMessage(
        "Tournament information updated successfully."
      );

    } catch (err) {
      console.error(
        "Error updating tournament:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to update tournament."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PAGE UI
  // =====================================================

  return (
    <Layout>

      <div className="page-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="page-header">

          <div>
            <h1>
              Tournament Management
            </h1>

            <p>
              Manage approved tournaments and maintain
              tournament information.
            </p>
          </div>

        </div>


        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* =================================================
            APPROVED TOURNAMENTS
        ================================================= */}

        <div className="content-card">

          <h2>
            Approved Tournaments
          </h2>

          {loading ? (

            <p>
              Loading approved tournaments...
            </p>

          ) : tournaments.length === 0 ? (

            <p>
              No approved tournaments are available.
            </p>

          ) : (

            <div className="dashboard-grid">

              {tournaments.map((tournament) => (

                <button
                  type="button"
                  key={tournament.id}
                  className="dashboard-action-card"
                  onClick={() =>
                    handleSelectTournament(tournament)
                  }
                >

                  <h3>
                    {tournament.name}
                  </h3>

                  <p>
                    Sport: {tournament.sport}
                  </p>

                  <p>
                    Venue:{" "}
                    {tournament.venue || "Not specified"}
                  </p>

                  <p>
                    Status: {tournament.status}
                  </p>

                </button>

              ))}

            </div>

          )}

        </div>


        {/* =================================================
            EDIT TOURNAMENT
        ================================================= */}

        {selectedTournament && (

          <div className="content-card">

            <h2>
              Edit Tournament
            </h2>

            <p>
              Update the information for the selected
              approved tournament.
            </p>


            <form
              onSubmit={handleSubmit}
              className="facility-form"
            >

              {/* Name */}

              <div className="form-group">

                <label>
                  Tournament Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter tournament name"
                />

              </div>


              {/* Sport */}

              <div className="form-group">

                <label>
                  Sport *
                </label>

                <input
                  type="text"
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  placeholder="Enter sport"
                />

              </div>


              {/* Description */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter tournament description"
                  rows="4"
                />

              </div>


              {/* Proposed Date */}

              <div className="form-group">

                <label>
                  Tournament Date *
                </label>

                <input
                  type="datetime-local"
                  name="proposed_date"
                  value={formData.proposed_date}
                  onChange={handleChange}
                />

              </div>


              {/* Registration Deadline */}

              <div className="form-group">

                <label>
                  Registration Deadline *
                </label>

                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={
                    formData.registration_deadline
                  }
                  onChange={handleChange}
                />

              </div>


              {/* Venue */}

              <div className="form-group">

                <label>
                  Venue
                </label>

                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Enter venue"
                />

              </div>


              {/* Facility ID */}

              <div className="form-group">

                <label>
                  Facility ID
                </label>

                <input
                  type="number"
                  name="facility_id"
                  value={formData.facility_id}
                  onChange={handleChange}
                  min="1"
                  placeholder="Enter facility ID"
                />

              </div>


              {/* Maximum Teams */}

              <div className="form-group">

                <label>
                  Maximum Teams *
                </label>

                <input
                  type="number"
                  name="max_teams"
                  value={formData.max_teams}
                  onChange={handleChange}
                  min="1"
                  placeholder="Enter maximum teams"
                />

              </div>


              {/* Rules */}

              <div className="form-group">

                <label>
                  Tournament Rules
                </label>

                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  placeholder="Enter tournament rules"
                  rows="5"
                />

              </div>


              {/* Current Status */}

              <div className="form-group">

                <label>
                  Current Status
                </label>

                <input
                  type="text"
                  value={
                    selectedTournament.status
                  }
                  disabled
                />

                <small>
                  Tournament status is maintained by the
                  approval workflow and cannot be changed
                  here.
                </small>

              </div>


              {/* Save */}

              <button
                type="submit"
                className="login-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Tournament Changes"}
              </button>

            </form>

          </div>

        )}

      </div>

    </Layout>
  );
}

export default CoordinatorTournamentManagement;