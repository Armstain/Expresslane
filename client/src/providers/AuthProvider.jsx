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

    // Exchange the Firebase ID token for the API's session cookie
    const getToken = async firebaseUser => {
        const idToken = await firebaseUser.getIdToken()
        const { data } = await axios.post(
            `${API_URL}/jwt`,
            { idToken },
            { withCredentials: true }
        )
        return data
    }

    // Create or update the signed-in user's profile. The API takes the email
    // and role from the session, so only profile fields are sent.
    const saveUser = useCallback(async user => {
        const profile = {
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
        }
        const put = () => axios.put(`${API_URL}/user`, profile, { withCredentials: true })
        try {
            return (await put()).data
        } catch (err) {
            // Right after sign-up the session cookie may not exist yet
            if (err.response?.status !== 401 || !auth.currentUser) throw err
            await getToken(auth.currentUser)
            return (await put()).data
        }
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async currentUser => {
            setUser(currentUser)
            if (currentUser) {
                // Wait for the session cookie and profile before protected queries start firing
                try {
                    await getToken(currentUser)
                    await saveUser(currentUser)
                } catch (err) {
                    console.error('Failed to start session', err)
                }
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
