import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getBookingAvailability,
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingErrorMessage,
} from "../../api/booking";

import { getFacilities } from "../../api/facility";


function FacilityBooking() {

  const navigate = useNavigate();


  // =========================================================
  // STUDENT DETAILS
  // =========================================================

  const [student, setStudent] =
    useState({});


  // =========================================================
  // FACILITY
  // =========================================================

  const [facilities, setFacilities] =
    useState([]);

  const [facilityId, setFacilityId] =
    useState("");

  const [selectedFacility, setSelectedFacility] =
    useState(null);


  // =========================================================
  // DATE
  // =========================================================

  const [bookingDate, setBookingDate] =
    useState("");


  // =========================================================
  // SLOTS
  // =========================================================

  const [slots, setSlots] =
    useState([]);

  const [selectedSlot, setSelectedSlot] =
    useState("");


  // =========================================================
  // TEAM DETAILS
  // =========================================================

  const [teamName, setTeamName] =
    useState("");

  const [captainName, setCaptainName] =
    useState("");

  const [teamMembers, setTeamMembers] =
    useState([""]);


  // =========================================================
  // BOOKINGS
  // =========================================================

  const [myBookings, setMyBookings] =
    useState([]);


  // =========================================================
  // LOADING
  // =========================================================

  const [loadingFacilities, setLoadingFacilities] =
    useState(false);

  const [loadingSlots, setLoadingSlots] =
    useState(false);

  const [bookingLoading, setBookingLoading] =
    useState(false);


  // =========================================================
  // MESSAGES
  // =========================================================

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // =========================================================
  // CONFIRMATION
  // =========================================================

  const [showConfirmation, setShowConfirmation] =
    useState(false);


  // =========================================================
  // GET TODAY DATE - INDIA
  // =========================================================

  const getTodayDate = () => {

    const now = new Date();

    return new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(now);
  };


  // =========================================================
  // LOAD STUDENT FROM LOGIN
  // =========================================================

  const loadStudentDetails = () => {

    try {

      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        return;
      }

      const parsedUser =
        JSON.parse(savedUser);

      setStudent(parsedUser);

    } catch (err) {

      console.error(
        "Unable to load student details:",
        err
      );

    }
  };


  // =========================================================
  // LOAD FACILITIES
  // =========================================================

  const loadFacilities = async () => {

    try {

      setLoadingFacilities(true);
      setError("");

      const data =
        await getFacilities();

      const facilityList =
        Array.isArray(data)
          ? data
          : data?.facilities || [];

      const availableFacilities =
        facilityList.filter(
          (facility) =>
            facility.availability_status === true &&
            facility.maintenance_status ===
              "AVAILABLE"
        );

      setFacilities(
        availableFacilities
      );

      if (
        availableFacilities.length > 0
      ) {

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

      console.error(
        "Facility loading error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load sports facilities."
      );

    } finally {

      setLoadingFacilities(false);

    }
  };


  // =========================================================
  // LOAD MY BOOKINGS
  // =========================================================

  const loadMyBookings = async () => {

    try {

      const data =
        await getMyBookings();

      setMyBookings(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Unable to load bookings:",
        err
      );

    }
  };


  // =========================================================
  // LOAD AVAILABILITY
  // =========================================================

  const loadAvailability = async (
    selectedFacilityId,
    date
  ) => {

    if (
      !selectedFacilityId ||
      !date
    ) {

      setSlots([]);

      return;
    }

    setLoadingSlots(true);

    setSelectedSlot("");

    try {

      const data =
        await getBookingAvailability(
          selectedFacilityId,
          date
        );

      setSlots(
        Array.isArray(data?.slots)
          ? data.slots
          : []
      );

      setError("");

    } catch (err) {

      console.error(
        "Availability error:",
        err
      );

      setSlots([]);

      setError(
        getBookingErrorMessage(err)
      );

    } finally {

      setLoadingSlots(false);

    }
  };


  // =========================================================
  // INITIAL PAGE LOAD
  // =========================================================

  useEffect(() => {

    const today =
      getTodayDate();

    setBookingDate(today);

    loadStudentDetails();

    loadFacilities();

    loadMyBookings();

  }, []);


  // =========================================================
  // SELECTED FACILITY
  // =========================================================

  useEffect(() => {

    const facility =
      facilities.find(
        (item) =>
          Number(item.id) ===
          Number(facilityId)
      );

    setSelectedFacility(
      facility || null
    );

  }, [
    facilities,
    facilityId
  ]);


  // =========================================================
  // LOAD SLOTS
  // =========================================================

  useEffect(() => {

    if (
      facilityId &&
      bookingDate
    ) {

      loadAvailability(
        facilityId,
        bookingDate
      );

    }

  }, [
    facilityId,
    bookingDate
  ]);


  // =========================================================
  // FACILITY CHANGE
  // =========================================================

  const handleFacilityChange = (
    event
  ) => {

    const selectedId =
      Number(event.target.value);

    setFacilityId(
      selectedId
    );

    setSelectedSlot("");

    setMessage("");

    setError("");

    setShowConfirmation(false);

    setTeamName("");

    setCaptainName("");

    setTeamMembers([""]);

  };


  // =========================================================
  // SLOT SELECT
  // =========================================================

  const handleSlotSelect = (
    slot
  ) => {

    if (!slot?.available) {
      return;
    }

    setSelectedSlot(
      slot.slot
    );

    setMessage("");

    setError("");

    setShowConfirmation(false);

  };


  // =========================================================
  // TEAM MEMBER CHANGE
  // =========================================================

  const handleMemberChange = (
    index,
    value
  ) => {

    const updated =
      [...teamMembers];

    updated[index] =
      value;

    setTeamMembers(
      updated
    );

  };


  // =========================================================
  // ADD TEAM MEMBER
  // =========================================================

  const addMember = () => {

    const max =
      Number(
        selectedFacility?.max_team_members
      );

    if (
      max &&
      teamMembers.length >= max
    ) {

      setError(
        `Maximum ${max} team members are allowed.`
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
  // REMOVE TEAM MEMBER
  // =========================================================

  const removeMember = (
    index
  ) => {

    if (
      teamMembers.length === 1
    ) {

      return;
    }

    setTeamMembers(
      teamMembers.filter(
        (_, i) =>
          i !== index
      )
    );

  };


  // =========================================================
  // CLEAN MEMBERS
  // =========================================================

  const getCleanMembers = () => {

    return teamMembers
      .map(
        (member) =>
          String(member).trim()
      )
      .filter(Boolean);

  };


  // =========================================================
  // VALIDATE DETAILS
  // =========================================================

  const validateBookingDetails = () => {

    if (!facilityId) {

      return "Please select a sports facility.";

    }


    if (!bookingDate) {

      return "Booking date is required.";

    }


    if (!selectedSlot) {

      return "Please select an available time slot.";

    }


    // -----------------------------------------
    // Team validation
    // -----------------------------------------

    const requiresTeam =
      selectedFacility?.requires_team !== false;


    if (!requiresTeam) {

      return null;

    }


    if (!teamName.trim()) {

      return "Please enter the team name.";

    }


    const members =
      getCleanMembers();


    if (members.length === 0) {

      return "Please enter at least one team member.";

    }


    // -----------------------------------------
    // Captain validation
    // -----------------------------------------

    const requiresCaptain =
      selectedFacility?.requires_captain !== false;


    if (
      requiresCaptain &&
      !captainName.trim()
    ) {

      return "Please enter the captain name.";

    }


    if (
      requiresCaptain
    ) {

      const captainExists =
        members.some(
          (member) =>
            member.toLowerCase() ===
            captainName
              .trim()
              .toLowerCase()
        );

      if (!captainExists) {

        return (
          "Captain must also be included in the team members list."
        );

      }

    }


    // -----------------------------------------
    // Duplicate members
    // -----------------------------------------

    const normalized =
      members.map(
        (member) =>
          member.toLowerCase()
      );

    const unique =
      new Set(normalized);

    if (
      unique.size !==
      normalized.length
    ) {

      return (
        "The same team member cannot be added more than once."
      );

    }


    // -----------------------------------------
    // Facility min/max
    // -----------------------------------------

    const min =
      Number(
        selectedFacility?.min_team_members
      );

    const max =
      Number(
        selectedFacility?.max_team_members
      );


    if (
      min &&
      members.length < min
    ) {

      return (
        `This facility requires at least ${min} team members.`
      );

    }


    if (
      max &&
      members.length > max
    ) {

      return (
        `This facility allows a maximum of ${max} team members.`
      );

    }


    return null;

  };


  // =========================================================
  // OPEN CONFIRMATION
  // =========================================================

  const handleOpenConfirmation = () => {

    setError("");

    setMessage("");


    const validationError =
      validateBookingDetails();


    if (validationError) {

      setError(
        validationError
      );

      return;

    }


    setShowConfirmation(
      true
    );

  };


  // =========================================================
  // FINAL BOOKING
  // =========================================================

  const handleConfirmBooking = async () => {

    setError("");

    setMessage("");

    setBookingLoading(true);


    try {

      const members =
        getCleanMembers();


      const booking =
        await createBooking(
          facilityId,
          bookingDate,
          selectedSlot,
          teamName.trim(),
          captainName.trim(),
          members
        );


      // -----------------------------------------
      // SUCCESS
      // -----------------------------------------

      const bookingId =
        booking?.id;


      setShowConfirmation(
        false
      );


      setMessage(
        bookingId
          ? `Booking successful! Your Booking ID is ${bookingId}.`
          : "Booking successful!"
      );


      setSelectedSlot("");

      setTeamName("");

      setCaptainName("");

      setTeamMembers([
        ""
      ]);


      // Refresh slots

      await loadAvailability(
        facilityId,
        bookingDate
      );


      // Refresh bookings

      await loadMyBookings();


    } catch (err) {

      console.error(
        "Booking error:",
        err
      );


      // IMPORTANT:
      // Always convert FastAPI
      // error objects into text.

      setError(
        getBookingErrorMessage(
          err
        )
      );


      setShowConfirmation(
        false
      );

    } finally {

      setBookingLoading(
        false
      );

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

      console.error(
        "Cancel booking error:",
        err
      );


      setError(
        getBookingErrorMessage(
          err
        )
      );

    }

  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "";
    }


    const parts =
      String(date).split("-");


    if (
      parts.length !== 3
    ) {

      return date;

    }


    return (
      `${parts[2]}-${parts[1]}-${parts[0]}`
    );

  };


  // =========================================================
  // FORMAT STUDENT NAME
  // =========================================================

  const studentName =
    student?.name ||
    student?.username ||
    "Student";


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div
      style={{
        maxWidth: "1050px",
        margin: "30px auto",
        padding: "20px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "25px",
        }}
      >

        <div>

          <h1>
            Book Sports Facility
          </h1>

          <p>
            Select a facility, choose
            an available slot and enter
            your booking details.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard/student"
            )
          }
          style={{
            padding:
              "10px 18px",
            borderRadius: "6px",
            border:
              "1px solid #ccc",
            background:
              "#fff",
            cursor:
              "pointer",
          }}
        >
          Back to Dashboard
        </button>

      </div>


      {/* =====================================================
          STUDENT DETAILS
      ===================================================== */}

      <div
        style={{
          border:
            "1px solid #dbeafe",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "25px",
          background:
            "#eff6ff",
        }}
      >

        <h2>
          Student Details
        </h2>

        <p>
          <strong>
            Name:
          </strong>{" "}
          {studentName}
        </p>

        <p>
          <strong>
            Username:
          </strong>{" "}
          {student?.username ||
            "-"}
        </p>

        <p>
          <strong>
            Email:
          </strong>{" "}
          {student?.email ||
            "-"}
        </p>

        <p>
          <strong>
            Role:
          </strong>{" "}
          {student?.role ||
            "INTERNAL_STUDENT"}
        </p>

      </div>


      {/* =====================================================
          BOOKING RULES
      ===================================================== */}

      <div
        style={{
          border:
            "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "25px",
          background:
            "#f8f9fa",
        }}
      >

        <h2>
          Booking Rules
        </h2>

        <ul>

          <li>
            Booking date is controlled
            by the booking window.
          </li>

          <li>
            Booking slots are one hour.
          </li>

          <li>
            Facility availability is
            checked before booking.
          </li>

          <li>
            A student can have only
            one confirmed facility
            booking per day.
          </li>

          <li>
            A team member cannot
            participate in another
            facility booking on the
            same day.
          </li>

          <li>
            A booked slot cannot be
            booked again.
          </li>

        </ul>

      </div>


      {/* =====================================================
          FACILITY
      ===================================================== */}

      <div
        style={{
          border:
            "1px solid #ddd",
          borderRadius: "10px",
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
              currently available.
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
                maxWidth: "600px",
                padding: "12px",
                fontSize: "16px",
                borderRadius: "6px",
                border:
                  "1px solid #ccc",
              }}
            >

              <option value="">
                Select facility
              </option>


              {facilities.map(
                (facility) => (

                  <option
                    key={
                      facility.id
                    }
                    value={
                      facility.id
                    }
                  >

                    {facility.name}
                    {" - "}
                    {facility.sport}

                  </option>

                )
              )}

            </select>


            {selectedFacility && (

              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "8px",
                  background:
                    "#f8fafc",
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
                    selectedFacility.sport ||
                    "-"
                  }
                </p>


                <p>
                  <strong>
                    Type:
                  </strong>{" "}
                  {
                    selectedFacility.facility_type ||
                    "-"
                  }
                </p>


                <p>
                  <strong>
                    Location:
                  </strong>{" "}
                  {
                    selectedFacility.location ||
                    "-"
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


                {selectedFacility.requires_team !==
                  undefined && (

                  <p>
                    <strong>
                      Team Required:
                    </strong>{" "}
                    {
                      selectedFacility.requires_team
                        ? "Yes"
                        : "No"
                    }
                  </p>

                )}


                {selectedFacility.min_team_members !==
                  undefined && (

                  <p>
                    <strong>
                      Minimum Team Members:
                    </strong>{" "}
                    {
                      selectedFacility.min_team_members
                    }
                  </p>

                )}


                {selectedFacility.max_team_members !==
                  undefined && (

                  <p>
                    <strong>
                      Maximum Team Members:
                    </strong>{" "}
                    {
                      selectedFacility.max_team_members
                    }
                  </p>

                )}

              </div>

            )}

          </>

        )}

      </div>


      {/* =====================================================
          DATE
      ===================================================== */}

      <div
        style={{
          border:
            "1px solid #ddd",
          borderRadius: "10px",
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
          readOnly
          style={{
            padding:
              "10px",
            fontSize:
              "16px",
          }}
        />

        <p>
          Selected date:{" "}
          <strong>
            {formatDate(
              bookingDate
            )}
          </strong>
        </p>

      </div>


      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (

        <div
          style={{
            padding:
              "15px",
            marginBottom:
              "20px",
            borderRadius:
              "8px",
            background:
              "#dcfce7",
            color:
              "#166534",
            border:
              "1px solid #86efac",
          }}
        >

          {message}

        </div>

      )}


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div
          style={{
            padding:
              "15px",
            marginBottom:
              "20px",
            borderRadius:
              "8px",
            background:
              "#fee2e2",
            color:
              "#991b1b",
            border:
              "1px solid #fca5a5",
          }}
        >

          <strong>
            Booking Error:
          </strong>

          <div
            style={{
              marginTop:
                "5px",
            }}
          >
            {String(error)}
          </div>

        </div>

      )}


      {/* =====================================================
          SLOTS
      ===================================================== */}

      {facilityId && (

        <div
          style={{
            border:
              "1px solid #ddd",
            borderRadius:
              "10px",
            padding:
              "20px",
            marginBottom:
              "25px",
          }}
        >

          <h2>
            Available Time Slots
          </h2>


          {loadingSlots && (

            <p>
              Loading slots...
            </p>

          )}


          {!loadingSlots &&
            slots.length === 0 &&
            !error && (

            <p>
              No slots are currently
              available.
            </p>

          )}


          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap:
                "15px",
              marginTop:
                "20px",
            }}
          >

            {slots.map(
              (slot) => {

                const available =
                  slot?.available === true;


                return (

                  <button
                    key={
                      slot.slot
                    }
                    type="button"
                    disabled={
                      !available
                    }
                    onClick={() =>
                      handleSlotSelect(
                        slot
                      )
                    }
                    style={{
                      padding:
                        "20px",
                      borderRadius:
                        "8px",
                      border:
                        selectedSlot ===
                        slot.slot
                          ? "3px solid #2563eb"
                          : available
                          ? "1px solid #86efac"
                          : "1px solid #fca5a5",
                      background:
                        selectedSlot ===
                        slot.slot
                          ? "#dbeafe"
                          : available
                          ? "#f0fdf4"
                          : "#fee2e2",
                      cursor:
                        available
                          ? "pointer"
                          : "not-allowed",
                      color:
                        available
                          ? "#166534"
                          : "#991b1b",
                      fontSize:
                        "16px",
                    }}
                  >

                    <strong>
                      {
                        slot.slot
                      }
                    </strong>

                    <br />

                    <span>
                      {available
                        ? "AVAILABLE"
                        : "BOOKED"}
                    </span>

                  </button>

                );

              }
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
                  "8px",
                background:
                  "#eff6ff",
                border:
                  "1px solid #bfdbfe",
              }}
            >

              Selected Slot:{" "}

              <strong>
                {
                  selectedSlot
                }
              </strong>

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          TEAM DETAILS
      ===================================================== */}

      {selectedSlot && (

        <div
          style={{
            border:
              "1px solid #ddd",
            borderRadius:
              "10px",
            padding:
              "20px",
            marginBottom:
              "25px",
          }}
        >

          <h2>
            Booking Details
          </h2>

          <p
            style={{
              color:
                "#666",
            }}
          >
            Enter the team information
            before confirming your
            facility booking.
          </p>


          {/* TEAM NAME */}

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
                display:
                  "block",
                width:
                  "100%",
                maxWidth:
                  "600px",
                padding:
                  "12px",
                marginTop:
                  "8px",
                border:
                  "1px solid #ccc",
                borderRadius:
                  "6px",
                boxSizing:
                  "border-box",
              }}
            />

          </div>


          {/* CAPTAIN */}

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
                display:
                  "block",
                width:
                  "100%",
                maxWidth:
                  "600px",
                padding:
                  "12px",
                marginTop:
                  "8px",
                border:
                  "1px solid #ccc",
                borderRadius:
                  "6px",
                boxSizing:
                  "border-box",
              }}
            />

          </div>


          {/* TEAM MEMBERS */}

          <div>

            <label>
              <strong>
                Team Members
              </strong>
            </label>


            {selectedFacility?.min_team_members !==
              undefined && (

              <p
                style={{
                  color:
                    "#666",
                  fontSize:
                    "14px",
                }}
              >

                Required minimum:{" "}
                <strong>
                  {
                    selectedFacility.min_team_members
                  }
                </strong>

                {" | "}

                Maximum:{" "}

                <strong>
                  {
                    selectedFacility.max_team_members
                  }
                </strong>

              </p>

            )}


            {teamMembers.map(
              (member, index) => (

                <div
                  key={index}
                  style={{
                    display:
                      "flex",
                    gap:
                      "10px",
                    marginBottom:
                      "10px",
                    maxWidth:
                      "650px",
                  }}
                >

                  <input
                    type="text"
                    value={
                      member
                    }
                    onChange={(event) =>
                      handleMemberChange(
                        index,
                        event.target.value
                      )
                    }
                    placeholder={
                      index === 0
                        ? "Captain name"
                        : `Team member ${index + 1}`
                    }
                    style={{
                      flex:
                        1,
                      padding:
                        "12px",
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
                      style={{
                        padding:
                          "8px 12px",
                        cursor:
                          "pointer",
                      }}
                    >
                      Remove
                    </button>

                  )}

                </div>

              )
            )}


            <button
              type="button"
              onClick={
                addMember
              }
              style={{
                marginTop:
                  "5px",
                padding:
                  "10px 15px",
                cursor:
                  "pointer",
              }}
            >
              + Add Team Member
            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          REVIEW BUTTON
      ===================================================== */}

      {selectedSlot && (

        <div
          style={{
            textAlign:
              "center",
            marginBottom:
              "35px",
          }}
        >

          <button
            type="button"
            onClick={
              handleOpenConfirmation
            }
            disabled={
              bookingLoading
            }
            style={{
              padding:
                "14px 30px",
              border:
                "none",
              borderRadius:
                "8px",
              background:
                "#2563eb",
              color:
                "white",
              fontSize:
                "16px",
              fontWeight:
                "600",
              cursor:
                "pointer",
            }}
          >

            Review Booking Details

          </button>

        </div>

      )}


      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      {showConfirmation && (

        <div
          style={{
            position:
              "fixed",
            top:
              0,
            left:
              0,
            right:
              0,
            bottom:
              0,
            background:
              "rgba(0,0,0,0.55)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex:
              9999,
            padding:
              "20px",
          }}
        >

          <div
            style={{
              background:
                "#fff",
              width:
                "100%",
              maxWidth:
                "650px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              borderRadius:
                "12px",
              padding:
                "25px",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >

            <h2>
              Confirm Facility Booking
            </h2>

            <p
              style={{
                color:
                  "#666",
              }}
            >
              Please check all details
              before confirming the booking.
            </p>


            {/* STUDENT */}

            <div
              style={{
                border:
                  "1px solid #ddd",
                borderRadius:
                  "8px",
                padding:
                  "15px",
                marginBottom:
                  "15px",
              }}
            >

              <h3>
                Student
              </h3>

              <p>
                <strong>
                  Name:
                </strong>{" "}
                {studentName}
              </p>

              <p>
                <strong>
                  Username:
                </strong>{" "}
                {student?.username ||
                  "-"}
              </p>

              <p>
                <strong>
                  Email:
                </strong>{" "}
                {student?.email ||
                  "-"}
              </p>

            </div>


            {/* FACILITY */}

            <div
              style={{
                border:
                  "1px solid #ddd",
                borderRadius:
                  "8px",
                padding:
                  "15px",
                marginBottom:
                  "15px",
              }}
            >

              <h3>
                Facility
              </h3>

              <p>
                <strong>
                  Facility:
                </strong>{" "}
                {
                  selectedFacility?.name ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Sport:
                </strong>{" "}
                {
                  selectedFacility?.sport ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Location:
                </strong>{" "}
                {
                  selectedFacility?.location ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Date:
                </strong>{" "}
                {
                  formatDate(
                    bookingDate
                  )
                }
              </p>

              <p>
                <strong>
                  Time:
                </strong>{" "}
                {
                  selectedSlot
                }
              </p>

            </div>


            {/* TEAM */}

            <div
              style={{
                border:
                  "1px solid #ddd",
                borderRadius:
                  "8px",
                padding:
                  "15px",
                marginBottom:
                  "20px",
              }}
            >

              <h3>
                Team Details
              </h3>

              <p>
                <strong>
                  Team Name:
                </strong>{" "}
                {
                  teamName
                }
              </p>

              <p>
                <strong>
                  Captain:
                </strong>{" "}
                {
                  captainName
                }
              </p>

              <p>
                <strong>
                  Team Members:
                </strong>
              </p>

              <ol>

                {getCleanMembers().map(
                  (
                    member,
                    index
                  ) => (

                    <li
                      key={
                        index
                      }
                    >
                      {
                        member
                      }
                    </li>

                  )
                )}

              </ol>

            </div>


            {/* WARNING */}

            <div
              style={{
                padding:
                  "12px",
                background:
                  "#fff7ed",
                border:
                  "1px solid #fed7aa",
                borderRadius:
                  "8px",
                marginBottom:
                  "20px",
                color:
                  "#9a3412",
              }}
            >

              Once you click
              <strong>
                {" Confirm & Book Now "}
              </strong>
              the booking will be sent
              to the system.

            </div>


            {/* BUTTONS */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap:
                  "10px",
              }}
            >

              <button
                type="button"
                onClick={() =>
                  setShowConfirmation(
                    false
                  )
                }
                disabled={
                  bookingLoading
                }
                style={{
                  padding:
                    "12px 20px",
                  borderRadius:
                    "6px",
                  border:
                    "1px solid #ccc",
                  background:
                    "#fff",
                  cursor:
                    "pointer",
                }}
              >
                Edit Details
              </button>


              <button
                type="button"
                onClick={
                  handleConfirmBooking
                }
                disabled={
                  bookingLoading
                }
                style={{
                  padding:
                    "12px 20px",
                  border:
                    "none",
                  borderRadius:
                    "6px",
                  background:
                    bookingLoading
                      ? "#9ca3af"
                      : "#16a34a",
                  color:
                    "#fff",
                  cursor:
                    bookingLoading
                      ? "not-allowed"
                      : "pointer",
                  fontWeight:
                    "600",
                }}
              >

                {bookingLoading
                  ? "Booking..."
                  : "Confirm & Book Now"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          MY BOOKINGS
      ===================================================== */}

      <div
        style={{
          border:
            "1px solid #ddd",
          borderRadius:
            "10px",
          padding:
            "20px",
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

                  <th style={tableHeaderStyle}>
                    ID
                  </th>

                  <th style={tableHeaderStyle}>
                    Facility
                  </th>

                  <th style={tableHeaderStyle}>
                    Date
                  </th>

                  <th style={tableHeaderStyle}>
                    Time
                  </th>

                  <th style={tableHeaderStyle}>
                    Team
                  </th>

                  <th style={tableHeaderStyle}>
                    Captain
                  </th>

                  <th style={tableHeaderStyle}>
                    Status
                  </th>

                  <th style={tableHeaderStyle}>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {myBookings.map(
                  (booking) => {

                    const bookingFacility =
                      facilities.find(
                        (facility) =>
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

                        <td style={tableCellStyle}>
                          {
                            booking.id
                          }
                        </td>

                        <td style={tableCellStyle}>
                          {
                            bookingFacility?.name ||
                            `Facility #${booking.facility_id}`
                          }
                        </td>

                        <td style={tableCellStyle}>
                          {
                            formatDate(
                              booking.booking_date
                            )
                          }
                        </td>

                        <td style={tableCellStyle}>

                          {
                            booking.start_time
                              ? booking.start_time.substring(
                                  0,
                                  5
                                )
                              : "-"
                          }

                          {" - "}

                          {
                            booking.end_time
                              ? booking.end_time.substring(
                                  0,
                                  5
                                )
                              : "-"
                          }

                        </td>

                        <td style={tableCellStyle}>
                          {
                            booking.team_name ||
                            "-"
                          }
                        </td>

                        <td style={tableCellStyle}>
                          {
                            booking.captain_name ||
                            "-"
                          }
                        </td>

                        <td style={tableCellStyle}>

                          <strong
                            style={{
                              color:
                                booking.status ===
                                "CONFIRMED"
                                  ? "#15803d"
                                  : "#dc2626",
                            }}
                          >
                            {
                              booking.status
                            }
                          </strong>

                        </td>

                        <td style={tableCellStyle}>

                          {booking.status ===
                            "CONFIRMED" && (

                            <button
                              type="button"
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


// =============================================================
// TABLE STYLES
// =============================================================

const tableHeaderStyle = {
  border:
    "1px solid #ddd",
  padding:
    "10px",
  background:
    "#f8f9fa",
  textAlign:
    "left",
};


const tableCellStyle = {
  border:
    "1px solid #ddd",
  padding:
    "10px",
};


export default FacilityBooking;