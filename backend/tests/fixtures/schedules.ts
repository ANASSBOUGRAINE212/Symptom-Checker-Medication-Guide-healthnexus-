// Doctor Schedule Test Fixtures
export const validSchedule = {
  dayOfWeek: 1, // Monday
  startTime: '09:00',
  endTime: '17:00',
};

export const validSchedule2 = {
  dayOfWeek: 3, // Wednesday
  startTime: '10:00',
  endTime: '18:00',
};

export const weekdaySchedules = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
];

export const invalidSchedule = {
  dayOfWeek: 8, // Invalid day
  startTime: '25:00', // Invalid time
  endTime: '08:00', // End before start
};

export const scheduleUpdate = {
  startTime: '10:00',
  endTime: '18:00',
};

export const dayOfWeekMap = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
