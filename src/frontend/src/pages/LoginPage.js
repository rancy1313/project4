import React, {useContext} from 'react'
import AuthContext from '../context/AuthContext'
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';


const LoginPage = () => {

    let {loginUser} = useContext(AuthContext)
    // we have a base form set that will hold all the information from the user to send to the backend when completed
    const [form, setForm] = useState({'username': '', 'password': ''});
    const [errors, setErrors] = useState({});

    const setField = (field, value) => {
        // just change the field in the form
        setForm({
            ...form,
            [field]:value
        })
        // reset errors if there are no new errors
        if(!!errors[field])
        setErrors({
            ...errors,
            [field]:null
        })
    }

    return (
        <div>
            <Form className="formSubmission" onSubmit={(e) => loginUser(e, errors, setErrors)}>
                <h1 align="center">Login</h1>
                {/* show error warning if user failed to log in with the correct credentials */}
                { errors.detail ?
                    <Alert variant="danger">
                        <Alert.Heading>Login Error</Alert.Heading>
                        <p>
                            { errors.detail }
                        </p>
                    </Alert>
                : null }
                {/* a form that handles the user's username and password */}
                <Form.Group controlId='username_group'>
                    <FloatingLabel
                        controlId="username"
                        label="Username"
                        className="mb-3"
                    >
                        <Form.Control
                            htmlFor="username"
                            type='text'
                            value={form.username}
                            onChange={(e) => setField('username', e.target.value)}
                            isInvalid={!!errors.username}
                            placeholder="username"
                        ></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            { errors.username }
                        </Form.Control.Feedback>
                    </FloatingLabel>
                </Form.Group>
                <Form.Group controlId='password_group'>
                    <FloatingLabel
                        controlId="password"
                        label="Password"
                        className="mb-3"
                    >
                        <Form.Control
                            htmlFor="password"
                            type='password'
                            value={form.password}
                            onChange={(e) => setField('password', e.target.value)}
                            isInvalid={!!errors.password}
                            placeholder="password"
                        ></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            { errors.password }
                        </Form.Control.Feedback>
                    </FloatingLabel>
                </Form.Group>
                <Form.Group>
                    <Button
                        type='submit'
                        className='my-2'
                        variant='primary'>Sign Up</Button>
                </Form.Group>
            </Form>
        </div>
    )
}

export default LoginPage