import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import UserHomePage from './pages/UserHomePage'
import LoginPage from './pages/LoginPage'
import PrivateRoutes from './utils/PrivateRoutes'

import Logout from './utils/Logout'


function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <Header />
                    <Routes>
                        <Route element={<PrivateRoutes/>}>
                            <Route path='/' element={<UserHomePage />} />
                        </Route>

                        <Route element={<LoginPage />} path="/login"/>
                        <Route element={<Logout />} path="/logout"/>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
