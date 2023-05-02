import { useContext , useRef, useEffect } from 'react';
import AuthContext from '../context/AuthContext'
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';


const LoginPage = () => {

    let {loginUser} = useContext(AuthContext)
    // we have a base form set that will hold all the information from the user to send to the backend when completed
    const [form, setForm] = useState({'username': '', 'password': ''});
    const [errors, setErrors] = useState({});
    // Initialize the ref to false
    const isToastShown = useRef(false);

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

    // this function is used to trigger useEffect to reset the alert msg
    // due to how data flows in react we need to cause the error dependency
    // to trigger after errors.detail is set and then we can display the alert
    const resetAlert = () => {
        setErrors(errors);
    }

    useEffect(() => {
        // alerts display twice because of rendering so we useRef to make sure it displays once
        if (!isToastShown.current && errors.detail) {
            toast.error("No active account found with the given credentials.");
            // Set the ref to true after showing the toast
            isToastShown.current = false;
        }
    }, [errors])


    return (
        <div>
            <Form className="formSubmission" onSubmit={(e) => loginUser(e, errors, setErrors)}>
                <h1 align="center">Login</h1>

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
                        variant='primary'
                        onClick={resetAlert}
                        >Sign Up</Button>
                </Form.Group>
            </Form>
        </div>
    )
}

export default LoginPage