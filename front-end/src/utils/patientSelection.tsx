interface Option {
    value: string;
    label: string;
}

export const REGISTRATION_STEPS = [
  { label: "Patient Details", step: 1 },
  { label: "Relative Details", step: 2 },
];

export const genderOptions: Option[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
];

export const maritalStatusOptions: Option[] = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" }
];

export const idProofTypeOptions: Option[] = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "pancard", label: "PAN Card" },
    { value: "voter", label: "Voter ID" },
    { value: "driving_license", label: "Driving License" },
    { value: "passport", label: "Passport" },
];

export const infertiliyTypeOptions: Option[] = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" }
];

export const howToFindClinicOptions: Option[] = [
    { value: "google", label: "Google" },
    { value: "justdial", label: "Just Dial" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "friend", label: "Friend" },
    { value: "relative", label: "Relative" },
    { value: "doctor", label: "Doctor" },
    { value: "newspaper", label: "News Paper" },
    { value: "youtube", label: "YouTube" },
    // { value: "other", label: "Other" },
];

export const roleOptions: Option[] = [
    { value: "husband", label: "Husband" },
    { value: "wife", label: "Wife" },
    { value: "cousin", label: "Cousin" },
];

export const relativeRoleOptions: Option[] = [
    { value: "husband", label: "Husband" },
    { value: "cousin", label: "Cousin" },
];
