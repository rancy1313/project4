import AuthContext from '../context/AuthContext';
import { useEffect, useState, useContext } from 'react';

// botstrap / style imports
import Button from 'react-bootstrap/Button';
import Input from 'react-phone-number-input/input'
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import { Multiselect } from "multiselect-react-dropdown";
import 'react-phone-number-input/style.css';

const AccountInfo = () => {
    let { user } = useContext(AuthContext);
    let user_allergies = user.allergies.split("/");

    // set the available allergies to pass in the Multiselect
    const allergies = ['Milk', 'Egg', 'Fish', 'Crustacean Shell Fish', 'Tree Nuts', 'Wheat', 'Peanuts', 'Soybeans', 'Sesame'];

    // we have a base form set that will hold all the information from the user to send to the backend when completed
    const [form, setForm] = useState({'preferred_name': user.preferred_name, 'allergies': user_allergies});

    // if the data from the user is not up to specifications then there will be an error and the form will
    // not be sent to the backend
    const [errors, setErrors] = useState({});

    // this is used for our onChange function to update the form
    const setField = (field, value) => {
        // just change the field in the form
        setForm({
            ...form,
            [field]:value
        });
        // reset errors if there are no new errors
        if(!!errors[field])
        setErrors({
            ...errors,
            [field]:null
        });
    }

    // this is used for the onSelect function of the Multiselect component and just updates the form by form
    function setAllergies(selectedList, selectedItem) {
        setField('allergies', selectedList);
    }

    // this function is to validate the form when the user tries to submit all their info
    const validateForm = () => {

        // get certain fields from the form to check if there are any errors
        const { preferred_name } = form;
        const newErrors = {};

        // name cannot be null
        if (preferred_name === '') {
            newErrors.preferred_name = 'Please enter a preferred name.';
        }


        return newErrors;
    }

    return (
        <Form className="formSubmission">
            <Form.Group controlId='preferred_name_group'>
                <FloatingLabel
                    controlId="preferred_name"
                    label="Preferred Name"
                    className="mb-3"
                >
                    <Form.Control
                        htmlFor="preferred_name"
                        type='text'
                        value={form.preferred_name}
                        onChange={(e) => setField('preferred_name', e.target.value)}
                        isInvalid={!!errors.preferred_name}
                        placeholder="Preferred Name"
                    ></Form.Control>

                    {/* If data is invalid, show errors */}
                    <Form.Control.Feedback type='invalid'>
                        { errors.preferred_name }
                    </Form.Control.Feedback>
                </FloatingLabel>
            </Form.Group>

            {/* Multiselect component open source */}
            <p>Allergies</p>
            <Multiselect onSelect={setAllergies}
                         showArrow
                         options={allergies}
                         isObject={false}
                         selectedValues={form.allergies}
            />

            <Button
                type='submit'
                onClick={validateForm}
                className='my-2'
                variant='primary'>Sign Up</Button>


        </Form>
    );
}

export default AccountInfo;