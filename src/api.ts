import axios from 'axios'

// When deployed on Vercel together, the backend is under the same domain at /api
const API_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})
