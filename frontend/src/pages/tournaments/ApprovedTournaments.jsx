import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getApprovedTournaments
} from "../../api/tournament";

import LogoutButton from "../../components/LogoutButton";


function ApprovedTournaments() {

  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =======================================================
  // LOAD APPROVED TOURNAMENTS
  // =======================================================

  useEffect(() => {

    loadApprovedTournaments();

  }, []);


  const loadApprovedTournaments = async () => {

    try {

      setLoading(true);

      setError("");

      const data =
        await getApprovedTournaments();

      setTournaments(data);

    } catch (error) {

      console.error(
        "Error loading approved tournaments:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load approved tournaments."
      );

    } finally {

      setLoading(false);

    }
  };


  // =======================================================
  // UI
  // =======================================================

  return (

    <div>

      <h1>
        Approved Tournaments
      </h1>

      <p>
        Tournaments approved by the Physical Education department.
      </p>


      <LogoutButton />

      <hr />


      {/* BACK BUTTON */}

      <button
        onClick={() =>
          navigate("/dashboard/coordinator")
        }
      >
        Back to Dashboard
      </button>


      <hr />


      {/* LOADING */}

      {loading && (
        <p>
          Loading approved tournaments...
        </p>
      )}


      {/* ERROR */}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}


      {/* NO TOURNAMENTS */}

      {!loading &&
        !error &&
        tournaments.length === 0 && (

          <p>
            No approved tournaments found.
          </p>

        )}


      {/* TOURNAMENT LIST */}

      {!loading &&
        !error &&
        tournaments.length > 0 && (

          <div>

            <h2>
              Approved Tournament List
            </h2>


            {tournaments.map(
              (tournament) => (

                <div
                  key={tournament.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "8px"
                  }}
                >

                  <h3>
                    {tournament.name}
                  </h3>


                  <p>
                    <strong>Sport:</strong>{" "}
                    {tournament.sport}
                  </p>


                  <p>
                    <strong>Description:</strong>{" "}
                    {tournament.description}
                  </p>


                  <p>
                    <strong>Proposed Date:</strong>{" "}
                    {tournament.proposed_date}
                  </p>


                  <p>
                    <strong>Venue:</strong>{" "}
                    {tournament.venue}
                  </p>


                  <p>
                    <strong>Maximum Teams:</strong>{" "}
                    {tournament.max_teams}
                  </p>


                  <p>
                    <strong>
                      Registration Deadline:
                    </strong>{" "}
                    {tournament.registration_deadline}
                  </p>


                  <p>
                    <strong>Status:</strong>{" "}

                    <span
                      style={{
                        color: "green",
                        fontWeight: "bold"
                      }}
                    >
                      {tournament.status}
                    </span>

                  </p>


                  <p>
                    <strong>Rules:</strong>{" "}
                    {tournament.rules}
                  </p>

                </div>

              )
            )}

          </div>

        )}

    </div>

  );
}


export default ApprovedTournaments;