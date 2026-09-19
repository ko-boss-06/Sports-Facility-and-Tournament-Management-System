import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/v1";

function InternalTeamRegistration() {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  const [formData, setFormData] = useState({
    tournament_id: "",
    team_name: "",
    captain_name: "",
    captain_email: "",
    captain_phone: "",
  });

  const [members, setMembers] = useState([
    {
      name: "",
      student_id: "",
      email: "",
      phone: "",
      role: "Captain",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ---------------------------------------------------------
  // Load approved tournaments
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoadingTournaments(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/public/tournaments`
        );

        setTournaments(response.data);
      } catch (err) {
        console.error(
          "Error loading tournaments:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load approved tournaments."
        );
      } finally {
        setLoadingTournaments(false);
      }
    };

    fetchTournaments();
  }, []);

  // ---------------------------------------------------------
  // Handle normal input changes
  // ---------------------------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // Handle member changes
  // ---------------------------------------------------------
  const handleMemberChange = (
    index,
    field,
    value
  ) => {
    setMembers((previous) =>
      previous.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              [field]: value,
            }
          : member
      )
    );
  };

  // ---------------------------------------------------------
  // Add team member
  // ---------------------------------------------------------
  const addMember = () => {
    setMembers((previous) => [
      ...previous,
      {
        name: "",
        student_id: "",
        email: "",
        phone: "",
        role: "Player",
      },
    ]);
  };

  // ---------------------------------------------------------
  // Remove team member
  // ---------------------------------------------------------
  const removeMember = (index) => {
    if (members.length === 1) {
      return;
    }

    setMembers((previous) =>
      previous.filter(
        (_, memberIndex) => memberIndex !== index
      )
    );
  };

  // ---------------------------------------------------------
  // Submit registration
  // ---------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.tournament_id) {
      setError("Please select a tournament.");
      return;
    }

    if (!formData.team_name.trim()) {
      setError("Team name is required.");
      return;
    }

    if (!formData.captain_name.trim()) {
      setError("Captain name is required.");
      return;
    }

    if (!formData.captain_email.trim()) {
      setError("Captain email is required.");
      return;
    }

    if (!formData.captain_phone.trim()) {
      setError("Captain phone number is required.");
      return;
    }

    for (const member of members) {
      if (!member.name.trim()) {
        setError("Every team member must have a name.");
        return;
      }

      if (!member.email.trim()) {
        setError(
          "Every team member must have an email."
        );
        return;
      }

      if (!member.role.trim()) {
        setError(
          "Every team member must have a role."
        );
        return;
      }
    }

    try {
      setLoading(true);

      const token = localStorage.getItem(
        "access_token"
      );

      if (!token) {
        navigate("/");
        return;
      }

      const payload = {
        tournament_id: Number(
          formData.tournament_id
        ),
        team_name: formData.team_name.trim(),
        captain_name: formData.captain_name.trim(),
        captain_email:
          formData.captain_email.trim(),
        captain_phone:
          formData.captain_phone.trim(),
        members: members.map((member) => ({
          name: member.name.trim(),
          student_id:
            member.student_id.trim() || null,
          email: member.email.trim(),
          phone:
            member.phone.trim() || null,
          role: member.role.trim(),
        })),
      };

      const response = await axios.post(
        `${API_URL}/teams/internal`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Team "${response.data.team_name}" has been registered successfully and is waiting for PE approval.`
      );

      setFormData({
        tournament_id: "",
        team_name: "",
        captain_name: "",
        captain_email: "",
        captain_phone: "",
      });

      setMembers([
        {
          name: "",
          student_id: "",
          email: "",
          phone: "",
          role: "Captain",
        },
      ]);
    } catch (err) {
      console.error(
        "Error registering team:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Only Internal Students can register a team."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to register the team."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tournament-page">
      <div className="tournament-card">

        <div className="tournament-header">
          <h1>Register Your Team</h1>

          <p>
            Register a team for an approved
            tournament. Your registration will be
            reviewed by the PE.
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

        <form onSubmit={handleSubmit}>

          {/* Tournament */}
          <div className="form-group">
            <label htmlFor="tournament_id">
              Select Tournament
            </label>

            {loadingTournaments ? (
              <p>Loading tournaments...</p>
            ) : (
              <select
                id="tournament_id"
                name="tournament_id"
                value={formData.tournament_id}
                onChange={handleChange}
              >
                <option value="">
                  -- Select Tournament --
                </option>

                {tournaments.map(
                  (tournament) => (
                    <option
                      key={tournament.id}
                      value={tournament.id}
                    >
                      {tournament.name} (
                      {tournament.sport})
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          {/* Team Name */}
          <div className="form-group">
            <label htmlFor="team_name">
              Team Name
            </label>

            <input
              id="team_name"
              name="team_name"
              type="text"
              value={formData.team_name}
              onChange={handleChange}
              placeholder="Enter team name"
            />
          </div>

          {/* Captain */}
          <h2>Captain Details</h2>

          <div className="form-group">
            <label htmlFor="captain_name">
              Captain Name
            </label>

            <input
              id="captain_name"
              name="captain_name"
              type="text"
              value={formData.captain_name}
              onChange={handleChange}
              placeholder="Enter captain name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="captain_email">
              Captain Email
            </label>

            <input
              id="captain_email"
              name="captain_email"
              type="email"
              value={formData.captain_email}
              onChange={handleChange}
              placeholder="Enter captain email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="captain_phone">
              Captain Phone
            </label>

            <input
              id="captain_phone"
              name="captain_phone"
              type="tel"
              value={formData.captain_phone}
              onChange={handleChange}
              placeholder="Enter captain phone"
            />
          </div>

          {/* Team Members */}
          <div className="members-header">
            <h2>Team Members</h2>

            <button
              type="button"
              className="secondary-button"
              onClick={addMember}
            >
              + Add Member
            </button>
          </div>

          {members.map(
            (member, index) => (
              <div
                className="member-card"
                key={index}
              >
                <h3>
                  Member {index + 1}
                </h3>

                <div className="form-group">
                  <label>
                    Name
                  </label>

                  <input
                    type="text"
                    value={member.name}
                    onChange={(event) =>
                      handleMemberChange(
                        index,
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Enter member name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Student ID
                  </label>

                  <input
                    type="text"
                    value={
                      member.student_id
                    }
                    onChange={(event) =>
                      handleMemberChange(
                        index,
                        "student_id",
                        event.target.value
                      )
                    }
                    placeholder="Enter student ID"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    value={member.email}
                    onChange={(event) =>
                      handleMemberChange(
                        index,
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="Enter email"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={member.phone}
                    onChange={(event) =>
                      handleMemberChange(
                        index,
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Role
                  </label>

                  <select
                    value={member.role}
                    onChange={(event) =>
                      handleMemberChange(
                        index,
                        "role",
                        event.target.value
                      )
                    }
                  >
                    <option value="Captain">
                      Captain
                    </option>

                    <option value="Player">
                      Player
                    </option>

                    <option value="Vice Captain">
                      Vice Captain
                    </option>
                  </select>
                </div>

                {members.length > 1 && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      removeMember(index)
                    }
                  >
                    Remove Member
                  </button>
                )}
              </div>
            )
          )}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Registering..."
                : "Register Team"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate("/dashboard/student")
              }
            >
              Back to Dashboard
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default InternalTeamRegistration;