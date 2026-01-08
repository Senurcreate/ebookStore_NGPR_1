import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile 
} from "firebase/auth";

// FIX 1: Import axios to fetch the role
import axios from '../utils/axios'; 

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    // Default to null so we know when it's not loaded yet
    const [userRole, setUserRole] = useState(null); 
    const [loading, setLoading] = useState(true);

    const signUpUser = async (email, password, username) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (username) {
            await updateProfile(userCredential.user, {
                displayName: username
            });
        }
        return userCredential;
    }

    const registerUser = async (email, password, username) => {
        return signUpUser(email, password, username);
    }

    const loginUser = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password)
    }

    const signInWithGoogle = async () => {
        return await signInWithPopup(auth, googleProvider)
    }

    const logout = () => {
        return signOut(auth)
    }

    // FIX 2: Fetch Role Logic inside useEffect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if(user) {
                try {
                    // 1. Get the token (ensures backend accepts request)
                    const token = await user.getIdToken();
                    
                    // 2. Fetch the user details from YOUR backend
                    // Note: Ensure axios is configured with the token interceptor 
                    // or pass headers here if needed.
                    const response = await axios.get('/users/me');
                    
                    // 3. Extract Role (Handle different response structures)
                    const role = response.data.role || response.data.data?.role || "user";
                    
                    console.log("AuthContext: User Role set to ->", role);
                    setUserRole(role);

                    // Optional: Merge role into currentUser object for easy access
                    user.role = role; 
                    setCurrentUser({...user}); 

                } catch (error) {
                    console.error("AuthContext: Failed to fetch user role", error);
                    setUserRole("user"); // Fallback
                }
            } else {
                setUserRole(null);
            }

            setLoading(false);
        })

        return () => unsubscribe();
    }, [])

    const value = {
        currentUser,
        loading,
        userRole, // Keep this for backward compatibility
        signUpUser, 
        registerUser,
        loginUser,
        signInWithGoogle,
        logout
    }
    
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}