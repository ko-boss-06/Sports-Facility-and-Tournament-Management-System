import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};


// ============================================================
// FORMAT BACKEND ERROR
// ============================================================

export const getBookingErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;

  // FastAPI validation errors
  //
  // Example:
  //
  // [
  //   {
  //     "type": "missing",
  //     "loc": ["body", "team_name"],
  //     "msg": "Field required"
  //   }
  // ]
  //
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.msg) {
          const location = Array.isArray(item.loc)
            ? item.loc.join(" → ")
            : "";

          return location
            ? `${location}: ${item.msg}`
            : item.msg;
        }

        return "Invalid booking data.";
      })
      .join(" | ");
  }


  // Normal backend error
  if (typeof detail === "string") {
    return detail;
  }


  // Other axios errors
  if (error?.message) {
    return error.message;
  }


  return "Booking failed. Please try again.";
};


// ============================================================
// GET BOOKING AVAILABILITY
// ============================================================

export const getBookingAvailability = async (
  facilityId,
  bookingDate
) => {
  const response = await axios.get(
    `${API_URL}/bookings/availability`,
    {
      params: {
        facility_id: Number(facilityId),
        booking_date: bookingDate,
      },

      ...getAuthHeaders(),
    }
  );

  return response.data;
};


// ============================================================
// CREATE FACILITY BOOKING
// ============================================================

export const createBooking = async (
  facilityId,
  bookingDate,
  slot,
  teamName = "",
  captainName = "",
  teamMembers = []
) => {
  try {
    const cleanedTeamMembers =
      Array.isArray(teamMembers)
        ? teamMembers
            .map((member) =>
              String(member).trim()
            )
            .filter(Boolean)
        : [];


    const response = await axios.post(
      `${API_URL}/bookings`,
      {
        facility_id: Number(facilityId),

        booking_date: bookingDate,

        slot: slot,

        team_name:
          String(teamName || "").trim(),

        captain_name:
          String(captainName || "").trim(),

        team_members:
          cleanedTeamMembers,
      },

      getAuthHeaders()
    );


    return response.data;

  } catch (error) {

    console.error(
      "Create booking error:",
      error
    );

    throw error;
  }
};


// ============================================================
// GET MY BOOKINGS
// ============================================================

export const getMyBookings = async () => {
  const response = await axios.get(
    `${API_URL}/bookings/my`,
    getAuthHeaders()
  );

  return response.data;
};


// ============================================================
// GET SINGLE BOOKING
// ============================================================

export const getBooking = async (
  bookingId
) => {
  const response = await axios.get(
    `${API_URL}/bookings/${bookingId}`,
    getAuthHeaders()
  );

  return response.data;
};


// ============================================================
// CANCEL BOOKING
// ============================================================

export const cancelBooking = async (
  bookingId,
  reason = ""
) => {
  const response = await axios.post(
    `${API_URL}/bookings/${bookingId}/cancel`,
    {
      reason: reason,
    },
    getAuthHeaders()
  );

  return response.data;
};