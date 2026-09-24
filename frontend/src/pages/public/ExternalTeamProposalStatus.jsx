import { useState } from "react";
import axios from "axios";

function ExternalTeamProposalStatus() {
  const [teamId, setTeamId] = useState("");
  const [externalContact, setExternalContact] = useState("");

  const [team, setTeam] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckStatus = async (event) => {
    event.preventDefault();

    setMessage("");
    setTeam(null);

    if (!teamId || !externalContact) {
      setMessage(
        "Please enter Team ID and External Contact."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/teams/external/status",
        {
          team_id: Number(teamId),
          external_contact: externalContact
        }
      );

      setTeam(response.data);

    } catch (error) {
      console.error(
        "Error checking team status:",
        error
      );

      if (error.response) {
        setMessage(
          error.response.data?.detail ||
          "Unable to find team proposal."
        );
      } else {
        setMessage(
          "Unable to connect to the server. " +
          "Please make sure the backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-approved";

      case "REJECTED":
        return "status-rejected";

      case "PENDING":
        return "status-pending";

      default:
        return "";
    }
  };


  return (
    <div className="external-status-page">

      <div className="external-status-card">

        <h1>
          Check Team Proposal Status
        </h1>

        <p>
          Enter your Team ID and external contact
          to view your registration status.
        </p>


        <form onSubmit={handleCheckStatus}>

          {/* Team ID */}

          <div className="form-group">

            <label>
              Team ID
            </label>

            <input
              type="number"
              placeholder="Enter your Team ID"
              value={teamId}
              onChange={(event) =>
                setTeamId(event.target.value)
              }
            />

          </div>


          {/* External Contact */}

          <div className="form-group">

            <label>
              External Contact
            </label>

            <input
              type="text"
              placeholder="Enter your external contact"
              value={externalContact}
              onChange={(event) =>
                setExternalContact(
                  event.target.value
                )
              }
            />

          </div>


          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Checking..."
              : "Check Proposal Status"}
          </button>

        </form>


        {/* Error */}

        {message && (
          <div className="status-message">
            {message}
          </div>
        )}


        {/* Team Result */}

        {team && (

          <div className="team-status-result">

            <hr />

            <h2>
              Team Details
            </h2>

            <p>
              <strong>Team ID:</strong>{" "}
              {team.id}
            </p>

            <p>
              <strong>Team Name:</strong>{" "}
              {team.team_name}
            </p>

            <p>
              <strong>Captain:</strong>{" "}
              {team.captain_name}
            </p>

            <p>
              <strong>Registration Type:</strong>{" "}
              {team.registration_type}
            </p>


            <div className="proposal-status">

              <strong>
                Proposal Status:
              </strong>

              <span
                className={getStatusClass(
                  team.status
                )}
              >
                {team.status}
              </span>

            </div>


            {/* Rejection reason */}

            {team.status === "REJECTED" &&
              team.rejection_reason && (

                <div className="rejection-reason">

                  <strong>
                    Rejection Reason:
                  </strong>

                  <p>
                    {team.rejection_reason}
                  </p>

                </div>

              )}

          </div>

        )}

      </div>

    </div>
  );
}

export default ExternalTeamProposalStatus;