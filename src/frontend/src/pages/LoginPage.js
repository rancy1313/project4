import React, {useContext} from 'react'
import AuthContext from '../context/AuthContext'
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';


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
                { errors.detail ?
                    <Alert variant="danger">
                        <Alert.Heading>Login Error</Alert.Heading>
                        <p>
                            { errors.detail }
                        </p>
                    </Alert>
                : null }
                <Form.Group controlId='username'>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type='text'
                        value={form.username}
                        onChange={(e) => setField('username', e.target.value)}
                        isInvalid={!!errors.username}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        { errors.username }
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId='password'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type='password'
                        value={form.password}
                        onChange={(e) => setField('password', e.target.value)}
                        isInvalid={!!errors.password}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        { errors.password }
                    </Form.Control.Feedback>
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