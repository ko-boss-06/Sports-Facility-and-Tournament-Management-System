import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function PublicTournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/public/tournaments/${id}`
        );

        setTournament(response.data);
      } catch (err) {
        console.error(
          "Error loading tournament:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load tournament details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="tournament-page">
        <div className="tournament-card">
          <p>Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tournament-page">
        <div className="tournament-card">
          <div className="form-error">
            {error}
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/")}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  const proposedDate = new Date(
    tournament.proposed_date
  );

  const registrationDeadline = new Date(
    tournament.registration_deadline
  );

  return (
    <div className="tournament-page">
      <div className="tournament-card">

        <div className="tournament-header">
          <h1>{tournament.name}</h1>

          <p>
            {tournament.sport}
          </p>
        </div>

        <hr />

        <h2>Tournament Details</h2>

        <div className="tournament-details">

          <p>
            <strong>Sport:</strong>{" "}
            {tournament.sport}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {tournament.description ||
              "No description available."}
          </p>

          <p>
            <strong>Tournament Date:</strong>{" "}
            {proposedDate.toLocaleString()}
          </p>

          <p>
            <strong>Venue:</strong>{" "}
            {tournament.venue ||
              "Venue will be announced"}
          </p>

          <p>
            <strong>Maximum Teams:</strong>{" "}
            {tournament.max_teams}
          </p>

          <p>
            <strong>Registration Deadline:</strong>{" "}
            {registrationDeadline.toLocaleString()}
          </p>

          <p>
            <strong>Rules:</strong>{" "}
            {tournament.rules ||
              "Standard tournament rules apply."}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {tournament.status}
          </p>

        </div>

        <hr />

        <h2>Team Registration</h2>

        <p>
          External students and external teams can
          register for this tournament without
          creating an account.
        </p>

        <div className="form-actions">

          <button
            className="primary-button"
            onClick={() =>
              navigate(
                `/external-team-registration/${tournament.id}`
              )
            }
          >
            Register External Team
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate("/")}
          >
            Back to Tournaments
          </button>

        </div>

      </div>
    </div>
  );
}

export default PublicTournamentDetails;