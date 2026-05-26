import React from 'react';

interface TotalAmountCardProps {
  total: number;
}

export const TotalAmountCard: React.FC<TotalAmountCardProps> = ({ total }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-indigo-800 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Total Amount</h3>
          <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">Including all fees and charges</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">₹{total.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};