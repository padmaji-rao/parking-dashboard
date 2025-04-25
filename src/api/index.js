import axios from 'axios';

// API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'https://parking-dashboard-frz78g7w3-padmaji-raos-projects.vercel.app/api';

// Get all parking records
export const getParkingData = async () => {
  try {
    console.log("API_URL===> ", API_URL);
    console.log("FROM ENV ===> ",process.env.REACT_APP_API_URL);
    const response = await axios.get(`${API_URL}/parking`);
    return response.data;
  } catch (error) {
    console.error('Error fetching parking data:', error);
    throw error;
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}; 
