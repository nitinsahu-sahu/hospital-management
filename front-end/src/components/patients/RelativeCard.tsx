import { useRef, useState } from "react";
//@ts-ignore
import { updateRelativeImg } from "../../redux/actions/patient.actions"
import { useDispatch } from "react-redux";
import { EditIcon } from "../../icons";

export default function RelativeCard({ relativedata }: any) {
  
  const [isExpanded, setIsExpanded] = useState(false);

   const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(relativedata.pic?.url);

   const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setCurrentImageUrl(previewUrl);

    // Prepare form data
    const formData = new FormData();
    formData.append('pic', file);

    setIsUploading(true);

    try {
      const response = await dispatch(updateRelativeImg(relativedata._id, formData));
      
      if (response?.data?.url) {
        setCurrentImageUrl(response.data.url);
      }
    } catch (error: any) {
      setCurrentImageUrl(relativedata.pic?.url);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Clean up preview URL
      if (previewUrl && previewUrl !== currentImageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* <PatientImage
            src={relativedata.pic?.url}
            alt={relativedata.pic?.alt || relativedata.name}
            name={relativedata.name}
            size="md"
          /> */}
          <div className="relative group">
              <img
                src={currentImageUrl || relativedata.pic?.url}
                alt={relativedata.pic?.alt || relativedata.name}
                className={`w-20 h-20 text-2xl rounded-full object-cover transition-all duration-300 ${
                  isUploading ? 'opacity-50' : 'opacity-100'
                }`}
              />
              
              {/* Edit Icon Overlay */}
              <button
                onClick={handleImageClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Update profile picture"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <EditIcon className="w-4 h-4" />
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          <div>
            <h5 className="font-medium text-gray-800 dark:text-white">
              {relativedata.name}
            </h5>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {relativedata.role || "Relative"}
              </span>
              {relativedata.mobileNumber && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {relativedata.mobileNumber}
                </span>
              )}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <InfoItemMini label="Age" value={relativedata.age?.toString()} />
            <InfoItemMini label="Sex" value={relativedata.sex === "other" ? relativedata.sexDetails : relativedata.sex} capitalize />
            <InfoItemMini label="Mobile" value={relativedata.mobileNumber} />
            <InfoItemMini label="Marital Status" value={relativedata.maritalStatus === "other" ? relativedata.maritalStatusDetails : relativedata.maritalStatus} capitalize />
            <InfoItemMini label="ID Proof Type" value={relativedata.idProofType==="other"?relativedata.idProofTypeDetails:relativedata.idProofType} capitalize />
            <InfoItemMini label="ID Proof Number" value={relativedata.idProofNumber} />
            {relativedata.email && <InfoItemMini label="Email" value={relativedata.email} />}
            {relativedata.address && (
              <div className="md:col-span-full">
                <InfoItemMini label="Address" value={relativedata.address} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const InfoItemMini = ({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
}) => (
  <div>
    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">
      {label}
    </label>
    <p
      className={`text-sm text-gray-800 dark:text-white ${
        capitalize ? "capitalize" : ""
      }`}
    >
      {value || "N/A"}
    </p>
  </div>
);