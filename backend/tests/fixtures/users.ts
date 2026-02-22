// User Test Fixtures
export const validUser = {
  email: 'testuser@example.com',
  password: 'Test123!@#',
  firstName: 'John',
  lastName: 'Doe',
};

export const validDoctor = {
  email: 'doctor@example.com',
  password: 'Doctor123!@#',
  firstName: 'Dr. Jane',
  lastName: 'Smith',
  specialty: 'Cardiology',
  licenseNumber: 'MED123456',
  yearsOfExperience: 10,
  education: 'MD from Harvard Medical School',
  phone: '+1234567890',
  address: '123 Medical Center Dr',
  city: 'Boston',
  country: 'United States',
  bio: 'Experienced cardiologist',
  languages: 'English, Spanish',
};

export const validAdmin = {
  email: 'admin@example.com',
  password: 'Admin123!@#',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
};

export const invalidUser = {
  email: 'invalid-email',
  password: '123', // Too short
  firstName: '',
  lastName: '',
};

// User Profile Fixtures
export const validUserProfile = {
  dateOfBirth: '1990-01-01',
  gender: 'MALE',
  country: 'United States',
  height: 180,
  weight: 75,
  bloodType: 'O+',
  allergies: 'None',
  darkMode: false,
  dataSharing: true,
};

export const updateUserProfile = {
  dateOfBirth: '1985-05-15',
  gender: 'FEMALE',
  country: 'Canada',
  height: 165,
  weight: 60,
  bloodType: 'A+',
  allergies: 'Peanuts, Penicillin',
  darkMode: true,
  dataSharing: false,
};

export const invalidUserProfile = {
  dateOfBirth: '2030-01-01', // Future date
  gender: 'INVALID',
  bloodType: 'Z+', // Invalid blood type
  height: -10, // Negative
  weight: -5, // Negative
};

// XSS Attack Fixtures
export const xssAttackPayloads = {
  scriptTag: '<script>alert("XSS")</script>',
  imgTag: '<img src=x onerror=alert("XSS")>',
  eventHandler: '<div onload=alert("XSS")>',
  htmlEntities: '<b>Bold</b><i>Italic</i>',
  sqlInjection: "admin' OR '1'='1",
  mongoInjection: '{"$gt":""}',
};

// Security Test Fixtures
export const weakPasswords = [
  '123',
  'password',
  'abc123',
  '12345678',
  'qwerty',
];

export const strongPasswords = [
  'Test123!@#',
  'SecureP@ssw0rd',
  'MyStr0ng!Pass',
  'C0mpl3x#Pass',
];
