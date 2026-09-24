import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

import {
  getFacilities,
  createFacility,
  updateFacility,
  deactivateFacility
} from "../../api/facility";


function PEFacilityManagement() {

  // =========================================================
  // FACILITIES
  // =========================================================

  const [facilities, setFacilities] = useState([]);

  // =========================================================
  // FORM
  // =========================================================

  const [formData, setFormData] = useState({
    name: "",
    facility_type: "",
    sport: "",
    location: "",
    capacity: "",
    description: "",

    requires_team: false,
    requires_captain: false,
    min_team_members: "",
    max_team_members: ""
  });

  // =========================================================
  // EDIT MODE
  // =========================================================

  const [editingId, setEditingId] = useState(null);

  // =========================================================
  // MESSAGE
  // =========================================================

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  // =========================================================
  // LOAD FACILITIES
  // =========================================================

  useEffect(() => {
    loadFacilities();
  }, []);


  const loadFacilities = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getFacilities();

      setFacilities(data);

    } catch (err) {

      console.error("Error loading facilities:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to load facilities."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {

    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  };


  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {

    setFormData({
      name: "",
      facility_type: "",
      sport: "",
      location: "",
      capacity: "",
      description: "",

      requires_team: false,
      requires_captain: false,
      min_team_members: "",
      max_team_members: ""
    });

    setEditingId(null);
  };


  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setMessage("");
    setError("");

    try {

      setLoading(true);

      const data = {
        name: formData.name,
        facility_type: formData.facility_type,
        sport: formData.sport,
        location: formData.location,

        capacity:
          formData.capacity
            ? Number(formData.capacity)
            : null,

        description:
          formData.description || null,

        requires_team:
          formData.requires_team,

        requires_captain:
          formData.requires_captain,

        min_team_members:
          formData.min_team_members
            ? Number(formData.min_team_members)
            : null,

        max_team_members:
          formData.max_team_members
            ? Number(formData.max_team_members)
            : null
      };


      // =====================================================
      // UPDATE
      // =====================================================

      if (editingId) {

        await updateFacility(
          editingId,
          data
        );

        setMessage(
          "Facility updated successfully."
        );

      }

      // =====================================================
      // CREATE
      // =====================================================

      else {

        await createFacility(data);

        setMessage(
          "Facility created successfully."
        );

      }

      resetForm();

      await loadFacilities();

    } catch (err) {

      console.error(
        "Facility save error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to save facility."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // EDIT FACILITY
  // =========================================================

  const handleEdit = (facility) => {

    setEditingId(facility.id);

    setFormData({
      name: facility.name || "",

      facility_type:
        facility.facility_type || "",

      sport:
        facility.sport || "",

      location:
        facility.location || "",

      capacity:
        facility.capacity || "",

      description:
        facility.description || "",

      requires_team:
        facility.requires_team || false,

      requires_captain:
        facility.requires_captain || false,

      min_team_members:
        facility.min_team_members || "",

      max_team_members:
        facility.max_team_members || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // =========================================================
  // DEACTIVATE FACILITY
  // =========================================================

  const handleDeactivate = async (facilityId) => {

    const confirmed = window.confirm(
      "Are you sure you want to deactivate this facility?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setLoading(true);

      setMessage("");
      setError("");

      await deactivateFacility(facilityId);

      setMessage(
        "Facility deactivated successfully."
      );

      await loadFacilities();

    } catch (err) {

      console.error(
        "Deactivate facility error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to deactivate facility."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // PAGE UI
  // =========================================================

  return (
    <Layout>

      <div className="page-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="page-header">

          <div>

            <h1>
              Facility Management
            </h1>

            <p>
              Create, update and manage sports facilities.
            </p>

          </div>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* =================================================
            FACILITY FORM
        ================================================= */}

        <div className="content-card">

          <h2>
            {editingId
              ? "Update Facility"
              : "Add New Facility"}
          </h2>


          <form onSubmit={handleSubmit}>

            {/* Name */}

            <div className="form-group">

              <label>
                Facility Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter facility name"
                required
              />

            </div>


            {/* Facility Type */}

            <div className="form-group">

              <label>
                Facility Type
              </label>

              <input
                type="text"
                name="facility_type"
                value={formData.facility_type}
                onChange={handleChange}
                placeholder="Example: Basketball Court"
                required
              />

            </div>


            {/* Sport */}

            <div className="form-group">

              <label>
                Sport
              </label>

              <input
                type="text"
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                placeholder="Example: Basketball"
                required
              />

            </div>


            {/* Location */}

            <div className="form-group">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter facility location"
                required
              />

            </div>


            {/* Capacity */}

            <div className="form-group">

              <label>
                Capacity
              </label>

              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Enter capacity"
                min="1"
              />

            </div>


            {/* Description */}

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter facility description"
                rows="3"
              />

            </div>


            {/* =================================================
                TEAM REQUIREMENTS
            ================================================= */}

            <h3>
              Team Requirements
            </h3>


            <div className="form-group">

              <label>

                <input
                  type="checkbox"
                  name="requires_team"
                  checked={formData.requires_team}
                  onChange={handleChange}
                />

                {" "}
                Requires Team Registration

              </label>

            </div>


            <div className="form-group">

              <label>

                <input
                  type="checkbox"
                  name="requires_captain"
                  checked={formData.requires_captain}
                  onChange={handleChange}
                />

                {" "}
                Requires Team Captain

              </label>

            </div>


            {/* Minimum Team Members */}

            <div className="form-group">

              <label>
                Minimum Team Members
              </label>

              <input
                type="number"
                name="min_team_members"
                value={formData.min_team_members}
                onChange={handleChange}
                placeholder="Example: 5"
                min="1"
              />

            </div>


            {/* Maximum Team Members */}

            <div className="form-group">

              <label>
                Maximum Team Members
              </label>

              <input
                type="number"
                name="max_team_members"
                value={formData.max_team_members}
                onChange={handleChange}
                placeholder="Example: 12"
                min="1"
              />

            </div>


            {/* =================================================
                BUTTONS
            ================================================= */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Saving..."
                : editingId
                  ? "Update Facility"
                  : "Create Facility"}

            </button>


            {editingId && (

              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

            )}

          </form>

        </div>


        {/* =================================================
            FACILITY LIST
        ================================================= */}

        <div className="content-card">

          <h2>
            Existing Facilities
          </h2>


          {loading && facilities.length === 0 ? (

            <p>
              Loading facilities...
            </p>

          ) : facilities.length === 0 ? (

            <p>
              No facilities available.
            </p>

          ) : (

            <div className="dashboard-grid">

              {facilities.map((facility) => (

                <div
                  key={facility.id}
                  className="dashboard-action-card"
                >

                  <h3>
                    {facility.name}
                  </h3>

                  <p>
                    <strong>Sport:</strong>{" "}
                    {facility.sport}
                  </p>

                  <p>
                    <strong>Type:</strong>{" "}
                    {facility.facility_type}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {facility.location}
                  </p>

                  <p>
                    <strong>Capacity:</strong>{" "}
                    {facility.capacity || "Not specified"}
                  </p>

                  <p>
                    <strong>Availability:</strong>{" "}

                    {facility.availability_status
                      ? "Available"
                      : "Unavailable"}

                  </p>

                  <p>
                    <strong>Maintenance:</strong>{" "}
                    {facility.maintenance_status}
                  </p>


                  {/* Team Information */}

                  {facility.requires_team && (

                    <p>
                      <strong>Team:</strong>{" "}
                      Required
                    </p>

                  )}


                  {facility.requires_captain && (

                    <p>
                      <strong>Captain:</strong>{" "}
                      Required
                    </p>

                  )}


                  {/* Buttons */}

                  <div>

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(facility)
                      }
                    >
                      Edit
                    </button>


                    {facility.availability_status && (

                      <button
                        type="button"
                        onClick={() =>
                          handleDeactivate(
                            facility.id
                          )
                        }
                      >
                        Deactivate
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </Layout>
  );
}


export default PEFacilityManagement;