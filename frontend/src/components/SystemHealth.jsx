import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server } from 'lucide-react';

const SystemHealth = ({ darkMode }) => {
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await axios.get('/health');
      setHealth(res.data);
    } catch (error) {
      console.error('Failed to fetch health');
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold flex items-center mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <Activity className="mr-2 text-blue-500" /> API Gateway Health
        </h3>
        
        {health && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</div>
              <div className={`text-lg font-bold ${health.status === 'UP' ? 'text-green-500' : 'text-yellow-500'}`}>
                {health.status}
              </div>
            </div>
            
            {Object.entries(health.services || {}).map(([service, status]) => (
              <div key={service} className={`p-4 rounded-lg border flex justify-between items-center ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center">
                  <Server className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`font-medium capitalize ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{service}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;
