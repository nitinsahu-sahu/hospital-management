// components/UserProfile/UserMetaCard.tsx
import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store/store";
//@ts-ignore
import { updateProfilePic } from "../../redux/actions/auth.actions";

export default function UserMetaCard() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const picUploading = useSelector((state: RootState) => state.auth.picUploading);
  
  const [isHovering, setIsHovering] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      doctor: "Doctor",
      patient: "Patient",
      employee: "Employee",
      admin: "Administrator",
    };
    return roleMap[role] || role || "User";
  };

  // Get specialization or department display
  const getSubtitle = () => {
    if (user.role === "doctor") {
      return user.specialization || "Healthcare Professional";
    } else if (user.role === "employee") {
      return user.designation || user.department || "Staff Member";
    }
    return user.department || "";
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  // Handle image upload
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("pic", file);

    try {
      const result = await dispatch(updateProfilePic(user._id, formData) as any);
      
      if (result?.type === "UPDATE_PROFILE_PIC_SUCCESS") {
        // Success - preview will update automatically from Redux store
        setPreviewImage(null);
        console.log("Profile picture updated successfully!");
      } else {
        // Error
        setPreviewImage(null);
        alert(result?.message || "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setPreviewImage(null);
      alert("Failed to upload profile picture");
    }
  };

  // Trigger file input click
  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          {/* Profile Picture with Edit Overlay */}
          <div 
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Avatar Container */}
            <div className="relative w-20 h-20 overflow-hidden border-2 border-gray-200 rounded-full dark:border-gray-700 group cursor-pointer">
              {previewImage || user?.pic?.url ? (
                <img
                  src={previewImage || user?.pic?.url}
                  alt={user?.name || "User"}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {getInitials(user?.name || "")}
                  </span>
                </div>
              )}
              
              {/* Loading Overlay */}
              {picUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-8 h-8 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
                </div>
              )}
            </div>

            {/* Edit Button Overlay */}
            <button
              onClick={handleEditClick}
              disabled={picUploading}
              className={`absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 ${
                isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              } ${picUploading ? 'cursor-not-allowed opacity-50' : ''}`}
              title="Change profile picture"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* User Info */}
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user?.name || "User Name"}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getRoleDisplay(user?.role)}
              </p>
              {getSubtitle() && (
                <>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getSubtitle()}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}