import { useState } from 'react';
import { PlusIcon, TrashBinIcon } from '../../icons';


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-IN', options);
};

export const AdditionalFeesManager = ({ fees, onAddFee, onRemoveFee }: any) => {
  const [newFee, setNewFee] = useState<any>({ name: '', amount: '' });

  const handleAddFee = () => {
    if (newFee.name && newFee.amount) {
      onAddFee(newFee);
      setNewFee({ name: '', amount: '' });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Fees</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{fees.length} fees added</span>
      </div>

      {/* Add New Fee Section */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee Name</label>
            <input
              type="text"
              placeholder="e.g., Doctor Fee, Lab Charges"
              value={newFee.name}
              onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter amount"
                value={newFee.amount}
                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddFee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fees List */}
      {fees.length > 0 ? (
        <div className="space-y-3">
          {fees.map((fee: any, index: any) => (
            <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{fee.name}</h3>
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">₹{fee.amount.toLocaleString()}</span>
                </div>
                {/* Date and Time Display */}
                {fee.addedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(fee.addedAt)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveFee(index)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-3"
              >
                <TrashBinIcon />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No additional fees added yet</p>
          <p className="text-sm mt-1">Click the add button to include extra charges</p>
        </div>
      )}
    </div>
  );
};