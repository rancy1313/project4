import { Route, Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

//const PrivateRoute = ({children, ...rest}) => {
const PrivateRoute = ({children, ...rest}) => {
    let { user } = useContext(AuthContext)
    // <Route {...rest}>{!user ? <Navigate to="/login" /> :   children}</Route>
    return(
        !user ? <Navigate to="/login" /> : <Outlet />
    )
}

export default PrivateRoute;