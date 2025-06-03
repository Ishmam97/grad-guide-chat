
import React from 'react';
import { BarChart3 } from 'lucide-react';

const QuickStats = () => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-center mb-3">
        <BarChart3 className="w-5 h-5 mr-2" style={{ color: '#245d7a' }} />
        <h3 className="font-semibold text-gray-800">Quick Stats</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Questions Today:</span>
          <span className="font-medium text-blue-600">12</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Reports Submitted:</span>
          <span className="font-medium text-green-600">3</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Notes Created:</span>
          <span className="font-medium text-purple-600">8</span>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
