import axios from 'axios'

// For endpoints anyone can read (home page stats, top delivery men).
// Unlike axiosSecure, a 401 here never logs the visitor out.
export const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})
