import { create } from 'zustand'
const useModelAPIStore = create((set) => ({
    apiKey: import.meta.env.VITE_API_KEY,
    model: import.meta.env.VITE_API_MODEL,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    apiProtocol: import.meta.env.VITE_API_PROTOCOL,
}))
export default useModelAPIStore