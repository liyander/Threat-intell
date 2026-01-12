import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: BACKEND_URL,
});

export const getLayer3Dashboard = async () => {
  try {
    const response = await api.get('/threats/layer3');
    // Unwrap the response to get the actual dashboard data
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching Layer 3 Dashboard:', error);
    return null;
  }
};

export const getLatestThreats = async () => {
  try {
    const response = await api.get('/threats/pulses');
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching Latest Threats:', error);
    return null;
  }
};

export const getLatestCVEs = async () => {
  try {
    const response = await api.get('/cve');
    return response.data.success ? response.data.cves : null;
  } catch (error) {
    console.error('Error fetching Latest CVEs:', error);
    return null;
  }
};

export const getRecentMalware = async () => {
  try {
    const response = await api.get('/threats/malware');
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching Recent Malware:', error);
    return null;
  }
};
