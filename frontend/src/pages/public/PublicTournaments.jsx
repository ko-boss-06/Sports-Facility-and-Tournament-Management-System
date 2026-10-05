import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PublicTournaments() {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/v1/public/tournaments"
      );

      setTournaments(response.data);
    } catch (err) {
      console.error("Unable to load tournaments:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load public tournaments."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page">

      {/* HEADER */}

      <header className="public-header">

        <div>
          <h1>Sports Management System</h1>

          <p>
            Public Tournament Information
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="public-login-button"
        >
          Login
        </button>

      </header>


      {/* CONTENT */}

      <main className="public-content">

        <div className="public-title-section">

          <h2>Available Tournaments</h2>

          <p>
            View approved tournaments, schedules,
            and published results.
          </p>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="public-message">
            Loading tournaments...
          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div className="public-error">
            {error}
          </div>
        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          tournaments.length === 0 && (
            <div className="public-message">
              No approved tournaments are currently
              available.
            </div>
          )}


        {/* TOURNAMENTS */}

        {!loading &&
          !error &&
          tournaments.length > 0 && (

            <div className="public-tournament-grid">

              {tournaments.map((tournament) => (

                <div
                  key={tournament.id}
                  className="public-tournament-card"
                >

                  <div className="tournament-card-header">

                    <h3>
                      {tournament.name}
                    </h3>

                    <span className="status-badge">
                      {tournament.status}
                    </span>

                  </div>


                  <div className="tournament-card-body">

                    <p>
                      <strong>Sport:</strong>{" "}
                      {tournament.sport}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        tournament.proposed_date
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Venue:</strong>{" "}
                      {tournament.venue || "Not specified"}
                    </p>

                    <p>
                      <strong>Maximum Teams:</strong>{" "}
                      {tournament.max_teams}
                    </p>

                  </div>


                  <button
                    type="button"
                    className="view-tournament-button"
                    onClick={() =>
                      navigate(
                        `/public/tournaments/${tournament.id}`
                      )
                    }
                  >
                    View Tournament Details
                  </button>

                </div>

              ))}

            </div>

          )}

      </main>

    </div>
  );
}

export default PublicTournaments;