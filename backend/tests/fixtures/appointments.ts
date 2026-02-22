// Appointment Test Fixtures
export const validAppointment = {
  appointmentDate: '2026-03-15',
  appointmentTime: '10:00',
  reason: 'Regular checkup',
};

export const appointmentStatuses = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  noShow: 'NO_SHOW',
};

export const appointmentUpdate = {
  status: 'COMPLETED',
  visited: true,
  needsFollowUp: false,
  diagnosisNotes: 'Patient is healthy',
  notes: 'Regular checkup completed successfully',
};
