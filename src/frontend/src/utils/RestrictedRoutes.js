import { Route, Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'


const RestrictedRoutes = ({children, ...rest}) => {
    let { user } = useContext(AuthContext)
    // if user does not exist then direct to the login page else allow use to access home page
    return(
        !user ? <Navigate to="/login" /> : <Outlet />
    )
}

export default RestrictedRoutes;