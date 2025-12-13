export const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Other"
];

export const SEVERITIES = [
  "Mild",
  "Mild to Moderate",
  "Moderate",
  "Moderate to Severe",
  "Severe",
  "Severe to Critical",
  "Critical"
];

export const PREVALENCE_OPTIONS = ["Very Rare", "Rare", "Uncommon", "Common", "Very Common"];

export const GENDERS = [
  "Male", "Female", "Non-binary", "Transgender", "Genderfluid", "Intersex", "Prefer not to say"
];

export const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'mild':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'mild to moderate':
      return 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'moderate to severe':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'severe':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'severe to critical':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    case 'critical':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getHashColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
    'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
    'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
    'bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300',
    'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300',
    'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
    'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const CATEGORY_COLORS = [
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-yellow-500 text-black',
  'bg-red-500 text-white',
  'bg-indigo-500 text-white',
  'bg-teal-500 text-white',
  'bg-orange-500 text-white',
  'bg-cyan-500 text-black',
  'bg-fuchsia-500 text-white',
  'bg-amber-500 text-black',
  'bg-lime-500 text-black',
  'bg-rose-500 text-white',
  'bg-violet-500 text-white',
  'bg-emerald-500 text-white',
  'bg-sky-500 text-white',
  'bg-stone-500 text-white',
  'bg-neutral-500 text-white',
  'bg-zinc-500 text-white',
  'bg-slate-500 text-white',
  'bg-gray-500 text-white',
];

export const getCategoryColor = (cat: string) => {
  if (!cat) return 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full px-3 py-1';
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[idx] + ' border-none rounded-full px-3 py-1 font-semibold shadow-sm';
};

export const getDiseaseColor = (disease: string) => {
  return getHashColor(disease);
};
