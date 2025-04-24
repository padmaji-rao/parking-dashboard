import React, { useState, useEffect, useRef } from 'react';
import { getParkingData } from '../api';

const ParkingTable = () => {
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedItems, setUpdatedItems] = useState({});
  const previousDataRef = useRef([]);

  const fetchData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      
      const newData = await getParkingData();
      
      if (isInitialLoad) {
        setParkingData(newData);
        previousDataRef.current = JSON.parse(JSON.stringify(newData));
        setLoading(false);
        return;
      }
      
      // Compare with previous data to find changes
      const changes = {};
      const updatedData = newData.map(newItem => {
        // Check if this item exists in previous data
        const existingItem = previousDataRef.current.find(
          oldItem => oldItem.vehicleNumber === newItem.vehicleNumber
        );

        if (!existingItem) {
          // This is a new item
          changes[newItem.vehicleNumber] = {
            isNew: true,
            changed: []
          };
          return newItem;
        }
        
        // Check which properties have changed
        const changedFields = [];
        if (existingItem.exitTime !== newItem.exitTime) changedFields.push('exitTime');
        if (existingItem.duration !== newItem.duration) changedFields.push('duration');
        if (existingItem.fee !== newItem.fee) changedFields.push('fee');
        if (existingItem.status !== newItem.status) changedFields.push('status');
        
        if (changedFields.length > 0) {
          changes[newItem.vehicleNumber] = {
            isNew: false,
            changed: changedFields
          };
        }
        
        return newItem;
      });
      
      // Update state
      setParkingData(updatedData);
      setUpdatedItems(changes);
      
      // Save current data as previous for next comparison
      previousDataRef.current = JSON.parse(JSON.stringify(updatedData));
      
      // Clear highlights after 3 seconds
      setTimeout(() => {
        setUpdatedItems({});
      }, 3000);
      
    } catch (err) {
      console.error("Error fetching parking data:", err);
      if (isInitialLoad) {
        setError("Failed to load parking data. Please try again later.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial data load
    fetchData(true);
    
    // Refresh data every minute (only changed values)
    const interval = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to determine if a field has changed for a specific item
  const isFieldChanged = (vehicleNumber, fieldName) => {
    if (!updatedItems[vehicleNumber]) return false;
    if (updatedItems[vehicleNumber].isNew) return true;
    return updatedItems[vehicleNumber].changed.includes(fieldName);
  };

  // Get CSS class for a field based on whether it changed
  const getFieldClass = (vehicleNumber, fieldName) => {
    return isFieldChanged(vehicleNumber, fieldName) 
      ? 'transition-all duration-2000 font-semibold text-emerald-700'
      : 'transition-all duration-2000 text-gray-800';
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-600">Current Parking Status</h2>
        <div className="flex justify-center items-center p-8">
          <p className="text-gray-500">Loading parking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-600">Current Parking Status</h2>
        <div className="flex justify-center items-center p-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-600">Current Parking Status</h2>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-4 px-6 text-left">Vehicle Number</th>
            <th className="py-4 px-6 text-left">Entry Time</th>
            <th className="py-4 px-6 text-left">Exit Time</th>
            <th className="py-4 px-6 text-left">Parking Duration</th>
            <th className="py-4 px-6 text-left">Parking Fee</th>
            <th className="py-4 px-6 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {parkingData.length > 0 ? (
            parkingData.map((data, index) => {
              const isNewRow = updatedItems[data.vehicleNumber]?.isNew;
              return (
                <tr 
                  key={`${data.vehicleNumber}-${index}`} 
                  className={`border-b ${isNewRow ? 'animate-pulse bg-emerald-50' : ''}`}
                >
                  <td className={`py-4 px-6 ${isNewRow ? 'font-semibold text-emerald-700' : 'text-gray-800'}`}>
                    {data.vehicleNumber}
                  </td>
                  <td className={`py-4 px-6 ${isNewRow ? 'font-semibold text-emerald-700' : 'text-gray-800'}`}>
                    {data.entryTime}
                  </td>
                  <td className={`py-4 px-6 ${getFieldClass(data.vehicleNumber, 'exitTime')}`}>
                    {data.exitTime}
                  </td>
                  <td className={`py-4 px-6 ${getFieldClass(data.vehicleNumber, 'duration')}`}>
                    {data.duration}
                  </td>
                  <td className={`py-4 px-6 ${getFieldClass(data.vehicleNumber, 'fee')}`}>
                    {data.fee}
                  </td>
                  <td className="py-4 px-6">  
                    <span 
                      className={`px-2 py-1 rounded-full text-md font-semibold 
                        ${data.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                        ${isFieldChanged(data.vehicleNumber, 'status') ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''}
                      `}
                    >
                      {data.status}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="py-4 px-6 text-center text-gray-500">
                No parking data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ParkingTable; 