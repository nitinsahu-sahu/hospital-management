import React from 'react';
import { ConsultationFees } from '../../types/consultationNew';
interface ConsultationFeesFormProps {
  fees: any;
  onChange: (field: keyof ConsultationFees, value: string) => void;
  isExisting: boolean;
}

export const ConsultationFeesForm: React.FC<ConsultationFeesFormProps> = ({ fees, onChange, isExisting }) => {
  const feeFields = [
    { key: 'emergencyConsultationFee' as const, label: 'Emergency Consultation Fee', color: 'red', placeholder: 'Enter amount' },
    { key: 'geneticConsultationFee' as const, label: 'Genetic Consultation Fee', color: 'purple', placeholder: 'Enter amount' },
    { key: 'opdConsultationFee' as const, label: 'OPD Consultation Fee', color: 'green', placeholder: 'Enter amount' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Consultation Fees</h2>
        {isExisting && <span className="text-xs text-gray-500 dark:text-gray-400">Editing existing consultation</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free of Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Free of Cost</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
            <input
              type="number"
              value={fees.freeOfCost}
              readOnly
              className="w-full pl-8 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Always Free (₹0)</p>
        </div>

        {/* Dynamic Fee Fields */}
        {feeFields.map(({ key, label, color, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                placeholder={placeholder}
                value={fees[key]}
                onChange={(e) => onChange(key, e.target.value)}
                className={`w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-${color}-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};