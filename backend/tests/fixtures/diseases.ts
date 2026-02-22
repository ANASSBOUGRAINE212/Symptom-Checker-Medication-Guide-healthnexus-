// Disease Test Fixtures (MongoDB)
export const validDisease = {
  name: 'Hypertension',
  category: 'Cardiovascular',
  description: 'High blood pressure condition',
  symptoms: ['headache', 'dizziness', 'chest pain', 'shortness of breath'],
  causes: ['stress', 'poor diet', 'lack of exercise', 'genetics'],
  treatments: ['medication', 'lifestyle changes', 'diet modification', 'exercise'],
  prevention: ['healthy diet', 'regular exercise', 'stress management', 'limit alcohol'],
  severity: 'MODERATE',
  isCommon: true,
};

export const validDisease2 = {
  name: 'Type 2 Diabetes',
  category: 'Endocrine',
  description: 'Chronic condition affecting blood sugar regulation',
  symptoms: ['increased thirst', 'frequent urination', 'fatigue', 'blurred vision'],
  causes: ['obesity', 'sedentary lifestyle', 'genetics', 'age'],
  treatments: ['insulin therapy', 'oral medications', 'diet control', 'exercise'],
  prevention: ['maintain healthy weight', 'regular exercise', 'balanced diet'],
  severity: 'HIGH',
  isCommon: true,
};

export const diseaseCategories = [
  'Cardiovascular',
  'Respiratory',
  'Infectious',
  'Neurological',
  'Endocrine',
  'Gastrointestinal',
  'Musculoskeletal',
  'Dermatological',
  'Mental Health',
  'Other',
];

export const diseaseUpdate = {
  description: 'Updated description',
  symptoms: ['new symptom 1', 'new symptom 2'],
  treatments: ['new treatment 1', 'new treatment 2'],
};
