import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/v1";

function PETournamentApprovals() {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPendingTournaments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${API_URL}/tournaments/pending-approval`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTournaments(response.data);
    } catch (err) {
      console.error("Error fetching pending tournaments:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view tournament approvals."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load tournament approvals."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTournaments();
  }, []);

  const handleApprove = async (tournamentId) => {
    try {
      setActionId(tournamentId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${API_URL}/tournaments/proposals/${tournamentId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Tournament "${response.data.name}" has been approved successfully.`
      );

      setTournaments((previous) =>
        previous.filter(
          (tournament) => tournament.id !== tournamentId
        )
      );
    } catch (err) {
      console.error("Error approving tournament:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to approve tournament."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (tournamentId) => {
    const reason = window.prompt(
      "Enter the reason for rejecting this tournament proposal:"
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setActionId(tournamentId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${API_URL}/tournaments/proposals/${tournamentId}/reject`,
        {
          rejection_reason: reason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Tournament "${response.data.name}" has been rejected.`
      );

      setTournaments((previous) =>
        previous.filter(
          (tournament) => tournament.id !== tournamentId
        )
      );
    } catch (err) {
      console.error("Error rejecting tournament:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to reject tournament."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="tournament-page">
      <div className="tournament-card coordinator-proposals-card">

        <div className="tournament-header">
          <h1>Tournament Approvals</h1>

          <p>
            Review tournament proposals forwarded by the
            Sports Coordinator and approve or reject them.
          </p>
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

        {loading ? (
          <div className="loading-message">
            Loading tournament approvals...
          </div>
        ) : tournaments.length === 0 ? (
          <div className="empty-message">
            <h3>No Pending Approvals</h3>

            <p>
              There are currently no tournament proposals
              waiting for PE approval.
            </p>
          </div>
        ) : (
          <div className="proposal-list">

            {tournaments.map((tournament) => (

              <div
                className="proposal-card"
                key={tournament.id}
              >

                <div className="proposal-card-header">

                  <div>
                    <h2>{tournament.name}</h2>

                    <p className="proposal-sport">
                      {tournament.sport}
                    </p>
                  </div>

                  <span className="status-badge">
                    {tournament.status}
                  </span>

                </div>

                <div className="proposal-details">

                  <div className="detail-item">
                    <strong>Proposed Date</strong>

                    <span>
                      {new Date(
                        tournament.proposed_date
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Registration Deadline</strong>

                    <span>
                      {new Date(
                        tournament.registration_deadline
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Maximum Teams</strong>

                    <span>
                      {tournament.max_teams}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Venue</strong>

                    <span>
                      {tournament.venue ||
                        "Not specified"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Facility ID</strong>

                    <span>
                      {tournament.facility_id ||
                        "Not specified"}
                    </span>
                  </div>

                </div>

                {tournament.description && (
                  <div className="proposal-description">

                    <strong>Description</strong>

                    <p>
                      {tournament.description}
                    </p>

                  </div>
                )}

                {tournament.rules && (
                  <div className="proposal-description">

                    <strong>Rules</strong>

                    <p>
                      {tournament.rules}
                    </p>

                  </div>
                )}

                <div className="proposal-actions">

                  <button
                    className="primary-button"
                    onClick={() =>
                      handleApprove(tournament.id)
                    }
                    disabled={
                      actionId === tournament.id
                    }
                  >
                    {actionId === tournament.id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      handleReject(tournament.id)
                    }
                    disabled={
                      actionId === tournament.id
                    }
                  >
                    Reject
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

        <div className="form-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/dashboard/pe")
            }
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={fetchPendingTournaments}
          >
            Refresh
          </button>

        </div>

      </div>
    </div>
  );
}

export default PETournamentApprovals;