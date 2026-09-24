import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LogoutButton from "../../components/LogoutButton";
import { getTournamentProposals } from "../../api/tournament";

function TournamentProposals() {
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTournamentProposals();

      setProposals(data);
    } catch (err) {
      console.error(err);

      const detail =
        err.response?.data?.detail ||
        "Unable to load tournament proposals.";

      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "APPROVED") {
      return {
        background: "#d4edda",
        color: "#155724",
      };
    }

    if (status === "REJECTED") {
      return {
        background: "#f8d7da",
        color: "#721c24",
      };
    }

    if (status === "FORWARDED") {
      return {
        background: "#fff3cd",
        color: "#856404",
      };
    }

    return {
      background: "#e7f3ff",
      color: "#004085",
    };
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1>My Tournament Proposals</h1>

          <p>
            View the tournaments you have proposed and
            check their current status.
          </p>
        </div>

        <LogoutButton />
      </div>

      <hr />

      <button
        onClick={() =>
          navigate("/dashboard/coach")
        }
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          padding: "10px 18px",
        }}
      >
        Back to Dashboard
      </button>

      {loading && (
        <p>Loading tournament proposals...</p>
      )}

      {error && (
        <div
          style={{
            padding: "15px",
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        proposals.length === 0 && (
          <div
            style={{
              padding: "20px",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <p>
              You have not created any tournament
              proposals yet.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        proposals.length > 0 && (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Tournament</th>
                  <th style={thStyle}>Sport</th>
                  <th style={thStyle}>Proposed Date</th>
                  <th style={thStyle}>Venue</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Rejection Reason</th>
                </tr>
              </thead>

              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td style={tdStyle}>
                      {proposal.id}
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {proposal.name}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      {proposal.sport}
                    </td>

                    <td style={tdStyle}>
                      {new Date(
                        proposal.proposed_date
                      ).toLocaleString()}
                    </td>

                    <td style={tdStyle}>
                      {proposal.venue}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "15px",
                          fontWeight: "bold",
                          ...getStatusStyle(
                            proposal.status
                          ),
                        }}
                      >
                        {proposal.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {proposal.rejection_reason ||
                        "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  background: "#f2f2f2",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "12px",
};

export default TournamentProposals;