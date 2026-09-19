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
    },
  };
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
        facility_id: facilityId,
        booking_date: bookingDate,
      },
    }
  );

  return response.data;
};


// ============================================================
// CREATE FACILITY BOOKING
// ============================================================
//
// Sends:
// - facility
// - booking date
// - selected slot
// - team name
// - captain name
// - team members
//
// teamMembers should be an array:
//
// [
//   "Captain",
//   "Member 2",
//   "Member 3"
// ]
//
// ============================================================

export const createBooking = async (
  facilityId,
  bookingDate,
  slot,
  teamName,
  captainName,
  teamMembers
) => {
  const response = await axios.post(
    `${API_URL}/bookings`,
    {
      facility_id: facilityId,
      booking_date: bookingDate,
      slot: slot,

      team_name: teamName,
      captain_name: captainName,

      // Convert array into a readable string
      // for the backend/database.
      team_members: Array.isArray(teamMembers)
        ? teamMembers.join(", ")
        : teamMembers,
    },
    getAuthHeaders()
  );

  return response.data;
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

export const getBooking = async (bookingId) => {
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