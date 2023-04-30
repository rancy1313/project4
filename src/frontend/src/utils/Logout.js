import React, { useContext, useEffect, useRef } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';


const Logout = () => {
    const { setTokens, setUser, user } = useContext(AuthContext);
    const navigate = useNavigate();
    // Initialize the ref to false
    const isToastShown = useRef(false);

    const logoutUser = () => {
        setTokens(null);
        setUser(null);
        localStorage.removeItem('tokens');
        navigate('/login');
    }

    useEffect(() => {
        logoutUser();
        const message = `Logout successful! Goodbye ${user.preferred_name}.`;
        if (!isToastShown.current) {
            toast.success(message);
            // Set the ref to true after showing the toast
            isToastShown.current = true;
        }
        // Add user.preferred_name as a dependency to make sure the effect is triggered on every logout
    }, [user.preferred_name]);

    // This component doesn't render anything, so return null
    return null;
}


export default Logout