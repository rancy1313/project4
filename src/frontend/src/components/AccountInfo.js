import AuthContext from '../context/AuthContext';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// botstrap / style imports
import Button from 'react-bootstrap/Button';
import Input from 'react-phone-number-input/input'
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import { toast } from 'react-toastify';
import { Multiselect } from "multiselect-react-dropdown";
import 'react-phone-number-input/style.css';


const AccountInfo = () => {
    let { user, updateTokens } = useContext(AuthContext);
    let user_allergies = user.allergies.split("/");

    let navigate = useNavigate();

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

        //  Valid characters are uppercase letters (A-Z), lowercase letters (a-z),
        //  numbers (0-9), period (.), apostrophe ('), hyphen/dash (-), and spaces.
        //  No other characters are allowed. - Government
        const restricted_chars_username = "`~!@#$%^&*()_=+,;:\\|][{}/?><]\"".split("")
        var diff = restricted_chars_username.filter(char => !preferred_name.includes(char));

        // acceptable $%^&*-_+=~`|/,.;:"'{}[]()!@
        // if the diff is 30 then no restricted chars were used
        if (diff.length !== restricted_chars_username.length) {
            newErrors.preferred_name = ['No special chars are allowed besides period (.), hyphen/dash (-), apostrophe (\'), and spaces.'];
        }

        // check if the user is trying to send the same data to the backend
        // we do a length check because if the length is different then the data is different
        // we check for both preferred name and allergies
        if (form.preferred_name === user.preferred_name && form.allergies.join("/").length === user.allergies.length) {
            // sort the lists and loop through them. list_same starts as true so if a different
            // element is found then we set it to false and can break to save iterations
            let list_same = true;
            const sortedArr1 = form.allergies.sort();
            const sortedArr2 = user.allergies.split("/").sort();
            for (let i = 0; i < sortedArr1.length; i++) {
                if (sortedArr1[i] !== sortedArr2[i]) {
                    list_same = false;
                    break;
                }
            }

            // if list_same is true still the notify user that no data changed and add an error to stop submission
            if (list_same) {
                toast.error("No changes were detected.");
                newErrors.no_changes = ["This message is to stop the data from being sent to the backend."]
            }
        }

        return newErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const formErrors = validateForm();

        // if formErrors errors keys are greater than 0 then there are errors and can't submit form
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
        } else {

            // make a copy of the form because I want to encrypt the data
            // it is easier to encrypt a copy then to use the useState functions on the form
            let copy_form = {"username": btoa(user.username), "preferred_name": btoa(form["preferred_name"]), "allergies": []}

            // if there are no allergies then push None option
            if (form.allergies.length === 0) {
                form.allergies.push("None")
            }

            // encrypt allergies separately
            for (var i = 0; i < form.allergies.length; i++)
                copy_form.allergies.push(btoa(form.allergies[i]))

            // we send encrypted copy form to the back end
            const submit_request = await fetch("http://127.0.0.1:8000/api/update-user-form/", {
                                                 method: "PUT",
                                                 headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(copy_form)})

            let data = await submit_request.json();

            // if success exists then alert user account was created and redirect to login page
            if (data.success) {
                // DONT FORGET TO UPDATE THE USER AUTH TOKEN
                updateTokens();

                // alert user account was created successfully
                toast.success("Account info updated!")
            } else {
                // set errors
                setErrors(data);
            }
        }
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

            {/* Multiselect component open source. If user has no allergies then do not preselect an option */}
            <p>Allergies</p>
            <Multiselect onSelect={setAllergies}
                         onRemove={setAllergies}
                         showArrow
                         options={allergies}
                         isObject={false}
                         selectedValues={(form.allergies[0] === "None" ? null : form.allergies)}
            />

            <Button
                type='submit'
                onClick={(e) => handleSubmit(e)}
                className='my-2'
                variant='primary'>Sign Up</Button>

        </Form>
    );
}

export default AccountInfo;