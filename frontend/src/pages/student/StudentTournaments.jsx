import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";

function StudentTournaments() {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =========================================================
  // LOAD AVAILABLE TOURNAMENTS
  // =========================================================

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login as an Internal Student.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/v1/tournaments/available`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTournaments(response.data);

    } catch (err) {
      console.error(
        "Error loading tournaments:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load available tournaments."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadTournaments();
  }, []);

  // =========================================================
  // SELECT TOURNAMENT
  // =========================================================

  const handleSelectTournament = async (tournamentId) => {
    try {
      setError("");

      const token = getToken();

      const response = await axios.get(
        `${API_URL}/api/v1/tournaments/${tournamentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSelectedTournament(response.data);

    } catch (err) {
      console.error(
        "Error loading tournament details:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load tournament details."
      );
    }
  };

  // =========================================================
  // BACK TO TOURNAMENT LIST
  // =========================================================

  const handleBack = () => {
    setSelectedTournament(null);
    setError("");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Layout>
        <div className="page-container">

          <div className="content-card">

            <h2>
              Loading Tournaments...
            </h2>

            <p>
              Please wait while available
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
            HEADER
        ================================================= */}

        <div className="page-header">

          <div>

            <h1>
              Available Tournaments
            </h1>

            <p>
              View tournaments available for
              student participation.
            </p>

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5"
            }}
          >
            {error}
          </div>

        )}


        {/* =================================================
            TOURNAMENT LIST
        ================================================= */}

        {!selectedTournament && (

          <div className="content-card">

            <h2>
              Tournament Schedules
            </h2>

            <p>
              Select a tournament to view
              complete tournament details.
            </p>


            {tournaments.length === 0 ? (

              <div
                style={{
                  marginTop: "25px",
                  padding: "25px",
                  textAlign: "center"
                }}
              >

                <h3>
                  No Tournaments Available
                </h3>

                <p>
                  There are currently no approved
                  tournaments available for
                  students.
                </p>

              </div>

            ) : (

              <div
                className="dashboard-grid"
                style={{
                  marginTop: "25px"
                }}
              >

                {tournaments.map(
                  (tournament) => (

                    <button
                      key={tournament.id}
                      type="button"
                      className="dashboard-action-card"
                      onClick={() =>
                        handleSelectTournament(
                          tournament.id
                        )
                      }
                      style={{
                        textAlign: "left",
                        cursor: "pointer"
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
                        {tournament.max_teams}
                      </p>

                      <p>
                        <strong>
                          Registration Deadline:
                        </strong>{" "}
                        {tournament.registration_deadline
                          ? new Date(
                              tournament.registration_deadline
                            ).toLocaleString()
                          : "Not specified"}
                      </p>

                      <p>
                        <strong>
                          Status:
                        </strong>{" "}
                        {tournament.status}
                      </p>

                    </button>

                  )
                )}

              </div>

            )}

          </div>

        )}


        {/* =================================================
            TOURNAMENT DETAILS
        ================================================= */}

        {selectedTournament && (

          <div className="content-card">

            {/* Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px"
              }}
            >

              <div>

                <h2>
                  {selectedTournament.name}
                </h2>

                <p>
                  Tournament Details
                </p>

              </div>

              <span
                style={{
                  padding: "7px 14px",
                  borderRadius: "20px",
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  fontWeight: "600"
                }}
              >
                {selectedTournament.status}
              </span>

            </div>


            {/* =================================================
                DETAILS
            ================================================= */}

            <div>

              <div className="form-group">

                <label>
                  Tournament Name
                </label>

                <input
                  type="text"
                  value={
                    selectedTournament.name || ""
                  }
                  disabled
                />

              </div>


              <div className="form-group">

                <label>
                  Sport
                </label>

                <input
                  type="text"
                  value={
                    selectedTournament.sport || ""
                  }
                  disabled
                />

              </div>


              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={
                    selectedTournament.description ||
                    "No description available."
                  }
                  rows="4"
                  disabled
                />

              </div>


              <div className="form-group">

                <label>
                  Tournament Date
                </label>

                <input
                  type="text"
                  value={
                    selectedTournament.proposed_date
                      ? new Date(
                          selectedTournament.proposed_date
                        ).toLocaleString()
                      : "Not specified"
                  }
                  disabled
                />

              </div>


              <div className="form-group">

                <label>
                  Venue
                </label>

                <input
                  type="text"
                  value={
                    selectedTournament.venue ||
                    "Not specified"
                  }
                  disabled
                />

              </div>


              <div className="form-group">

                <label>
                  Maximum Teams
                </label>

                <input
                  type="text"
                  value={
                    selectedTournament.max_teams ??
                    "Not specified"
                  }
                  disabled
                />

              </div>


              <div className="form-group">

                <label>
                  Registration Deadline
                </label>

                <input
                  type="text"
                  value={
                    selectedTournament.registration_deadline
                      ? new Date(
                          selectedTournament.registration_deadline
                        ).toLocaleString()
                      : "Not specified"
                  }
                  disabled
                />

              </div>


              <div className="form-group">

                <label>
                  Rules
                </label>

                <textarea
                  value={
                    selectedTournament.rules ||
                    "No specific rules provided."
                  }
                  rows="6"
                  disabled
                />

              </div>


              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "25px"
                }}
              >

                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                    cursor: "pointer"
                  }}
                >
                  Back to Tournaments
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </Layout>
  );
}

export default StudentTournaments;