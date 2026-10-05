import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";

function TournamentManagement() {
  // =========================================================
  // STATE
  // =========================================================

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // API URL
  // =========================================================

  const API_URL = "http://127.0.0.1:8000";

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
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
  };

  // =========================================================
  // LOAD APPROVED TOURNAMENTS
  // =========================================================

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token not found. Please login as Sports Coordinator."
        );
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/v1/tournaments/approved`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "Approved tournaments:",
        response.data
      );

      setTournaments(response.data);

    } catch (err) {
      console.error(
        "Error loading approved tournaments:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.detail ||
          `Server error: ${err.response.status}`
        );
      } else {
        setError(
          "Unable to connect to the backend server."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PAGE
  // =========================================================

  useEffect(() => {
    loadTournaments();
  }, []);

  // =========================================================
  // SELECT TOURNAMENT
  // =========================================================

  const handleSelectTournament = (tournament) => {
    console.log(
      "Selected tournament:",
      tournament
    );

    if (tournament.status !== "APPROVED") {
      setError(
        "Only approved tournaments can be managed."
      );
      return;
    }

    setSelectedTournament(tournament);

    setMessage("");
    setError("");

    setFormData({
      name: tournament.name || "",

      sport: tournament.sport || "",

      description:
        tournament.description || "",

      proposed_date:
        tournament.proposed_date
          ? tournament.proposed_date.slice(0, 16)
          : "",

      venue:
        tournament.venue || "",

      facility_id:
        tournament.facility_id !== null &&
        tournament.facility_id !== undefined
          ? String(tournament.facility_id)
          : "",

      max_teams:
        tournament.max_teams !== null &&
        tournament.max_teams !== undefined
          ? String(tournament.max_teams)
          : "",

      registration_deadline:
        tournament.registration_deadline
          ? tournament.registration_deadline.slice(0, 16)
          : "",

      rules:
        tournament.rules || ""
    });
  };

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Tournament name is required.";
    }

    if (!formData.sport.trim()) {
      return "Sport is required.";
    }

    if (!formData.proposed_date) {
      return "Tournament date is required.";
    }

    if (!formData.max_teams) {
      return "Maximum teams is required.";
    }

    if (
      Number(formData.max_teams) <= 0
    ) {
      return (
        "Maximum teams must be greater than 0."
      );
    }

    if (!formData.registration_deadline) {
      return (
        "Registration deadline is required."
      );
    }

    const proposedDate =
      new Date(
        formData.proposed_date
      );

    const registrationDeadline =
      new Date(
        formData.registration_deadline
      );

    if (
      Number.isNaN(
        proposedDate.getTime()
      ) ||
      Number.isNaN(
        registrationDeadline.getTime()
      )
    ) {
      return (
        "Please enter valid date and time values."
      );
    }

    if (
      registrationDeadline >=
      proposedDate
    ) {
      return (
        "Registration deadline must be before the tournament date."
      );
    }

    return null;
  };

  // =========================================================
  // UPDATE TOURNAMENT
  // =========================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // -------------------------------------------------------
    // Check selected tournament
    // -------------------------------------------------------

    if (!selectedTournament) {
      setError(
        "Please select a tournament first."
      );
      return;
    }

    // -------------------------------------------------------
    // Check status
    // -------------------------------------------------------

    if (
      selectedTournament.status !==
      "APPROVED"
    ) {
      setError(
        "Only approved tournaments can be managed."
      );
      return;
    }

    // -------------------------------------------------------
    // Validate form
    // -------------------------------------------------------

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    // -------------------------------------------------------
    // Get token
    // -------------------------------------------------------

    const token = getToken();

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    try {
      setSaving(true);

      // -----------------------------------------------------
      // Prepare data
      // -----------------------------------------------------

      const updateData = {
        name: formData.name.trim(),

        sport: formData.sport.trim(),

        description:
          formData.description.trim()
            ? formData.description.trim()
            : null,

        proposed_date:
          new Date(
            formData.proposed_date
          ).toISOString(),

        venue:
          formData.venue.trim()
            ? formData.venue.trim()
            : null,

        facility_id:
          formData.facility_id
            ? Number(
                formData.facility_id
              )
            : null,

        max_teams:
          Number(
            formData.max_teams
          ),

        registration_deadline:
          new Date(
            formData.registration_deadline
          ).toISOString(),

        rules:
          formData.rules.trim()
            ? formData.rules.trim()
            : null
      };

      console.log(
        "Updating tournament:",
        selectedTournament.id
      );

      console.log(
        "Update data:",
        updateData
      );

      // =====================================================
      // IMPORTANT FIX
      // =====================================================
      //
      // BACKEND:
      //
      // @router.put("/{tournament_id}/manage")
      //
      // Therefore frontend MUST call:
      //
      // /api/v1/tournaments/{id}/manage
      //
      // NOT:
      //
      // /api/v1/tournaments/{id}
      //
      // =====================================================

      const response = await axios.put(
        `${API_URL}/api/v1/tournaments/${selectedTournament.id}/manage`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log(
        "Tournament updated successfully:",
        response.data
      );

      // -----------------------------------------------------
      // Update selected tournament
      // -----------------------------------------------------

      setSelectedTournament(
        response.data
      );

      // -----------------------------------------------------
      // Success message
      // -----------------------------------------------------

      setMessage(
        "Tournament information updated successfully."
      );

      // -----------------------------------------------------
      // Refresh approved tournaments
      // -----------------------------------------------------

      await loadTournaments();

    } catch (err) {
      console.error(
        "Update tournament error:",
        err
      );

      if (err.response) {
        console.error(
          "Server response:",
          err.response.data
        );

        setError(
          err.response.data?.detail ||
          `Update failed with status ${err.response.status}.`
        );
      } else {
        setError(
          "Unable to connect to the backend server."
        );
      }

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    setSelectedTournament(null);

    setMessage("");
    setError("");

    resetForm();
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setMessage("");
    setError("");

    await loadTournaments();
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <Layout>
        <div className="page-container">

          <div className="content-card">

            <h2>
              Loading Tournament Management...
            </h2>

            <p>
              Please wait while approved
              tournaments are loaded.
            </p>

          </div>

        </div>
      </Layout>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

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
              Manage approved tournaments and
              maintain tournament information.
            </p>

          </div>

          {!selectedTournament && (
            <button
              type="button"
              onClick={handleRefresh}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer"
              }}
            >
              Refresh
            </button>
          )}

        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "8px",
              backgroundColor: "#dcfce7",
              color: "#166534",
              border:
                "1px solid #86efac"
            }}
          >
            {message}
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border:
                "1px solid #fca5a5"
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            APPROVED TOURNAMENT LIST
        ================================================= */}

        {!selectedTournament && (

          <div className="content-card">

            <h2>
              Approved Tournaments
            </h2>

            <p>
              Select an approved tournament
              to manage its information.
            </p>

            {tournaments.length === 0 ? (

              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  textAlign: "center"
                }}
              >

                <h3>
                  No Approved Tournaments
                </h3>

                <p>
                  There are currently no
                  tournaments approved by the PE.
                </p>

              </div>

            ) : (

              <div
                className="dashboard-grid"
                style={{
                  marginTop: "20px"
                }}
              >

                {tournaments.map(
                  (tournament) => (

                    <button
                      key={
                        tournament.id
                      }
                      type="button"
                      className="dashboard-action-card"
                      onClick={() =>
                        handleSelectTournament(
                          tournament
                        )
                      }
                      style={{
                        textAlign:
                          "left",
                        cursor:
                          "pointer"
                      }}
                    >

                      <h3>
                        {tournament.name}
                      </h3>

                      <p>
                        <strong>
                          Sport:
                        </strong>{" "}
                        {tournament.sport}
                      </p>

                      <p>
                        <strong>
                          Date:
                        </strong>{" "}

                        {tournament.proposed_date
                          ? new Date(
                              tournament.proposed_date
                            ).toLocaleString()
                          : "Not specified"}
                      </p>

                      <p>
                        <strong>
                          Venue:
                        </strong>{" "}

                        {tournament.venue ||
                          "Not specified"}
                      </p>

                      <p>
                        <strong>
                          Maximum Teams:
                        </strong>{" "}

                        {
                          tournament.max_teams
                        }
                      </p>

                      <p>
                        <strong>
                          Status:
                        </strong>{" "}

                        {
                          tournament.status
                        }
                      </p>

                    </button>

                  )
                )}

              </div>

            )}

          </div>

        )}

        {/* =================================================
            EDIT / MANAGE TOURNAMENT
        ================================================= */}

        {selectedTournament && (

          <div className="content-card">

            {/* =================================================
                MANAGEMENT HEADER
            ================================================= */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "25px"
              }}
            >

              <div>

                <h2>
                  Manage Tournament
                </h2>

                <p>
                  Update the approved
                  tournament information below.
                </p>

              </div>

              <span
                style={{
                  padding:
                    "7px 14px",
                  borderRadius:
                    "20px",
                  backgroundColor:
                    "#dcfce7",
                  color:
                    "#166534",
                  fontWeight:
                    "600"
                }}
              >
                {
                  selectedTournament.status
                }
              </span>

            </div>

            {/* =================================================
                UPDATE FORM
            ================================================= */}

            <form
              onSubmit={
                handleUpdate
              }
            >

              {/* =================================================
                  TOURNAMENT NAME
              ================================================= */}

              <div className="form-group">

                <label>
                  Tournament Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter tournament name"
                  required
                />

              </div>

              {/* =================================================
                  SPORT
              ================================================= */}

              <div className="form-group">

                <label>
                  Sport *
                </label>

                <input
                  type="text"
                  name="sport"
                  value={
                    formData.sport
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter sport"
                  required
                />

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter tournament description"
                  rows="4"
                />

              </div>

              {/* =================================================
                  TOURNAMENT DATE
              ================================================= */}

              <div className="form-group">

                <label>
                  Tournament Date *
                </label>

                <input
                  type="datetime-local"
                  name="proposed_date"
                  value={
                    formData.proposed_date
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              {/* =================================================
                  VENUE
              ================================================= */}

              <div className="form-group">

                <label>
                  Venue
                </label>

                <input
                  type="text"
                  name="venue"
                  value={
                    formData.venue
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter venue"
                />

              </div>

              {/* =================================================
                  FACILITY ID
              ================================================= */}

              <div className="form-group">

                <label>
                  Facility ID
                </label>

                <input
                  type="number"
                  name="facility_id"
                  value={
                    formData.facility_id
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter facility ID"
                  min="1"
                />

              </div>

              {/* =================================================
                  MAXIMUM TEAMS
              ================================================= */}

              <div className="form-group">

                <label>
                  Maximum Teams *
                </label>

                <input
                  type="number"
                  name="max_teams"
                  value={
                    formData.max_teams
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter maximum teams"
                  min="1"
                  required
                />

              </div>

              {/* =================================================
                  REGISTRATION DEADLINE
              ================================================= */}

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
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              {/* =================================================
                  RULES
              ================================================= */}

              <div className="form-group">

                <label>
                  Rules
                </label>

                <textarea
                  name="rules"
                  value={
                    formData.rules
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter tournament rules"
                  rows="5"
                />

              </div>

              {/* =================================================
                  STATUS
              ================================================= */}

              <div className="form-group">

                <label>
                  Tournament Status
                </label>

                <input
                  type="text"
                  value={
                    selectedTournament.status
                  }
                  disabled
                />

                <small>
                  Tournament status is
                  controlled by the approval
                  workflow and cannot be
                  changed here.
                </small>

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop:
                    "25px"
                }}
              >

                <button
                  type="submit"
                  className="login-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    saving
                  }
                  style={{
                    padding:
                      "12px 20px",
                    borderRadius:
                      "6px",
                    border:
                      "1px solid #ccc",
                    backgroundColor:
                      "#fff",
                    cursor:
                      "pointer"
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}

      </div>

    </Layout>
  );
}

export default TournamentManagement;