import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

import {
  getFacilities,
  createFacility,
  updateFacility,
  deactivateFacility
} from "../../api/facility";


function PEFacilityManagement() {

  const [facilities, setFacilities] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);


  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    name: "",
    facility_type: "",
    sport: "",
    location: "",
    capacity: "",
    description: ""
  });


  // =========================================================
  // LOAD FACILITIES
  // =========================================================

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
  // LOAD FACILITIES WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {

    loadFacilities();

  }, []);


  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
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
      description: ""
    });

    setEditingId(null);

  };


  // =========================================================
  // CREATE / UPDATE FACILITY
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setMessage("");
    setError("");


    try {

      const facilityData = {
        name: formData.name,
        facility_type: formData.facility_type,
        sport: formData.sport,
        location: formData.location,

        capacity:
          formData.capacity === ""
            ? null
            : Number(formData.capacity),

        description: formData.description
      };


      // -----------------------------------------------------
      // UPDATE
      // -----------------------------------------------------

      if (editingId !== null) {

        await updateFacility(
          editingId,
          facilityData
        );

        setMessage(
          "Facility updated successfully."
        );

      }

      // -----------------------------------------------------
      // CREATE
      // -----------------------------------------------------

      else {

        await createFacility(
          facilityData
        );

        setMessage(
          "Facility created successfully."
        );

      }


      resetForm();

      await loadFacilities();

    } catch (err) {

      console.error(
        "Error saving facility:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to save facility."
      );

    }

  };


  // =========================================================
  // EDIT FACILITY
  // =========================================================

  const handleEdit = (facility) => {

    setEditingId(facility.id);

    setFormData({
      name: facility.name || "",
      facility_type: facility.facility_type || "",
      sport: facility.sport || "",
      location: facility.location || "",
      capacity: facility.capacity ?? "",
      description: facility.description || ""
    });

    setMessage("");
    setError("");

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

      setMessage("");
      setError("");

      await deactivateFacility(
        facilityId
      );

      setMessage(
        "Facility deactivated successfully."
      );

      await loadFacilities();

    } catch (err) {

      console.error(
        "Error deactivating facility:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to deactivate facility."
      );

    }

  };


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <Layout>

      <div className="page-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="page-header">

          <div>

            <h1>
              Facility Management
            </h1>

            <p>
              Create, update, and manage sports facilities.
            </p>

          </div>

        </div>


        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (

          <div className="success-message">

            {message}

          </div>

        )}


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {/* =================================================
            ADD / UPDATE FACILITY
        ================================================= */}

        <div className="content-card">

          <h2>
            {editingId !== null
              ? "Update Facility"
              : "Add New Facility"}
          </h2>


          <form onSubmit={handleSubmit}>

            {/* Facility Name */}

            <div className="form-group">

              <label>
                Facility Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Main Basketball Court"
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
                placeholder="Example: Outdoor Court"
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
                placeholder="Example: College Sports Complex"
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
                placeholder="Example: 100"
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
                rows="4"
              />

            </div>


            {/* Submit Button */}

            <button
              type="submit"
              className="login-button"
            >

              {editingId !== null
                ? "Update Facility"
                : "Create Facility"}

            </button>


            {/* Cancel Edit */}

            {editingId !== null && (

              <button
                type="button"
                onClick={resetForm}
                style={{
                  marginLeft: "10px"
                }}
              >
                Cancel
              </button>

            )}

          </form>

        </div>


        {/* =================================================
            EXISTING FACILITIES
        ================================================= */}

        <div className="content-card">

          <h2>
            Existing Facilities
          </h2>


          {loading ? (

            <p>
              Loading facilities...
            </p>

          ) : facilities.length === 0 ? (

            <p>
              No facilities found.
            </p>

          ) : (

            <div>

              {facilities.map((facility) => (

                <div
                  key={facility.id}
                  className="content-card"
                  style={{
                    marginBottom: "15px"
                  }}
                >

                  <h3>
                    {facility.name}
                  </h3>


                  <p>
                    <strong>Facility Type:</strong>{" "}
                    {facility.facility_type}
                  </p>


                  <p>
                    <strong>Sport:</strong>{" "}
                    {facility.sport}
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
                    <strong>Description:</strong>{" "}
                    {facility.description ||
                      "No description"}
                  </p>


                  <p>
                    <strong>Availability:</strong>{" "}

                    {facility.availability_status
                      ? "Available"
                      : "Inactive"}

                  </p>


                  <p>
                    <strong>Maintenance:</strong>{" "}

                    {facility.maintenance_status}

                  </p>


                  {/* =================================================
                      ACTION BUTTONS
                  ================================================= */}

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
                        style={{
                          marginLeft: "10px"
                        }}
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