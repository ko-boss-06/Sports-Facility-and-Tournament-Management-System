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
  // GET TODAY DATE
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

      const availableFacilities = facilityList.filter(
        (facility) =>
          facility.availability_status === true &&
          facility.maintenance_status === "AVAILABLE"
      );

      setFacilities(availableFacilities);

      if (availableFacilities.length === 0) {
        setFacilityId("");
        setError(
          "No sports facilities are currently available."
        );
        return;
      }

      // Keep first facility selected
      setFacilityId(availableFacilities[0].id);

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

      setMyBookings(
        Array.isArray(data) ? data : []
      );

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
      const data = await getBookingAvailability(
        selectedFacilityId,
        date
      );

      setSlots(data.slots || []);

      /*
       * Backend may return active_booking_date.
       * If available, use it so frontend stays
       * synchronized with backend.
       */
      if (data.active_booking_date) {
        setBookingDate(
          data.active_booking_date
        );
      }

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
  // LOAD SLOTS AFTER FACILITY/DATE CHANGE
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

    setTeamName("");
    setCaptainName("");
    setTeamMembers([""]);

    setMessage("");
    setError("");
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
  // TEAM MEMBER RULES
  // =========================================================

  /*
   * These are frontend guidance/validation rules.
   *
   * Backend should also enforce the same rules.
   *
   * Count includes the captain.
   */

  const getTeamRule = (sport) => {
    if (!sport) {
      return {
        min: 1,
        max: 10,
        label: "1-10 members",
      };
    }

    const normalizedSport =
      sport.toLowerCase();

    if (
      normalizedSport.includes("football")
    ) {
      return {
        min: 7,
        max: 11,
        label: "7-11 members",
      };
    }

    if (
      normalizedSport.includes("cricket")
    ) {
      return {
        min: 6,
        max: 11,
        label: "6-11 members",
      };
    }

    if (
      normalizedSport.includes("basketball")
    ) {
      return {
        min: 5,
        max: 5,
        label: "5 members",
      };
    }

    if (
      normalizedSport.includes("volleyball")
    ) {
      return {
        min: 6,
        max: 6,
        label: "6 members",
      };
    }

    if (
      normalizedSport.includes("kabaddi")
    ) {
      return {
        min: 7,
        max: 7,
        label: "7 members",
      };
    }

    if (
      normalizedSport.includes("carrom")
    ) {
      return {
        min: 2,
        max: 4,
        label: "2-4 members",
      };
    }

    if (
      normalizedSport.includes("badminton")
    ) {
      return {
        min: 1,
        max: 2,
        label: "1-2 members",
      };
    }

    if (
      normalizedSport.includes("table tennis")
    ) {
      return {
        min: 1,
        max: 2,
        label: "1-2 members",
      };
    }

    if (
      normalizedSport.includes("tennis")
    ) {
      return {
        min: 1,
        max: 2,
        label: "1-2 members",
      };
    }

    if (
      normalizedSport.includes("hockey")
    ) {
      return {
        min: 7,
        max: 11,
        label: "7-11 members",
      };
    }

    return {
      min: 1,
      max: 10,
      label: "1-10 members",
    };
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

  const teamRule = getTeamRule(
    selectedFacility?.sport
  );

  // =========================================================
  // TEAM MEMBER CHANGE
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

  // =========================================================
  // ADD MEMBER
  // =========================================================

  const addTeamMember = () => {
    if (
      teamMembers.length >=
      teamRule.max
    ) {
      setError(
        `Maximum ${teamRule.max} members are allowed for ${selectedFacility?.sport}.`
      );
      return;
    }

    setTeamMembers([
      ...teamMembers,
      "",
    ]);

    setError("");
  };

  // =========================================================
  // REMOVE MEMBER
  // =========================================================

  const removeTeamMember = (index) => {
    if (teamMembers.length <= 1) {
      return;
    }

    const updatedMembers =
      teamMembers.filter(
        (_, memberIndex) =>
          memberIndex !== index
      );

    setTeamMembers(updatedMembers);

    setError("");
  };

  // =========================================================
  // BOOK SLOT
  // =========================================================

  const handleBooking = async () => {
    setError("");
    setMessage("");

    // -------------------------------------------------------
    // Basic validation
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // Team validation
    // -------------------------------------------------------

    if (!teamName.trim()) {
      setError(
        "Please enter the team name."
      );
      return;
    }

    if (!captainName.trim()) {
      setError(
        "Please enter the captain name."
      );
      return;
    }

    // Remove empty members
    const cleanedMembers =
      teamMembers
        .map((member) =>
          member.trim()
        )
        .filter(
          (member) =>
            member.length > 0
        );

    // Check member count
    if (
      cleanedMembers.length <
      teamRule.min
    ) {
      setError(
        `${selectedFacility?.sport} requires at least ${teamRule.min} team member(s).`
      );
      return;
    }

    if (
      cleanedMembers.length >
      teamRule.max
    ) {
      setError(
        `${selectedFacility?.sport} allows a maximum of ${teamRule.max} team members.`
      );
      return;
    }

    // -------------------------------------------------------
    // Captain must be part of team
    // -------------------------------------------------------

    const captainExists =
      cleanedMembers.some(
        (member) =>
          member.toLowerCase() ===
          captainName
            .trim()
            .toLowerCase()
      );

    if (!captainExists) {
      setError(
        "Captain name must be included in the team members."
      );
      return;
    }

    // -------------------------------------------------------
    // Prevent duplicate member names
    // -------------------------------------------------------

    const normalizedMembers =
      cleanedMembers.map(
        (member) =>
          member.toLowerCase()
      );

    const uniqueMembers =
      new Set(normalizedMembers);

    if (
      uniqueMembers.size !==
      normalizedMembers.length
    ) {
      setError(
        "The same team member cannot be entered more than once."
      );
      return;
    }

    // -------------------------------------------------------
    // Check whether student already has
    // a booking for this date
    // -------------------------------------------------------

    const alreadyBooked =
      myBookings.some(
        (booking) =>
          booking.booking_date ===
            bookingDate &&
          booking.status ===
            "CONFIRMED"
      );

    if (alreadyBooked) {
      setError(
        "You already have a confirmed facility booking for this day. You can book again tomorrow."
      );
      return;
    }

    // -------------------------------------------------------
    // Send booking
    // -------------------------------------------------------

    setBookingLoading(true);

    try {
      const booking =
        await createBooking(
          facilityId,
          bookingDate,
          selectedSlot,
          {
            team_name:
              teamName.trim(),

            captain_name:
              captainName.trim(),

            team_members:
              cleanedMembers,
          }
        );

      setMessage(
        `Booking successful! Booking ID: ${booking.id}`
      );

      // Clear selected slot
      setSelectedSlot("");

      // Clear team form
      setTeamName("");
      setCaptainName("");
      setTeamMembers([""]);

      // Refresh availability
      await loadAvailability(
        facilityId,
        bookingDate
      );

      // Refresh my bookings
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

  const handleCancelBooking =
    async (bookingId) => {
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

    const parts =
      date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

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

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
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
            Book one sports facility
            slot for today.
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

      {/* =====================================================
          BOOKING RULES
      ====================================================== */}

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
            Today's booking window
            opens at 10:00 PM on
            the previous day.
          </li>

          <li>
            Booking remains available
            until 10:00 PM today.
          </li>

          <li>
            Each slot is exactly
            1 hour.
          </li>

          <li>
            Booking hours are
            8:00 AM to 9:00 PM.
          </li>

          <li>
            One student can book
            only one slot per day.
          </li>

          <li>
            A team member cannot
            participate in another
            facility booking on the
            same day.
          </li>

          <li>
            The team size depends
            on the selected sport.
          </li>
        </ul>
      </div>

      {/* =====================================================
          FACILITY SELECTION
      ====================================================== */}

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
              No facilities are
              currently available
              for booking.
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
                    borderRadius:
                      "6px",
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
                      Sport:
                    </strong>{" "}
                    {
                      selectedFacility.sport
                    }
                  </p>

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

                  <p>
                    <strong>
                      Team Size:
                    </strong>{" "}
                    {teamRule.label}
                  </p>
                </div>
              )}
            </>
          )}
      </div>

      {/* =====================================================
          BOOKING DATE
      ====================================================== */}

      {facilityId && (
        <div
          style={{
            border:
              "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "25px",
          }}
        >
          <h2>
            Active Booking Date
          </h2>

          <div
            style={{
              padding: "15px",
              background:
                "#e7f3ff",
              borderRadius: "6px",
            }}
          >
            <strong>
              {formatDate(
                bookingDate
              )}
            </strong>
          </div>

          <p
            style={{
              fontSize: "14px",
              color: "#666",
            }}
          >
            Only the current
            active booking day
            can be booked.
          </p>
        </div>
      )}

      {/* =====================================================
          ERROR / SUCCESS
      ====================================================== */}

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

      {/* =====================================================
          AVAILABLE SLOTS
      ====================================================== */}

      {facilityId && (
        <div
          style={{
            border:
              "1px solid #ddd",
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
              Loading available
              slots...
            </p>
          )}

          {!loadingSlots &&
            slots.length === 0 &&
            !error && (
              <p>
                No slots available
                for this date.
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
                    padding:
                      "15px",
                    borderRadius:
                      "8px",
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
                marginTop:
                  "20px",
                padding:
                  "15px",
                borderRadius:
                  "6px",
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

      {/* =====================================================
          TEAM DETAILS
      ====================================================== */}

      {facilityId && (
        <div
          style={{
            border:
              "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
          }}
        >
          <h2>
            Team Details
          </h2>

          <p>
            Enter the details of
            everyone participating
            in this booking.
          </p>

          {/* Team Name */}

          <div
            style={{
              marginBottom:
                "20px",
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
              onChange={(event) =>
                setTeamName(
                  event.target.value
                )
              }
              placeholder="Enter team name"
              style={{
                width:
                  "100%",
                maxWidth:
                  "500px",
                padding:
                  "12px",
                marginTop:
                  "8px",
                border:
                  "1px solid #ccc",
                borderRadius:
                  "6px",
              }}
            />
          </div>

          {/* Captain */}

          <div
            style={{
              marginBottom:
                "20px",
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
              onChange={(event) =>
                setCaptainName(
                  event.target.value
                )
              }
              placeholder="Enter captain name"
              style={{
                width:
                  "100%",
                maxWidth:
                  "500px",
                padding:
                  "12px",
                marginTop:
                  "8px",
                border:
                  "1px solid #ccc",
                borderRadius:
                  "6px",
              }}
            />
          </div>

          {/* Team Members */}

          <div>
            <label>
              <strong>
                Team Members
              </strong>
            </label>

            <p
              style={{
                fontSize:
                  "14px",
                color:
                  "#666",
              }}
            >
              Required team size:
              {" "}
              <strong>
                {teamRule.label}
              </strong>
            </p>

            {teamMembers.map(
              (
                member,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    display:
                      "flex",
                    gap: "10px",
                    marginBottom:
                      "10px",
                    maxWidth:
                      "600px",
                  }}
                >
                  <input
                    type="text"
                    value={member}
                    onChange={(
                      event
                    ) =>
                      handleMemberChange(
                        index,
                        event
                          .target
                          .value
                      )
                    }
                    placeholder={`Member ${
                      index + 1
                    }`}
                    style={{
                      flex: 1,
                      padding:
                        "10px",
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
                        removeTeamMember(
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

            {teamMembers.length <
              teamRule.max && (
              <button
                type="button"
                onClick={
                  addTeamMember
                }
                style={{
                  marginTop:
                    "5px",
                }}
              >
                + Add Team Member
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          BOOK BUTTON
      ====================================================== */}

      {facilityId && (
        <div
          style={{
            marginBottom:
              "40px",
          }}
        >
          <button
            onClick={
              handleBooking
            }
            disabled={
              bookingLoading ||
              !selectedSlot
            }
            style={{
              padding:
                "14px 30px",
              fontSize:
                "16px",
              cursor:
                selectedSlot &&
                !bookingLoading
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {bookingLoading
              ? "Booking..."
              : "Confirm Booking"}
          </button>
        </div>
      )}

      {/* =====================================================
          MY BOOKINGS
      ====================================================== */}

      <div
        style={{
          border:
            "1px solid #ddd",
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
                width:
                  "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Facility</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
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
                        <td>
                          {
                            booking.id
                          }
                        </td>

                        <td>
                          {bookingFacility
                            ? bookingFacility.name
                            : `Facility #${booking.facility_id}`}
                        </td>

                        <td>
                          {formatDate(
                            booking.booking_date
                          )}
                        </td>

                        <td>
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

                        <td>
                          {
                            booking.status
                          }
                        </td>

                        <td>
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