import React, { useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
    let { setTokens, setUser } = useContext(AuthContext)
    let navigate = useNavigate()
    // get user object and tokens and set them to null, remove token from local storage
    // then navigate to login page
    let logoutUser = () => {
        setTokens(null)
        setUser(null)
        localStorage.removeItem('tokens')
        navigate("/login")
    }
    // on load of this component we log the user out
    useEffect(() => {
        logoutUser()
    }, [])
}

export default Logout