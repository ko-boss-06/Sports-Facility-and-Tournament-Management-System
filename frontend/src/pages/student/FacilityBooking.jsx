import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getBookingAvailability,
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../../api/booking";

import { getFacilities } from "../../api/facility";

function FacilityBooking() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityId] = useState("");

  const [bookingDate, setBookingDate] = useState("");

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [myBookings, setMyBookings] = useState([]);

  // Team details
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [teamMembers, setTeamMembers] = useState([""]);

  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // GET TODAY'S DATE
  // =========================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // LOAD FACILITIES
  // =========================================================

  const loadFacilities = async () => {
    try {
      setLoadingFacilities(true);
      setError("");

      const data = await getFacilities();

      const facilityList = Array.isArray(data)
        ? data
        : data.facilities || [];

      const availableFacilities =
        facilityList.filter(
          (facility) =>
            facility.availability_status === true &&
            facility.maintenance_status === "AVAILABLE"
        );

      setFacilities(availableFacilities);

      if (availableFacilities.length > 0) {
        setFacilityId(
          availableFacilities[0].id
        );
      } else {
        setFacilityId("");

        setError(
          "No sports facilities are currently available."
        );
      }
    } catch (err) {
      console.error(err);

      const detail =
        err.response?.data?.detail ||
        "Unable to load sports facilities.";

      setError(detail);
    } finally {
      setLoadingFacilities(false);
    }
  };

  // =========================================================
  // LOAD MY BOOKINGS
  // =========================================================

  const loadMyBookings = async () => {
    try {
      const data = await getMyBookings();

      setMyBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // LOAD AVAILABILITY
  // =========================================================

  const loadAvailability = async (
    selectedFacilityId,
    date
  ) => {
    if (!selectedFacilityId || !date) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setError("");
    setMessage("");
    setSelectedSlot("");

    try {
      const data =
        await getBookingAvailability(
          selectedFacilityId,
          date
        );

      setSlots(data.slots || []);
    } catch (err) {
      console.error(err);

      setSlots([]);

      const detail =
        err.response?.data?.detail ||
        "Unable to load booking slots.";

      setError(detail);
    } finally {
      setLoadingSlots(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const today = getTodayDate();

    setBookingDate(today);

    loadFacilities();
    loadMyBookings();
  }, []);

  // =========================================================
  // LOAD AVAILABILITY WHEN FACILITY CHANGES
  // =========================================================

  useEffect(() => {
    if (facilityId && bookingDate) {
      loadAvailability(
        facilityId,
        bookingDate
      );
    }
  }, [facilityId, bookingDate]);

  // =========================================================
  // FACILITY CHANGE
  // =========================================================

  const handleFacilityChange = (event) => {
    const selectedId = Number(
      event.target.value
    );

    setFacilityId(selectedId);
    setSelectedSlot("");
    setMessage("");
    setError("");

    // Clear team details when facility changes
    setTeamName("");
    setCaptainName("");
    setTeamMembers([""]);
  };

  // =========================================================
  // SLOT SELECT
  // =========================================================

  const handleSlotSelect = (slot) => {
    if (!slot.available) {
      return;
    }

    setSelectedSlot(slot.slot);

    setMessage("");
    setError("");
  };

  // =========================================================
  // TEAM MEMBER HANDLING
  // =========================================================

  const handleMemberChange = (
    index,
    value
  ) => {
    const updatedMembers = [
      ...teamMembers,
    ];

    updatedMembers[index] = value;

    setTeamMembers(updatedMembers);
  };

  const addMember = () => {
    setTeamMembers([
      ...teamMembers,
      "",
    ]);
  };

  const removeMember = (index) => {
    if (teamMembers.length === 1) {
      return;
    }

    const updatedMembers =
      teamMembers.filter(
        (_, memberIndex) =>
          memberIndex !== index
      );

    setTeamMembers(updatedMembers);
  };

  // =========================================================
  // DETERMINE TEAM SIZE
  // =========================================================

  const getRequiredTeamSize = () => {
    if (!selectedFacility) {
      return null;
    }

    const sport =
      selectedFacility.sport
        ?.toLowerCase()
        .trim();

    /*
      These are examples of normal team-size
      requirements.

      The backend should also validate these
      rules for security.
    */

const teamSizeRules = {
  football: 11,
  cricket: 11,
  basketball: 5,
  volleyball: 6,
  handball: 7,
  kabaddi: 7,
  hockey: 11,
  throwball: 7,
  kho_kho: 9,
  "kho-kho": 9,
  badminton: 2,
  tennis: 2,
  table_tennis: 2,
  "table tennis": 2,
  carrom: 4,
  chess: 1,
};

    return teamSizeRules[sport] || null;
  };

  // =========================================================
  // VALIDATE TEAM DETAILS
  // =========================================================

  const validateTeamDetails = () => {
    if (!teamName.trim()) {
      return "Please enter the team name.";
    }

    if (!captainName.trim()) {
      return "Please enter the captain name.";
    }

    const cleanedMembers =
      teamMembers
        .map((member) =>
          member.trim()
        )
        .filter(
          (member) => member.length > 0
        );

    if (cleanedMembers.length === 0) {
      return "Please enter at least one team member.";
    }

    // Captain should be included in team members
    const captainExists =
      cleanedMembers.some(
        (member) =>
          member.toLowerCase() ===
          captainName
            .trim()
            .toLowerCase()
      );

    if (!captainExists) {
      return (
        "Captain name must also be included " +
        "in the team members list."
      );
    }

    // Check duplicate members
    const normalizedMembers =
      cleanedMembers.map((member) =>
        member.toLowerCase()
      );

    const uniqueMembers =
      new Set(normalizedMembers);

    if (
      uniqueMembers.size !==
      normalizedMembers.length
    ) {
      return (
        "A team member cannot be added more than once."
      );
    }

    // Sport-specific size
    const requiredSize =
      getRequiredTeamSize();

    if (
      requiredSize !== null &&
      cleanedMembers.length !==
        requiredSize
    ) {
      return (
        `This sport requires exactly ${requiredSize} ` +
        `team member${
          requiredSize > 1 ? "s" : ""
        }. Currently entered: ${cleanedMembers.length}.`
      );
    }

    return null;
  };

  // =========================================================
  // BOOK SLOT
  // =========================================================

  const handleBooking = async () => {
    setError("");
    setMessage("");

    if (!facilityId) {
      setError(
        "Please select a sports facility."
      );
      return;
    }

    if (!bookingDate) {
      setError(
        "Booking date is required."
      );
      return;
    }

    if (!selectedSlot) {
      setError(
        "Please select an available slot."
      );
      return;
    }

    const validationError =
      validateTeamDetails();

    if (validationError) {
      setError(validationError);
      return;
    }

    const cleanedMembers =
      teamMembers
        .map((member) =>
          member.trim()
        )
        .filter(
          (member) => member.length > 0
        );

    setBookingLoading(true);

    try {
      const booking =
        await createBooking(
          facilityId,
          bookingDate,
          selectedSlot,
          teamName.trim(),
          captainName.trim(),
          cleanedMembers
        );

      setMessage(
        `Booking successful! Booking ID: ${booking.id}`
      );

      setSelectedSlot("");

      // Clear form
      setTeamName("");
      setCaptainName("");
      setTeamMembers([""]);

      await loadAvailability(
        facilityId,
        bookingDate
      );

      await loadMyBookings();
    } catch (err) {
      console.error(err);

      const detail =
        err.response?.data?.detail ||
        "Booking failed. Please try again.";

      setError(detail);
    } finally {
      setBookingLoading(false);
    }
  };

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancelBooking = async (
    bookingId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this booking?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await cancelBooking(
        bookingId,
        "Cancelled by student"
      );

      setMessage(
        "Booking cancelled successfully."
      );

      await loadAvailability(
        facilityId,
        bookingDate
      );

      await loadMyBookings();
    } catch (err) {
      console.error(err);

      const detail =
        err.response?.data?.detail ||
        "Unable to cancel booking.";

      setError(detail);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // =========================================================
  // SELECTED FACILITY
  // =========================================================

  const selectedFacility =
    facilities.find(
      (facility) =>
        Number(facility.id) ===
        Number(facilityId)
    );

  const requiredTeamSize =
    getRequiredTeamSize();

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px",
        }}
      >
        <div>
          <h1>
            Book Sports Facility
          </h1>

          <p>
            Book today's available sports
            facility slots.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              "/dashboard/student"
            )
          }
        >
          Back to Dashboard
        </button>
      </div>

      {/* ====================================================
          BOOKING RULES
      ==================================================== */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "25px",
          background: "#f8f9fa",
        }}
      >
        <h3>
          Booking Rules
        </h3>

        <ul>
          <li>
            Only today's booking slots are
            displayed.
          </li>

          <li>
            Today's booking opens at
            <strong> 10:00 PM on the previous day.</strong>
          </li>

          <li>
            Today's booking window remains
            active until 10:00 PM.
          </li>

          <li>
            After 10:00 PM, the system
            automatically refreshes to the
            next day's booking window.
          </li>

          <li>
            One student can make only one
            facility booking per day.
          </li>

          <li>
            A team member cannot participate
            in another facility booking on
            the same day.
          </li>

          <li>
            The team size depends on the
            selected sport.
          </li>

          <li>
            A booked slot cannot be booked
            again.
          </li>
        </ul>
      </div>

      {/* ====================================================
          FACILITY SELECTION
      ==================================================== */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "25px",
        }}
      >
        <h2>
          Select Sports Facility
        </h2>

        {loadingFacilities && (
          <p>
            Loading facilities...
          </p>
        )}

        {!loadingFacilities &&
          facilities.length === 0 && (
            <p>
              No facilities are currently
              available for booking.
            </p>
          )}

        {!loadingFacilities &&
          facilities.length > 0 && (
            <>
              <select
                value={facilityId}
                onChange={
                  handleFacilityChange
                }
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  padding: "12px",
                  fontSize: "16px",
                  borderRadius: "6px",
                  border:
                    "1px solid #ccc",
                }}
              >
                <option value="">
                  Select a facility
                </option>

                {facilities.map(
                  (facility) => (
                    <option
                      key={facility.id}
                      value={facility.id}
                    >
                      {facility.name} -{" "}
                      {facility.sport}
                    </option>
                  )
                )}
              </select>

              {selectedFacility && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    borderRadius: "6px",
                    background:
                      "#f8f9fa",
                  }}
                >
                  <h3>
                    {
                      selectedFacility.name
                    }
                  </h3>

                  <p>
                    <strong>
                      Type:
                    </strong>{" "}
                    {
                      selectedFacility.facility_type
                    }
                  </p>

                  <p>
                    <strong>
                      Sport:
                    </strong>{" "}
                    {
                      selectedFacility.sport
                    }
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {
                      selectedFacility.location
                    }
                  </p>

                  {selectedFacility.capacity && (
                    <p>
                      <strong>
                        Capacity:
                      </strong>{" "}
                      {
                        selectedFacility.capacity
                      }
                    </p>
                  )}

                  {requiredTeamSize !==
                    null && (
                    <p>
                      <strong>
                        Required Team Size:
                      </strong>{" "}
                      {
                        requiredTeamSize
                      }
                    </p>
                  )}

                  {selectedFacility.description && (
                    <p>
                      <strong>
                        Description:
                      </strong>{" "}
                      {
                        selectedFacility.description
                      }
                    </p>
                  )}
                </div>
              )}
            </>
          )}
      </div>

      {/* ====================================================
          BOOKING DATE
      ==================================================== */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "25px",
        }}
      >
        <h2>
          Booking Date
        </h2>

        <input
          type="date"
          value={bookingDate}
          min={getTodayDate()}
          max={getTodayDate()}
          readOnly
          style={{
            padding: "10px",
            fontSize: "16px",
          }}
        />

        <p>
          Today's booking date:{" "}
          <strong>
            {formatDate(
              bookingDate
            )}
          </strong>
        </p>

        <p
          style={{
            fontSize: "14px",
            color: "#666",
          }}
        >
          The booking date is automatically
          controlled by the booking window.
        </p>
      </div>

      {/* ====================================================
          MESSAGES
      ==================================================== */}

      {message && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "6px",
            background:
              "#d4edda",
            color: "#155724",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "6px",
            background:
              "#f8d7da",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      {/* ====================================================
          SLOTS
      ==================================================== */}

      {facilityId && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
          }}
        >
          <h2>
            Available Slots
          </h2>

          {loadingSlots && (
            <p>
              Loading available slots...
            </p>
          )}

          {!loadingSlots &&
            slots.length === 0 &&
            !error && (
              <p>
                No slots available.
              </p>
            )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            {slots.map(
              (slot) => (
                <button
                  key={slot.slot}
                  disabled={
                    !slot.available
                  }
                  onClick={() =>
                    handleSlotSelect(
                      slot
                    )
                  }
                  style={{
                    padding: "15px",
                    borderRadius: "8px",
                    border:
                      selectedSlot ===
                      slot.slot
                        ? "3px solid #000"
                        : "1px solid #ccc",
                    cursor:
                      slot.available
                        ? "pointer"
                        : "not-allowed",
                    opacity:
                      slot.available
                        ? 1
                        : 0.5,
                  }}
                >
                  <strong>
                    {slot.slot}
                  </strong>

                  <br />

                  {slot.available
                    ? "Available"
                    : "Booked"}
                </button>
              )
            )}
          </div>

          {selectedSlot && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "6px",
                background:
                  "#e7f3ff",
              }}
            >
              Selected Slot:{" "}
              <strong>
                {selectedSlot}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          TEAM DETAILS
      ==================================================== */}

      {selectedSlot && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
          }}
        >
          <h2>
            Team Details
          </h2>

          <p
            style={{
              color: "#666",
            }}
          >
            Enter the team information for
            this facility booking.
          </p>

          {/* Team Name */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label>
              <strong>
                Team Name
              </strong>
            </label>

            <br />

            <input
              type="text"
              value={teamName}
              onChange={(e) =>
                setTeamName(
                  e.target.value
                )
              }
              placeholder="Enter team name"
              style={{
                width: "100%",
                maxWidth: "600px",
                padding: "12px",
                marginTop: "8px",
                border:
                  "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Captain */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label>
              <strong>
                Captain Name
              </strong>
            </label>

            <br />

            <input
              type="text"
              value={captainName}
              onChange={(e) =>
                setCaptainName(
                  e.target.value
                )
              }
              placeholder="Enter captain name"
              style={{
                width: "100%",
                maxWidth: "600px",
                padding: "12px",
                marginTop: "8px",
                border:
                  "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Members */}

          <div>
            <label>
              <strong>
                Team Members
              </strong>
            </label>

            {requiredTeamSize !==
              null && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Required members for{" "}
                {
                  selectedFacility?.sport
                }
                :{" "}
                <strong>
                  {requiredTeamSize}
                </strong>
              </p>
            )}

            {teamMembers.map(
              (member, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom:
                      "10px",
                    maxWidth: "650px",
                  }}
                >
                  <input
                    type="text"
                    value={member}
                    onChange={(e) =>
                      handleMemberChange(
                        index,
                        e.target.value
                      )
                    }
                    placeholder={
                      index === 0
                        ? "Captain name"
                        : `Member ${
                            index + 1
                          }`
                    }
                    style={{
                      flex: 1,
                      padding: "12px",
                      border:
                        "1px solid #ccc",
                      borderRadius:
                        "6px",
                    }}
                  />

                  {teamMembers.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeMember(
                          index
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              )
            )}

            {(
              requiredTeamSize ===
                null ||
              teamMembers.length <
                requiredTeamSize
            ) && (
              <button
                type="button"
                onClick={
                  addMember
                }
              >
                + Add Team Member
              </button>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          BOOK BUTTON
      ==================================================== */}

      {selectedSlot && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <button
            onClick={
              handleBooking
            }
            disabled={
              bookingLoading ||
              !selectedSlot ||
              !facilityId
            }
            style={{
              padding:
                "14px 35px",
              fontSize: "16px",
              cursor:
                bookingLoading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {bookingLoading
              ? "Booking..."
              : "Confirm Facility Booking"}
          </button>
        </div>
      )}

      {/* ====================================================
          MY BOOKINGS
      ==================================================== */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <h2>
          My Bookings
        </h2>

        {myBookings.length ===
          0 && (
          <p>
            You don't have any
            bookings yet.
          </p>
        )}

        {myBookings.length >
          0 && (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border:
                        "1px solid #ddd",
                      padding:
                        "10px",
                    }}
                  >
                    Booking ID
                  </th>

                  <th
                    style={{
                      border:
                        "1px solid #ddd",
                      padding:
                        "10px",
                    }}
                  >
                    Facility
                  </th>

                  <th
                    style={{
                      border:
                        "1px solid #ddd",
                      padding:
                        "10px",
                    }}
                  >
                    Date
                  </th>

                  <th
                    style={{
                      border:
                        "1px solid #ddd",
                      padding:
                        "10px",
                    }}
                  >
                    Time
                  </th>

                  <th
                    style={{
                      border:
                        "1px solid #ddd",
                      padding:
                        "10px",
                    }}
                  >
                    Team
                  </th>

                  <th
                    style={{
                      border:
                        "1px solid #ddd",
                      padding:
                        "10px",
                    }}
                  >
                    Status
                  </th>

                  <th
                    style={{
                      border:
                        "1px solid #ddd",
                      padding:
                        "10px",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {myBookings.map(
                  (booking) => {
                    const bookingFacility =
                      facilities.find(
                        (
                          facility
                        ) =>
                          Number(
                            facility.id
                          ) ===
                          Number(
                            booking.facility_id
                          )
                      );

                    return (
                      <tr
                        key={
                          booking.id
                        }
                      >
                        <td
                          style={{
                            border:
                              "1px solid #ddd",
                            padding:
                              "10px",
                          }}
                        >
                          {
                            booking.id
                          }
                        </td>

                        <td
                          style={{
                            border:
                              "1px solid #ddd",
                            padding:
                              "10px",
                          }}
                        >
                          {bookingFacility
                            ? bookingFacility.name
                            : `Facility #${booking.facility_id}`}
                        </td>

                        <td
                          style={{
                            border:
                              "1px solid #ddd",
                            padding:
                              "10px",
                          }}
                        >
                          {formatDate(
                            booking.booking_date
                          )}
                        </td>

                        <td
                          style={{
                            border:
                              "1px solid #ddd",
                            padding:
                              "10px",
                          }}
                        >
                          {booking.start_time.substring(
                            0,
                            5
                          )}

                          {" - "}

                          {booking.end_time.substring(
                            0,
                            5
                          )}
                        </td>

                        <td
                          style={{
                            border:
                              "1px solid #ddd",
                            padding:
                              "10px",
                          }}
                        >
                          {booking.team_name ||
                            "-"}
                        </td>

                        <td
                          style={{
                            border:
                              "1px solid #ddd",
                            padding:
                              "10px",
                          }}
                        >
                          {
                            booking.status
                          }
                        </td>

                        <td
                          style={{
                            border:
                              "1px solid #ddd",
                            padding:
                              "10px",
                          }}
                        >
                          {booking.status ===
                            "CONFIRMED" && (
                            <button
                              onClick={() =>
                                handleCancelBooking(
                                  booking.id
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacilityBooking;