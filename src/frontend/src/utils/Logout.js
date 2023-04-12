import React, { useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
    let { setAuthTokens, setUser } = useContext(AuthContext)
    let navigate = useNavigate()

    let logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate("/login")
    }

    useEffect(() => {
        logoutUser()
    }, [])


}

export default Logout