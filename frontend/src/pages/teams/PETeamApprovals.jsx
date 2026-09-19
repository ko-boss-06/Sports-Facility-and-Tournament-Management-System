import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/v1";

function PETeamApprovals() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPendingTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${API_URL}/teams/pending-approval`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeams(response.data);
    } catch (err) {
      console.error("Error fetching pending teams:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view team approvals."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load team approvals."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeams();
  }, []);

  const handleApprove = async (teamId) => {
    try {
      setActionId(teamId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${API_URL}/teams/${teamId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Team "${response.data.team_name}" has been approved successfully.`
      );

      setTeams((previous) =>
        previous.filter(
          (team) => team.id !== teamId
        )
      );
    } catch (err) {
      console.error("Error approving team:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to approve team."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (teamId) => {
    const reason = window.prompt(
      "Enter the reason for rejecting this team:"
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setActionId(teamId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${API_URL}/teams/${teamId}/reject`,
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
        `Team "${response.data.team_name}" has been rejected.`
      );

      setTeams((previous) =>
        previous.filter(
          (team) => team.id !== teamId
        )
      );
    } catch (err) {
      console.error("Error rejecting team:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to reject team."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="tournament-page">
      <div className="tournament-card coordinator-proposals-card">

        <div className="tournament-header">
          <h1>Team Approvals</h1>

          <p>
            Review team registrations and approve or
            reject teams for approved tournaments.
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
            Loading team registrations...
          </div>
        ) : teams.length === 0 ? (
          <div className="empty-message">
            <h3>No Pending Team Registrations</h3>

            <p>
              There are currently no team registrations
              waiting for PE approval.
            </p>
          </div>
        ) : (
          <div className="proposal-list">

            {teams.map((team) => (

              <div
                className="proposal-card"
                key={team.id}
              >

                <div className="proposal-card-header">

                  <div>
                    <h2>{team.team_name}</h2>

                    <p className="proposal-sport">
                      {team.registration_type} Registration
                    </p>
                  </div>

                  <span className="status-badge">
                    {team.status}
                  </span>

                </div>

                <div className="proposal-details">

                  <div className="detail-item">
                    <strong>Tournament ID</strong>

                    <span>
                      {team.tournament_id}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Captain</strong>

                    <span>
                      {team.captain_name}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Captain Email</strong>

                    <span>
                      {team.captain_email}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Captain Phone</strong>

                    <span>
                      {team.captain_phone}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Registration Type</strong>

                    <span>
                      {team.registration_type}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Team Members</strong>

                    <span>
                      {team.members?.length || 0}
                    </span>
                  </div>

                </div>

                {team.external_contact && (
                  <div className="proposal-description">

                    <strong>External Contact</strong>

                    <p>
                      {team.external_contact}
                    </p>

                  </div>
                )}

                {team.members &&
                  team.members.length > 0 && (
                    <div className="proposal-description">

                      <strong>Team Members</strong>

                      <ul>
                        {team.members.map((member) => (
                          <li key={member.id}>
                            {member.name} —{" "}
                            {member.role}
                            {member.student_id
                              ? ` (${member.student_id})`
                              : ""}
                          </li>
                        ))}
                      </ul>

                    </div>
                  )}

                <div className="proposal-actions">

                  <button
                    className="primary-button"
                    onClick={() =>
                      handleApprove(team.id)
                    }
                    disabled={
                      actionId === team.id
                    }
                  >
                    {actionId === team.id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      handleReject(team.id)
                    }
                    disabled={
                      actionId === team.id
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
            onClick={fetchPendingTeams}
          >
            Refresh
          </button>

        </div>

      </div>
    </div>
  );
}

export default PETeamApprovals;