import axios from 'axios'
import { useEffect } from 'react'
import useAuth from './useAuth'
import { useNavigate } from 'react-router-dom'

export const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

const useAxiosSecure = () => {
    const { logOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const interceptor = axiosSecure.interceptors.response.use(
            res => res,
            async error => {
                // Only an expired or missing session logs out; 403 just means "not allowed"
                if (error.response?.status === 401) {
                    await logOut()
                    navigate('/login')
                }
                return Promise.reject(error)
            }
        )
        // Remove on unmount so interceptors don't pile up across components
        return () => axiosSecure.interceptors.response.eject(interceptor)
    }, [logOut, navigate])

    return axiosSecure
}

export default useAxiosSecure
