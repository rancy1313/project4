import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'

import Header from './components/Header'
import UserHomePage from './pages/UserHomePage'
import LoginPage from './pages/LoginPage'
import RestrictedRoutes from './utils/RestrictedRoutes'
import SignUpPage from './pages/SignUpPage'
import Logout from './utils/Logout'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
    return (
        <div className="App">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <BrowserRouter>
                <AuthProvider>
                    {/* Display the navbar */}
                    <Header />
                    {/* Declare the routes */}
                    <Routes>
                        {/* Public routes available when user is not logged in */}
                        <Route element={<LoginPage />} path="/login" />
                        <Route element={<Logout />} path="/logout" />
                        <Route element={<SignUpPage />} path="/signup" />

                        {/* Routes only available to users that are logged in */}
                        <Route element={<RestrictedRoutes />}>
                            <Route exact path='/' element={<UserHomePage />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
