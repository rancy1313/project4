import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const Header = () => {

    let { user } = useContext(AuthContext);

    return (
        <div>
            {/* Navbar to display links based on if a user is logged in */}
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Nav className="me-auto">
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/" >Home</Nav.Link>
                                <Nav.Link as={Link} to="/account" >Account</Nav.Link>
                                <Nav.Link as={Link} to="/logout" >Logout</Nav.Link>
                            </>
                        ): (
                            <>
                                <Nav.Link as={Link} to="/login" >Login</Nav.Link>
                                <Nav.Link as={Link} to="/signup" >Sign Up</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Container>
            </Navbar>

        </div>
    )
}

export default Header;