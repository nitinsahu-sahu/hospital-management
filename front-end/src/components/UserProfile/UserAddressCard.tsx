// components/UserProfile/UserAddressCard.tsx
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

export default function UserAddressCard() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Address & Additional Info
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.address || "No address provided"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                UH ID / Employee ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.UH_ID || user?.employeeId || "N/A"}
              </p>
            </div>

            {user?.role === "doctor" && (
              <>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Registration Number
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user?.registrationNumber || "N/A"}
                  </p>
                </div>
              </>
            )}

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Account Status
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}