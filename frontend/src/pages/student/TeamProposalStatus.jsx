import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TeamProposalStatus() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeamProposals();
  }, []);

  const fetchTeamProposals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/v1/teams/my-proposals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeams(response.data);
    } catch (error) {
      console.error(
        "Error loading team proposals:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.detail ||
          "Unable to load team proposals."
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
    <div className="team-proposal-status">

      {/* Header */}
      <div className="page-header">

        <button
          onClick={() => navigate("/dashboard/student")}
        >
          ← Back to Dashboard
        </button>

        <h1>
          My Team Proposal Status
        </h1>

        <p>
          View the approval status of your team
          registrations.
        </p>

      </div>


      {/* Loading */}
      {loading && (
        <div className="loading-message">
          Loading team proposals...
        </div>
      )}


      {/* Error */}
      {!loading && error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* No proposals */}
      {!loading &&
        !error &&
        teams.length === 0 && (
          <div className="empty-message">

            <h2>
              No Team Proposals
            </h2>

            <p>
              You have not registered any team
              proposals yet.
            </p>

            <button
              onClick={() =>
                navigate("/teams/register")
              }
            >
              Register a Team
            </button>

          </div>
        )}


      {/* Team proposals */}
      {!loading &&
        !error &&
        teams.length > 0 && (

          <div className="team-proposals">

            {teams.map((team) => (

              <div
                className="team-card"
                key={team.id}
              >

                {/* Team header */}
                <div className="team-card-header">

                  <div>
                    <h2>
                      {team.team_name}
                    </h2>

                    <p>
                      Team ID: {team.id}
                    </p>
                  </div>

                  <span
                    className={`team-status ${getStatusClass(
                      team.status
                    )}`}
                  >
                    {team.status}
                  </span>

                </div>


                {/* Team information */}
                <div className="team-info">

                  <p>
                    <strong>
                      Captain:
                    </strong>{" "}
                    {team.captain_name}
                  </p>

                  <p>
                    <strong>
                      Captain Email:
                    </strong>{" "}
                    {team.captain_email}
                  </p>

                  <p>
                    <strong>
                      Registration Type:
                    </strong>{" "}
                    {team.registration_type}
                  </p>

                  <p>
                    <strong>
                      Tournament ID:
                    </strong>{" "}
                    {team.tournament_id}
                  </p>

                </div>


                {/* Pending message */}
                {team.status === "PENDING" && (
                  <div className="proposal-message pending-message">

                    <strong>
                      Proposal Pending
                    </strong>

                    <p>
                      Your team proposal has been
                      submitted and is waiting for
                      approval from the Physical
                      Education department.
                    </p>

                  </div>
                )}


                {/* Approved message */}
                {team.status === "APPROVED" && (
                  <div className="proposal-message approved-message">

                    <strong>
                      Team Approved
                    </strong>

                    <p>
                      Your team proposal has been
                      approved.
                    </p>

                  </div>
                )}


                {/* Rejected message */}
                {team.status === "REJECTED" && (
                  <div className="proposal-message rejected-message">

                    <strong>
                      Team Rejected
                    </strong>

                    <p>
                      Your team proposal has been
                      rejected.
                    </p>

                    {team.rejection_reason && (
                      <p>
                        <strong>
                          Reason:
                        </strong>{" "}
                        {team.rejection_reason}
                      </p>
                    )}

                  </div>
                )}


                {/* Members */}
                <div className="team-members">

                  <h3>
                    Team Members
                  </h3>

                  {team.members &&
                    team.members.length > 0 ? (

                    <ul>

                      {team.members.map(
                        (member) => (

                          <li
                            key={member.id}
                          >

                            <strong>
                              {member.name}
                            </strong>

                            {" - "}

                            {member.role}

                          </li>

                        )
                      )}

                    </ul>

                  ) : (

                    <p>
                      No team members listed.
                    </p>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

    </div>
  );
}

export default TeamProposalStatus;