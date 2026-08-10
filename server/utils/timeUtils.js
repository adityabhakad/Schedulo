/**
 * Convert time string "HH:mm" to total minutes from 00:00
 * @param {string} timeStr - "09:30"
 * @returns {number}
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Convert total minutes from 00:00 to "HH:mm"
 * @param {number} totalMinutes 
 * @returns {string}
 */
export const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(hours)}:${pad(minutes)}`;
};

/**
 * Add duration in minutes to start time "HH:mm"
 * @param {string} startTime - "09:00"
 * @param {number} durationMinutes - 30
 * @returns {string} - "09:30"
 */
export const calculateEndTime = (startTime, durationMinutes) => {
  const startMin = timeToMinutes(startTime);
  const endMin = startMin + durationMinutes;
  return minutesToTime(endMin);
};

/**
 * Check if two time intervals overlap
 * @param {string} start1 
 * @param {string} end1 
 * @param {string} start2 
 * @param {string} end2 
 * @returns {boolean}
 */
export const isOverlapping = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
};

/**
 * Safely parse Date input to ensure consistent local midnight
 * @param {Date|string} dateInput 
 * @returns {Date}
 */
export const parseDateSafe = (dateInput) => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;

  // Handle YYYY-MM-DD string explicitly
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const [year, month, day] = dateInput.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  return new Date(dateInput);
};

/**
 * Get Day of Week string from Date object or ISO string (e.g., 'Monday')
 * @param {Date|string} dateInput 
 * @returns {string}
 */
export const getDayOfWeek = (dateInput) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = parseDateSafe(dateInput);
  return days[date.getDay()];
};

/**
 * Format Date to YYYY-MM-DD string
 * @param {Date|string} dateInput 
 * @returns {string}
 */
export const formatDateString = (dateInput) => {
  const date = parseDateSafe(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

