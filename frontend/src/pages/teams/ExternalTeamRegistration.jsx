import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

function ExternalTeamRegistration() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [loadingTournament, setLoadingTournament] = useState(true);

  const [formData, setFormData] = useState({
    team_name: "",
    captain_name: "",
    captain_email: "",
    captain_phone: "",
    external_contact: "",
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

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoadingTournament(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/public/tournaments/${tournamentId}`
        );

        setTournament(response.data);
      } catch (err) {
        console.error(
          "Error loading tournament:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load tournament."
        );
      } finally {
        setLoadingTournament(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

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

    if (!formData.external_contact.trim()) {
      setError(
        "External organization/contact is required."
      );
      return;
    }

    for (const member of members) {
      if (!member.name.trim()) {
        setError(
          "Every team member must have a name."
        );
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

      const payload = {
        tournament_id: Number(tournamentId),

        team_name: formData.team_name.trim(),

        captain_name:
          formData.captain_name.trim(),

        captain_email:
          formData.captain_email.trim(),

        captain_phone:
          formData.captain_phone.trim(),

        external_contact:
          formData.external_contact.trim(),

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
        `${API_URL}/teams/external`,
        payload
      );

      setMessage(
        `Team "${response.data.team_name}" has been registered successfully and is waiting for PE approval.`
      );

      setFormData({
        team_name: "",
        captain_name: "",
        captain_email: "",
        captain_phone: "",
        external_contact: "",
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
        "Error registering external team:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to register the external team."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingTournament) {
    return (
      <div className="tournament-page">
        <div className="tournament-card">
          <p>Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="tournament-page">
        <div className="tournament-card">
          <div className="form-error">
            {error}
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate(
                `/public/tournaments/${tournamentId}`
              )
            }
          >
            Back to Tournament
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-page">
      <div className="tournament-card">

        <div className="tournament-header">
          <h1>External Team Registration</h1>

          <p>
            Register your team for:
          </p>

          <h2>
            {tournament?.name}
          </h2>

          <p>
            Sport: {tournament?.sport}
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

          <h2>Team Details</h2>

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

          <div className="form-group">
            <label htmlFor="external_contact">
              External Organization / Contact
            </label>

            <input
              id="external_contact"
              name="external_contact"
              type="text"
              value={formData.external_contact}
              onChange={handleChange}
              placeholder="Example: Coimbatore Sports Association"
            />
          </div>

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
                  <label>Name</label>

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
                  <label>Student ID</label>

                  <input
                    type="text"
                    value={member.student_id}
                    onChange={(event) =>
                      handleMemberChange(
                        index,
                        "student_id",
                        event.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

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
                    placeholder="Enter member email"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>

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
                  <label>Role</label>

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
                : "Register External Team"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(
                  `/public/tournaments/${tournamentId}`
                )
              }
            >
              Back to Tournament
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default ExternalTeamRegistration;