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
  // STATE
  // =========================================================

  const [facilities, setFacilities] =
    useState([]);

  const [facilityId, setFacilityId] =
    useState("");

  const [bookingDate, setBookingDate] =
    useState("");

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
  // CURRENT TIME
  // =========================================================

  const [currentTime, setCurrentTime] =
    useState(new Date());


  // =========================================================
  // GET INDIA DATE PARTS
  // =========================================================

  const getIndiaDateParts = () => {

    const now = new Date();

    const parts =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          timeZone: "Asia/Kolkata",

          year: "numeric",

          month: "2-digit",

          day: "2-digit",

          hour: "2-digit",

          minute: "2-digit",

          hour12: false,
        }
      ).formatToParts(now);


    const getPart = (type) =>
      parts.find(
        (part) =>
          part.type === type
      )?.value;


    return {
      year: Number(
        getPart("year")
      ),

      month: Number(
        getPart("month")
      ),

      day: Number(
        getPart("day")
      ),

      hour: Number(
        getPart("hour")
      ),

      minute: Number(
        getPart("minute")
      ),
    };
  };


  // =========================================================
  // FORMAT DATE YYYY-MM-DD
  // =========================================================

  const formatISODate = (
    year,
    month,
    day
  ) => {

    return (
      `${year}-` +
      `${String(month).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}`
    );
  };


  // =========================================================
  // GET TODAY DATE IN INDIA
  // =========================================================

  const getTodayDate = () => {

    const {
      year,
      month,
      day,
    } = getIndiaDateParts();


    return formatISODate(
      year,
      month,
      day
    );
  };


  // =========================================================
  // GET ACTIVE BOOKING DATE
  // =========================================================
  //
  // Before 10:00 PM:
  //     today's date
  //
  // At/after 10:00 PM:
  //     tomorrow's date
  //
  // =========================================================

  const getActiveBookingDate = () => {

    const {
      year,
      month,
      day,
      hour,
    } = getIndiaDateParts();


    // Before 10 PM
    if (hour < 22) {

      return formatISODate(
        year,
        month,
        day
      );
    }


    // After 10 PM
    const tomorrow =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );


    tomorrow.setUTCDate(
      tomorrow.getUTCDate() + 1
    );


    return formatISODate(
      tomorrow.getUTCFullYear(),

      tomorrow.getUTCMonth() + 1,

      tomorrow.getUTCDate()
    );
  };


  // =========================================================
  // REFRESH CURRENT TIME
  // =========================================================

  useEffect(() => {

    const timer =
      setInterval(() => {

        setCurrentTime(
          new Date()
        );

      }, 30000);


    return () => {

      clearInterval(timer);

    };

  }, []);


  // =========================================================
  // LOAD FACILITIES
  // =========================================================

  const loadFacilities =
    async () => {

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
            (facility) => {

              return (
                facility.availability_status === true &&
                facility.maintenance_status ===
                  "AVAILABLE"
              );

            }
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


        const detail =
          err.response?.data?.detail;


        if (
          Array.isArray(detail)
        ) {

          setError(
            detail
              .map(
                (item) =>
                  item?.msg ||
                  String(item)
              )
              .join(" | ")
          );

        } else {

          setError(
            typeof detail ===
              "string"
              ? detail
              : "Unable to load sports facilities."
          );

        }

      } finally {

        setLoadingFacilities(false);

      }
    };


  // =========================================================
  // LOAD MY BOOKINGS
  // =========================================================

  const loadMyBookings =
    async () => {

      try {

        const data =
          await getMyBookings();


        setMyBookings(
          Array.isArray(data)
            ? data
            : data?.bookings || []
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

  const loadAvailability =
    async (
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


        const detail =
          err.response?.data?.detail;


        if (
          Array.isArray(detail)
        ) {

          setError(
            detail
              .map(
                (item) =>
                  item?.msg ||
                  String(item)
              )
              .join(" | ")
          );

        } else {

          setError(
            typeof detail ===
              "string"
              ? detail
              : "Unable to load booking slots."
          );

        }

      } finally {

        setLoadingSlots(false);

      }
    };


  // =========================================================
  // INITIAL PAGE LOAD
  // =========================================================

  useEffect(() => {

    const activeDate =
      getActiveBookingDate();


    setBookingDate(
      activeDate
    );


    loadFacilities();

    loadMyBookings();

  }, []);


  // =========================================================
  // LOAD AVAILABILITY
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
    bookingDate,
  ]);


  // =========================================================
  // FACILITY CHANGE
  // =========================================================

  const handleFacilityChange =
    (event) => {

      const selectedId =
        Number(
          event.target.value
        );


      setFacilityId(
        selectedId
      );


      setSelectedSlot("");

      setMessage("");

      setError("");


      // Clear team details
      setTeamName("");

      setCaptainName("");

      setTeamMembers([""]);

    };


  // =========================================================
  // SLOT STATUS
  // =========================================================

  const timeToMinutes =
    (timeString) => {

      if (!timeString) {
        return 0;
      }


      const [
        hours,
        minutes,
      ] =
        timeString
          .substring(0, 5)
          .split(":")
          .map(Number);


      return (
        hours * 60 +
        minutes
      );
    };


  // =========================================================
  // CHECK EXPIRED
  // =========================================================

  const isSlotExpired =
    (slot) => {

      if (
        bookingDate !==
        getTodayDate()
      ) {

        return false;
      }


      if (!slot?.end_time) {

        return false;
      }


      const {
        hour,
        minute,
      } =
        getIndiaDateParts();


      const currentMinutes =
        hour * 60 +
        minute;


      const endMinutes =
        timeToMinutes(
          slot.end_time
        );


      return (
        currentMinutes >=
        endMinutes
      );
    };


  // =========================================================
  // GET SLOT STATUS
  // =========================================================

  const getSlotStatus =
    (slot) => {

      if (
        isSlotExpired(slot)
      ) {

        return "EXPIRED";
      }


      if (
        !slot?.available
      ) {

        return "BOOKED";
      }


      return "AVAILABLE";
    };


  // =========================================================
  // SLOT SELECT
  // =========================================================

  const handleSlotSelect =
    (slot) => {

      const status =
        getSlotStatus(slot);


      if (
        status !==
        "AVAILABLE"
      ) {

        return;
      }


      setSelectedSlot(
        slot.slot
      );


      setMessage("");

      setError("");

    };


  // =========================================================
  // TEAM MEMBER CHANGE
  // =========================================================

  const handleMemberChange =
    (
      index,
      value
    ) => {

      const updatedMembers =
        [...teamMembers];


      updatedMembers[index] =
        value;


      setTeamMembers(
        updatedMembers
      );

    };


  // =========================================================
  // ADD TEAM MEMBER
  // =========================================================

  const addMember =
    () => {

      setTeamMembers([
        ...teamMembers,
        "",
      ]);

    };


  // =========================================================
  // REMOVE TEAM MEMBER
  // =========================================================

  const removeMember =
    (index) => {

      if (
        teamMembers.length <= 1
      ) {

        return;
      }


      const updatedMembers =
        teamMembers.filter(
          (_, memberIndex) =>
            memberIndex !== index
        );


      setTeamMembers(
        updatedMembers
      );

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


  // =========================================================
  // REQUIRED TEAM SIZE
  // =========================================================

  const getRequiredTeamSize =
    () => {

      if (
        !selectedFacility
      ) {

        return null;
      }


      const sport =
        String(
          selectedFacility.sport || ""
        )
          .toLowerCase()
          .trim();


      const teamSizeRules = {

        football: 11,

        cricket: 11,

        basketball: 5,

        volleyball: 6,

        handball: 7,

        kabaddi: 7,

        hockey: 11,

        throwball: 7,

        "kho kho": 9,

        "kho-kho": 9,

        kho_kho: 9,

        badminton: 2,

        tennis: 2,

        "table tennis": 2,

        table_tennis: 2,

        carrom: 4,

        chess: 1,

      };


      return (
        teamSizeRules[sport] ||
        null
      );
    };


  const requiredTeamSize =
    getRequiredTeamSize();


  // =========================================================
  // VALIDATE TEAM DETAILS
  // =========================================================

  const validateTeamDetails =
    () => {

      if (
        !teamName.trim()
      ) {

        return (
          "Please enter the team name."
        );
      }


      if (
        !captainName.trim()
      ) {

        return (
          "Please enter the captain name."
        );
      }


      const cleanedMembers =
        teamMembers
          .map(
            (member) =>
              String(member).trim()
          )
          .filter(
            (member) =>
              member.length > 0
          );


      if (
        cleanedMembers.length === 0
      ) {

        return (
          "Please enter at least one team member."
        );
      }


      // Captain must exist
      // in team members

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
          "Captain name must also be included in the team members list."
        );
      }


      // Duplicate check

      const normalizedMembers =
        cleanedMembers.map(
          (member) =>
            member.toLowerCase()
        );


      const uniqueMembers =
        new Set(
          normalizedMembers
        );


      if (
        uniqueMembers.size !==
        normalizedMembers.length
      ) {

        return (
          "A team member cannot be added more than once."
        );
      }


      // Sport team size

      if (
        requiredTeamSize !==
          null &&
        cleanedMembers.length !==
          requiredTeamSize
      ) {

        return (
          `This sport requires exactly ${requiredTeamSize} ` +
          `team member${
            requiredTeamSize > 1
              ? "s"
              : ""
          }. ` +
          `Currently entered: ${cleanedMembers.length}.`
        );
      }


      return null;
    };


  // =========================================================
  // BOOK FACILITY
  // =========================================================

  const handleBooking =
    async () => {

      setError("");

      setMessage("");


      // Facility

      if (!facilityId) {

        setError(
          "Please select a sports facility."
        );

        return;
      }


      // Date

      if (!bookingDate) {

        setError(
          "Booking date is required."
        );

        return;
      }


      // Slot

      if (!selectedSlot) {

        setError(
          "Please select an available slot."
        );

        return;
      }


      // Team validation

      const validationError =
        validateTeamDetails();


      if (validationError) {

        setError(
          validationError
        );

        return;
      }


      // Clean team members

      const cleanedMembers =
        teamMembers
          .map(
            (member) =>
              String(member).trim()
          )
          .filter(Boolean);


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


        // Success

        setMessage(
          `Booking successful! Booking ID: ${booking?.id ?? "Created"}`
        );


        // Clear selected slot

        setSelectedSlot("");


        // Clear team form

        setTeamName("");

        setCaptainName("");

        setTeamMembers([""]);


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
        // Never directly render
        // an object from FastAPI.

        const errorMessage =
          getBookingErrorMessage(
            err
          );


        setError(
          errorMessage
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

  const handleCancelBooking =
    async (
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

  const formatDate =
    (date) => {

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
  // SLOT STYLE
  // =========================================================

  const getSlotStyle =
    (slot) => {

      const status =
        getSlotStatus(slot);


      if (
        status ===
        "AVAILABLE"
      ) {

        return {

          padding: "18px",

          borderRadius: "10px",

          border:
            selectedSlot ===
            slot.slot
              ? "3px solid #2563eb"
              : "1px solid #cbd5e1",

          backgroundColor:
            selectedSlot ===
            slot.slot
              ? "#dbeafe"
              : "#f8fafc",

          color: "#111827",

          cursor: "pointer",

          minHeight: "100px",

        };
      }


      if (
        status ===
        "BOOKED"
      ) {

        return {

          padding: "18px",

          borderRadius: "10px",

          border:
            "1px solid #fca5a5",

          backgroundColor:
            "#fee2e2",

          color: "#991b1b",

          cursor:
            "not-allowed",

          minHeight: "100px",

        };
      }


      return {

        padding: "18px",

        borderRadius: "10px",

        border:
          "1px solid #cbd5e1",

        backgroundColor:
          "#e5e7eb",

        color: "#6b7280",

        cursor:
          "not-allowed",

        minHeight: "100px",

      };
    };


  // =========================================================
  // SLOT STATUS STYLE
  // =========================================================

  const getStatusStyle =
    (status) => {

      if (
        status ===
        "AVAILABLE"
      ) {

        return {

          color: "#15803d",

          fontWeight: "700",

          marginTop: "8px",

        };
      }


      if (
        status ===
        "BOOKED"
      ) {

        return {

          color: "#dc2626",

          fontWeight: "700",

          marginTop: "8px",

        };
      }


      return {

        color: "#6b7280",

        fontWeight: "700",

        marginTop: "8px",

      };
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

          alignItems:
            "center",

          marginBottom: "30px",

          gap: "20px",

        }}
      >

        <div>

          <h1>
            Book Sports Facility
          </h1>

          <p>
            Select a facility,
            choose an available
            time slot and enter
            your team details.
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
          Back to Dashboard
        </button>

      </div>


      {/* =====================================================
          BOOKING RULES
      ===================================================== */}

      <div
        style={{

          border:
            "1px solid #ddd",

          borderRadius:
            "8px",

          padding:
            "20px",

          marginBottom:
            "25px",

          background:
            "#f8f9fa",

        }}
      >

        <h3>
          Booking Rules
        </h3>


        <ul>

          <li>
            Booking date is
            controlled by the
            booking window.
          </li>

          <li>
            Booking opens at
            <strong>
              {" "}10:00 PM
            </strong>
            {" "}for the active
            booking date.
          </li>

          <li>
            Each slot is
            one hour.
          </li>

          <li>
            A booked slot cannot
            be booked again.
          </li>

          <li>
            One student can make
            only one facility
            booking per day.
          </li>

          <li>
            A team member cannot
            participate in another
            facility booking on
            the same day.
          </li>

          <li>
            Captain name must
            appear in the team
            member list.
          </li>

          <li>
            Team size depends on
            the selected sport.
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

          borderRadius:
            "8px",

          padding:
            "20px",

          marginBottom:
            "25px",

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

                  maxWidth:
                    "500px",

                  padding:
                    "12px",

                  fontSize:
                    "16px",

                  borderRadius:
                    "6px",

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

                    marginTop:
                      "20px",

                    padding:
                      "15px",

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
                      Type:
                    </strong>{" "}

                    {
                      selectedFacility
                        .facility_type
                    }

                  </p>


                  <p>

                    <strong>
                      Sport:
                    </strong>{" "}

                    {
                      selectedFacility
                        .sport
                    }

                  </p>


                  <p>

                    <strong>
                      Location:
                    </strong>{" "}

                    {
                      selectedFacility
                        .location
                    }

                  </p>


                  {selectedFacility.capacity && (

                    <p>

                      <strong>
                        Capacity:
                      </strong>{" "}

                      {
                        selectedFacility
                          .capacity
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
                        selectedFacility
                          .description
                      }

                    </p>

                  )}

                </div>

              )}

            </>

          )}

      </div>


      {/* =====================================================
          BOOKING DATE
      ===================================================== */}

      <div
        style={{

          border:
            "1px solid #ddd",

          borderRadius:
            "8px",

          padding:
            "20px",

          marginBottom:
            "25px",

        }}
      >

        <h2>
          Booking Date
        </h2>


        <input
          type="date"
          value={bookingDate}
          min={bookingDate}
          max={bookingDate}
          readOnly
          style={{

            padding:
              "10px",

            fontSize:
              "16px",

          }}
        />


        <p>

          Active booking date:{" "}

          <strong>
            {
              formatDate(
                bookingDate
              )
            }
          </strong>

        </p>


        <p
          style={{

            fontSize:
              "14px",

            color:
              "#666",

          }}
        >
          The booking date is
          automatically controlled
          by the booking window.
        </p>

      </div>


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
              "6px",

            background:
              "#f8d7da",

            color:
              "#721c24",

            border:
              "1px solid #f5c2c7",

          }}
        >

          <strong>
            Error:
          </strong>{" "}

          {error}

        </div>

      )}


      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {message && (

        <div
          style={{

            padding:
              "15px",

            marginBottom:
              "20px",

            borderRadius:
              "6px",

            background:
              "#d4edda",

            color:
              "#155724",

            border:
              "1px solid #badbcc",

          }}
        >

          <strong>
            Success:
          </strong>{" "}

          {message}

        </div>

      )}


      {/* =====================================================
          SLOT SECTION
      ===================================================== */}

      {facilityId && (

        <div
          style={{

            border:
              "1px solid #ddd",

            borderRadius:
              "8px",

            padding:
              "20px",

            marginBottom:
              "30px",

          }}
        >

          <h2>
            Facility Time Slots
          </h2>


          <div
            style={{

              display:
                "flex",

              gap:
                "20px",

              flexWrap:
                "wrap",

              marginBottom:
                "20px",

            }}
          >

            <span>
              🟢 Available
            </span>

            <span>
              🔴 Booked
            </span>

            <span>
              ⚪ Expired
            </span>

          </div>


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

                const status =
                  getSlotStatus(
                    slot
                  );


                return (

                  <button
                    key={
                      slot.slot
                    }
                    type="button"
                    disabled={
                      status !==
                      "AVAILABLE"
                    }
                    onClick={() =>
                      handleSlotSelect(
                        slot
                      )
                    }
                    style={{
                      ...getSlotStyle(
                        slot
                      ),

                      textAlign:
                        "center",

                    }}
                  >

                    <div
                      style={{

                        fontSize:
                          "18px",

                        fontWeight:
                          "700",

                      }}
                    >

                      {
                        slot.slot
                      }

                    </div>


                    <div
                      style={
                        getStatusStyle(
                          status
                        )
                      }
                    >

                      {
                        status
                      }

                    </div>

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
                  "6px",

                background:
                  "#e7f3ff",

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
              "8px",

            padding:
              "20px",

            marginBottom:
              "30px",

          }}
        >

          <h2>
            Team Details
          </h2>


          <p
            style={{
              color:
                "#666",
            }}
          >
            Enter the team details
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
              placeholder=
                "Enter team name"
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


          {/* CAPTAIN NAME */}

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
              placeholder=
                "Enter captain name"
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


            {requiredTeamSize !==
              null && (

              <p
                style={{

                  fontSize:
                    "14px",

                  color:
                    "#666",

                }}
              >

                Required team size:{" "}

                <strong>
                  {
                    requiredTeamSize
                  }
                </strong>

              </p>

            )}


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
                        event.target
                          .value
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
                    >
                      Remove
                    </button>

                  )}

                </div>

              )
            )}


            {(requiredTeamSize ===
              null ||
              teamMembers.length <
                requiredTeamSize) && (

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


      {/* =====================================================
          CONFIRM BOOKING
      ===================================================== */}

      {selectedSlot && (

        <div
          style={{

            textAlign:
              "center",

            marginBottom:
              "40px",

          }}
        >

          <button
            type="button"
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

              fontSize:
                "16px",

              fontWeight:
                "600",

              borderRadius:
                "6px",

              border:
                "none",

              background:
                bookingLoading
                  ? "#9ca3af"
                  : "#2563eb",

              color:
                "#fff",

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


      {/* =====================================================
          MY BOOKINGS
      ===================================================== */}

      <div
        style={{

          border:
            "1px solid #ddd",

          borderRadius:
            "8px",

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

                          {
                            bookingFacility
                              ? bookingFacility.name
                              : `Facility #${booking.facility_id}`
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

                          {
                            formatDate(
                              booking.booking_date
                            )
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

                          {
                            booking.start_time
                              ? booking.start_time
                                  .substring(
                                    0,
                                    5
                                  )
                              : "-"
                          }

                          {" - "}

                          {
                            booking.end_time
                              ? booking.end_time
                                  .substring(
                                    0,
                                    5
                                  )
                              : "-"
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

                          {
                            booking.team_name ||
                            "-"
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


export default FacilityBooking;