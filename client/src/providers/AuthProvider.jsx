import PropTypes from 'prop-types'
import { createContext, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth'
import { app } from '../firebase/firebase.config'
import axios from 'axios'
export const AuthContext = createContext(null)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
const API_URL = import.meta.env.VITE_API_URL

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    // Firebase mutates the user object in place on profile updates; bump this to re-render consumers
    const [profileVersion, refreshProfile] = useReducer(n => n + 1, 0)

    const createUser = useCallback((email, password) => {
        setLoading(true)
        return createUserWithEmailAndPassword(auth, email, password)
    }, [])

    const signIn = useCallback((email, password) => {
        setLoading(true)
        return signInWithEmailAndPassword(auth, email, password)
    }, [])

    const signInWithGoogle = useCallback(() => {
        setLoading(true)
        return signInWithPopup(auth, googleProvider)
    }, [])

    const resetPassword = useCallback(email => sendPasswordResetEmail(auth, email), [])

    const logOut = useCallback(async () => {
        setLoading(true)
        try {
            await axios.get(`${API_URL}/logout`, { withCredentials: true })
        } finally {
            await signOut(auth)
        }
    }, [])

    const updateUserProfile = useCallback(async (name, photo) => {
        await updateProfile(auth.currentUser, {
            displayName: name,
            photoURL: photo,
        })
        refreshProfile()
    }, [])

    // Get token from server
    const getToken = async email => {
        const { data } = await axios.post(
            `${API_URL}/jwt`,
            { email },
            { withCredentials: true }
        )
        return data
    }

    // save user
    const saveUser = useCallback(async user => {
        const currentUser = {
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            email: user.email,
            role: 'user',
        }
        const { data } = await axios.put(`${API_URL}/user`, currentUser)
        return data
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async currentUser => {
            setUser(currentUser)
            if (currentUser) {
                // Wait for the auth cookie before protected queries start firing
                try {
                    await getToken(currentUser.email)
                } catch (err) {
                    console.error('Failed to get auth token', err)
                }
                saveUser(currentUser).catch(err => console.error('Failed to save user', err))
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [saveUser])

    const authInfo = useMemo(
        () => ({
            user,
            loading,
            setLoading,
            createUser,
            signIn,
            signInWithGoogle,
            resetPassword,
            logOut,
            updateUserProfile,
            saveUser,
        }),
        // profileVersion forces a new value after in-place profile updates
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, loading, profileVersion, createUser, signIn, signInWithGoogle, resetPassword, logOut, updateUserProfile, saveUser]
    )

    return (
        <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node,
}

export default AuthProvider
