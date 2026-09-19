import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/v1";

function CoordinatorProposals() {
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forwardingId, setForwardingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${API_URL}/tournaments/proposals`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProposals(response.data);
    } catch (err) {
      console.error("Error fetching proposals:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view tournament proposals.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load tournament proposals."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleForward = async (tournamentId) => {
    try {
      setForwardingId(tournamentId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${API_URL}/tournaments/proposals/${tournamentId}/forward`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Tournament "${response.data.name}" was forwarded to PE successfully.`
      );

      setProposals((previous) =>
        previous.filter(
          (proposal) => proposal.id !== tournamentId
        )
      );
    } catch (err) {
      console.error("Error forwarding proposal:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to forward tournament proposal."
      );
    } finally {
      setForwardingId(null);
    }
  };

  return (
    <div className="tournament-page">
      <div className="tournament-card coordinator-proposals-card">
        <div className="tournament-header">
          <h1>Tournament Proposals</h1>
          <p>
            Review tournament proposals submitted by coaches
            and forward them to the PE for approval.
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
            Loading tournament proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="empty-message">
            <h3>No Pending Proposals</h3>
            <p>
              There are currently no tournament proposals
              waiting for review.
            </p>
          </div>
        ) : (
          <div className="proposal-list">
            {proposals.map((proposal) => (
              <div
                className="proposal-card"
                key={proposal.id}
              >
                <div className="proposal-card-header">
                  <div>
                    <h2>{proposal.name}</h2>
                    <p className="proposal-sport">
                      {proposal.sport}
                    </p>
                  </div>

                  <span className="status-badge">
                    {proposal.status}
                  </span>
                </div>

                <div className="proposal-details">
                  <div className="detail-item">
                    <strong>Proposed Date</strong>
                    <span>
                      {new Date(
                        proposal.proposed_date
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Registration Deadline</strong>
                    <span>
                      {new Date(
                        proposal.registration_deadline
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Maximum Teams</strong>
                    <span>
                      {proposal.max_teams}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Venue</strong>
                    <span>
                      {proposal.venue || "Not specified"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Facility ID</strong>
                    <span>
                      {proposal.facility_id || "Not specified"}
                    </span>
                  </div>
                </div>

                {proposal.description && (
                  <div className="proposal-description">
                    <strong>Description</strong>
                    <p>{proposal.description}</p>
                  </div>
                )}

                {proposal.rules && (
                  <div className="proposal-description">
                    <strong>Rules</strong>
                    <p>{proposal.rules}</p>
                  </div>
                )}

                <div className="proposal-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      handleForward(proposal.id)
                    }
                    disabled={forwardingId === proposal.id}
                  >
                    {forwardingId === proposal.id
                      ? "Forwarding..."
                      : "Forward to PE"}
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
              navigate("/dashboard/coordinator")
            }
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={fetchProposals}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default CoordinatorProposals;