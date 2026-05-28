// components/UserProfile/UserInfoCard.tsx
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

export default function UserInfoCard() {
  const user = useSelector((state: RootState) => state.auth.user);

  const formatFieldName = (key: string) => {
    const fieldNames: Record<string, string> = {
      name: "Full Name",
      email: "Email Address",
      mobileNumber: "Phone Number",
      role: "Role",
      specialization: "Specialization",
      qualification: "Qualification",
      experience: "Experience",
      registrationNumber: "Registration Number",
      department: "Department",
      designation: "Designation",
      employeeId: "Employee ID",
    };
    return fieldNames[key] || key;
  };

  const getDisplayFields = () => {
    const commonFields = ["name", "email", "mobileNumber"];
    const doctorFields = ["specialization", "qualification", "experience", "registrationNumber", "department"];
    const employeeFields = ["designation", "employeeId", "department"];
    
    let fields = [...commonFields];
    
    if (user?.role === "doctor") {
      fields = [...fields, ...doctorFields];
    } else if (user?.role === "employee") {
      fields = [...fields, ...employeeFields];
    }
    
    return fields;
  };

  const getFieldValue = (field: string) => {
    const value = user?.[field as keyof typeof user];
    
    if (field === "experience") {
      return value ? `${value} years` : "N/A";
    }
    
    return value || "N/A";
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            {getDisplayFields().map((field) => (
              <div key={field}>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {formatFieldName(field)}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {getFieldValue(field)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}