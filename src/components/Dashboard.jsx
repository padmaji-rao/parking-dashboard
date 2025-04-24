import React, { useState, useEffect, useRef } from 'react';
import ParkingTable from './ParkingTable';
import { getDashboardStats } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableSpots: 0,
    availablePercent: 0,
    todayRevenue: 0,
    revenueGrowth: 0,
    vehicleGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});
  const previousStatsRef = useRef({});

  const fetchStats = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }

      const data = await getDashboardStats();
      
      if (isInitialLoad) {
        setStats(data);
        previousStatsRef.current = { ...data };
        setLoading(false);
        return;
      }
      
      // Compare with previous data to find changes
      const changes = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== previousStatsRef.current[key]) {
          changes[key] = true;
        }
      });
      
      // Update state
      setStats(data);
      setUpdatedFields(changes);
      
      // Save current data for next comparison
      previousStatsRef.current = { ...data };
      
      // Clear highlights after 3 seconds
      setTimeout(() => {
        setUpdatedFields({});
      }, 3000);
      
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      if (isInitialLoad) {
        setError("Failed to load dashboard statistics.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial data load
    fetchStats(true);
    
    // Refresh stats every minute
    const interval = setInterval(() => fetchStats(false), 60000);
    return () => clearInterval(interval);
  }, []);

  // CSS classes for text transition
  const getValueClass = (field) => {
    return updatedFields[field] 
      ? 'transition-all text-2xl duration-2000 text-emerald-700 font-bold'
      : 'transition-all text-2xl duration-2000 text-gray-900 font-semibold';
  };

  // Card highlight class
  const getCardClass = (field) => {
    return updatedFields[field]
      ? 'p-4 rounded-lg shadow-md border-l-4 border-emerald-500'
      : 'p-4 rounded-lg shadow-md';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-600">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={getCardClass('totalVehicles')}>
          <h2 className="text-lg font-semibold text-gray-500">Total Vehicles</h2>
          <p className={getValueClass('totalVehicles')}>
            {loading ? '...' : stats.totalVehicles}
          </p>
          <p className={`font-semibold text-lg ${stats.vehicleGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {loading ? '...' : `${stats.vehicleGrowth >= 0 ? '+' : ''}${stats.vehicleGrowth}%`}
          </p>
        </div>
        <div className={getCardClass('availableSpots')}>
          <h2 className="text-lg font-semibold text-gray-500">Available Spots</h2>
          <p className={getValueClass('availableSpots')}>
            {loading ? '...' : stats.availableSpots}
          </p>
          <p className={`text-gray-500 font-semibold text-lg ${getValueClass('availablePercent')}`}>
            {loading ? '...' : `${stats.availablePercent}%`}
          </p>
        </div>
        <div className={getCardClass('todayRevenue')}>
          <h2 className="text-lg font-semibold text-gray-500">Today's Revenue</h2>
          <p className={getValueClass('todayRevenue')}>
            {loading ? '...' : `Rs. ${stats.todayRevenue}`}
          </p>
          <p className={`font-semibold text-lg ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {loading ? '...' : `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`}
          </p>
        </div>
      </div>
      <ParkingTable />
    </div>
  );
};

export default Dashboard; 