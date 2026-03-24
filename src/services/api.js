import axios from "axios";

export const api = axios.create({
  baseURL: "https://luminauratest.onrender.com/api/v1",
  withCredentials: true,
});
// "https://luminauratest.onrender.com/api/v1",
// http://localhost:3000/api/v1
