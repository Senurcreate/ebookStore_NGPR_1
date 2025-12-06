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

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}

const googleProvider = new GoogleAuthProvider();

// authProvider
export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // register a user with email/password (SIGN UP)
    const signUpUser = async (email, password, username) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with username
        if (username) {
            await updateProfile(userCredential.user, {
                displayName: username
            });
        }
        
        return userCredential;
    }

    // Alternative name for consistency (same as above)
    const registerUser = async (email, password, username) => {
        return signUpUser(email, password, username);
    }

    // login the user (SIGN IN)
    const loginUser = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password)
    }

    // sign up with google (GOOGLE SIGN UP)
    const signInWithGoogle = async () => {
        return await signInWithPopup(auth, googleProvider)
    }

    // logout the user
    const logout = () => {
        return signOut(auth)
    }

    // manage user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);

            if(user) {
                const {email, displayName, photoURL} = user;
                const userData = {
                    email, 
                    username: displayName, 
                    photo: photoURL
                } 
                
            }
        })

        return () => unsubscribe();
    }, [])

    const value = {
        currentUser,
        loading,
        signUpUser, 
        registerUser, // Keep this for backward compatibility
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