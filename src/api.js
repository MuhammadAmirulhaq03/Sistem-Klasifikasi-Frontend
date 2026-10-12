// src/api.js
export const fetchDetections = async () => {
  try {
    const response = await fetch("http://localhost:5051/api/detections");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching detections:", error);
    return [];
  }
};
