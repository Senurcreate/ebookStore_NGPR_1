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

// Import axios to fetch the role
import axios from '../utils/axios'; 

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); 
    const [loading, setLoading] = useState(true);

    // --- UPDATED SIGN UP FUNCTION  ---
    const signUpUser = async (email, password, username) => {
        // Create the user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        if (username) {
            //Update the profile on Firebase immediately
            await updateProfile(userCredential.user, {
                displayName: username
            });

            //CRITICAL: Reload the user instance to update local state
            await userCredential.user.reload();

            //CRITICAL: Force Token Refresh
            // This destroys the old "nameless" token and gets a NEW one 
            // that includes the 'displayName'. The backend will now see the name.
            await userCredential.user.getIdToken(true);
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

    // --- EXISTING ROLE FETCHING LOGIC ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if(user) {
                try {
                    // Get the token (ensures backend accepts request)
                    const token = await user.getIdToken();
                    
                    // Fetch the user details from YOUR backend
                    const response = await axios.get('/users/me');
                    
                    // Extract Role
                    const role = response.data.role || response.data.data?.role || "user";
                    
                    console.log("AuthContext: User Role set to ->", role);
                    setUserRole(role);

                    // Merge role into currentUser object
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
        setCurrentUser,
        loading,
        userRole,
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