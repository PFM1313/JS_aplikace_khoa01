import { DateTime } from "luxon";

// Function to convert UTC time to Prague time
function convertToPragueTime(utcDateString) {
  // Parse the UTC date string
  const utcDate = DateTime.fromISO(utcDateString, { zone: "utc" });

  // Convert to Prague time
  const pragueDate = utcDate.setZone("Europe/Prague");

  // Format the output (ISO string with timezone offset)
  return pragueDate.toISO(); // e.g., "2025-01-11T12:30:00+01:00"
}

export { convertToPragueTime };
