// Medication Test Fixtures (MongoDB)
export const validMedication = {
  name: 'Amoxicillin',
  genericName: 'Amoxicillin',
  category: 'Antibiotic',
  description: 'Penicillin-type antibiotic used to treat bacterial infections',
  dosageForm: 'Capsule',
  strength: '500mg',
  manufacturer: 'Generic Pharma Inc.',
  sideEffects: ['nausea', 'diarrhea', 'rash', 'headache'],
  contraindications: ['penicillin allergy', 'severe kidney disease'],
  interactions: ['methotrexate', 'warfarin', 'oral contraceptives'],
  storageInstructions: 'Store at room temperature away from moisture',
  prescriptionRequired: true,
};

export const validMedication2 = {
  name: 'Ibuprofen',
  genericName: 'Ibuprofen',
  category: 'NSAID',
  description: 'Nonsteroidal anti-inflammatory drug for pain and fever',
  dosageForm: 'Tablet',
  strength: '200mg',
  manufacturer: 'Pain Relief Co.',
  sideEffects: ['stomach upset', 'heartburn', 'dizziness'],
  contraindications: ['stomach ulcers', 'severe heart disease', 'pregnancy (third trimester)'],
  interactions: ['aspirin', 'blood thinners', 'lithium'],
  storageInstructions: 'Store at room temperature',
  prescriptionRequired: false,
};

export const medicationCategories = [
  'Antibiotic',
  'Antiviral',
  'Antifungal',
  'Analgesic',
  'NSAID',
  'Antihypertensive',
  'Antidiabetic',
  'Antihistamine',
  'Antidepressant',
  'Other',
];

export const medicationUpdate = {
  description: 'Updated medication description',
  strength: '1000mg',
  sideEffects: ['updated side effect 1', 'updated side effect 2'],
};
