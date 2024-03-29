import { useState, useEffect } from 'react';

// botstrap / style imports
import Button from 'react-bootstrap/Button';
import Input from 'react-phone-number-input/input'
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import { Multiselect } from "multiselect-react-dropdown";
import 'react-phone-number-input/style.css';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


function SignUpPage() {

    // set the available allergies to pass in the Multiselect
    const allergies = ['Milk', 'Egg', 'Fish', 'Crustacean Shell Fish', 'Tree Nuts', 'Wheat', 'Peanuts', 'Soybeans', 'Sesame'];

    // used to trigger handleSubmit
    const [formValidation, setFormValidation] = useState(0);

    // navigate to login page if form was submitted successfully
    let navigate = useNavigate();

    // set the date of birth value here to preset the date of birth option to current date
    var dateObj = new Date();
    //months from 1-12
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newDate = year + "-" + month.toString().padStart(2, '0') + "-" + day.toString().padStart(2, '0');



    // we have a base form set that will hold all the information from the user to send to the backend when completed
    const [form, setForm] = useState({'dob': newDate, 'preferred_name': '', 'username': '', 'password': '',
                                      'confirm_password': '', 'allergies': [], 'phone_number': '',
                                      'user_addresses': {'delivery_address1': {'address_name': '', 'city': '',
                                      'address': '', 'zipcode': ''}}});

    // if the data from the user is not up to specifications then there will be an error and the form will
    // not be sent to the backend
    const [errors, setErrors] = useState({});

    // this is to shorten the code needed to get the current address which is the address that is currently being edited
    const current_address = form['user_addresses'][Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]];

    // this is used for our onChange function to update the form
    const setField = (field, value) => {
        /*
           1. if it is a delivery address change then those are updated differently
              b/c they are kept in a object.
           2. We want to update the current address the user is editing which is the last item in the
              user_addresses
        */
        if (field in form['user_addresses'][Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]]) {
            // assign delivery_address to tmp var
            const tmp = form.user_addresses;

            // Capitalize only the first letter
            value = value.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

            // tmp and form.delivery_address point to same dict,
            // but changes are not saved so we use the setForm func to save the changes
            tmp[Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]][field] = value;

            // zipcodes of 5 digits currently only accepted for now
            if (field === "zipcode" && /^\d+$/.test(value) && value.length <= 5 || field !== "zipcode")
                setForm({
                    ...form,
                    'user_addresses':tmp
                });
        } else {
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
    }

    // only addresses that were saved by the user will be sent to the backend
    const [saved_addresses, setSaved_addresses] = useState([]);

    function setPhoneNumber(value) {

        // the phone number component will return undefined if it becomes empty
        if (value === undefined)
            // so we make sure it get changed to empty string if that happens
            value = "";

        // update the form
        setForm({
            ...form,
            'phone_number':value
        });

        // delete the errors
        if(!!errors['phone_number'])
        setErrors({
            ...errors,
            'phone_number':null
        });

        // check if value is not null first to make sure .length doesn't crash
        if (value && value.length > 12) {
            const newErrors = {'phone_number': 'Phone number is too long.'};
            setErrors(newErrors);
        }
    }

    // this is used for the onSelect function of the Multiselect component and just updates the form by form
    function setAllergies(selectedList, selectedItem) {
        setField('allergies', selectedList);
    }

    // this function is to trigger the useEffect function to make a call to the back end
    const callUseEffect = e => {
        e.preventDefault();
        // trigger useEffect by updating userValidation
        setFormValidation(formValidation+1);
    }

    // this component is to format the saved addresses
    function AddressCards({ index, id, address_name, city, address, zipcode }) {
        return (
            <Card style={{ width: '23rem' }}>
                <div id={'card_'+id}>
                    <Card.Body>
                        <Card.Title>{ index + 1 }. { address_name }</Card.Title>
                        <Card.Text>{ address }, { city } { zipcode }.</Card.Text>
                    </Card.Body>
                </div>
                <EditPage index={index} id={id} address_name={address_name} city={city} address={address} zipcode={zipcode} />
            </Card>
        );
    }


    // this is format for the edit page that replaces the address when the user clicks the edit button
    function EditPage({ index, id, address_name, city, address, zipcode }) {

        // we use editForm as a temporary new address object to update the old address
        const [editForm, setEditForm] = useState({ 'id': id, 'address_name': address_name, 'city': city,
                                                 'address': address, 'zipcode': zipcode });

        const setEditFormValues = (field, value) => {
            // Capitalize only the first letter
            var new_value = value.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

            // zipcodes of 5 digits currently only accepted for now
            if (field === "zipcode" && /^\d+$/.test(value) && value.length <= 5 || field !== "zipcode")
                setEditForm({
                    ...editForm,
                    [field]: new_value
                });
        }

        return (
        <>
            {/* Card displaying the saved address info */}
            <Card.Body>
                <button className={'btn btn-danger'} onClick={(e) => deleteAddress(e, id)}>Delete</button>{' '}
                <button id={'editButton_'+id} className={'btn btn-warning'} onClick={(e) => { editAddress(e, id, editForm) } }>Edit</button>
                <div id={'div_'+id}>
                    <Form.Control isInvalid={!!errors[('editField_'+id)]} hidden/>
                    <Form.Control.Feedback type='invalid'>
                        { errors[('editField_'+id)] }
                    </Form.Control.Feedback>
                </div>
            </Card.Body>

            {/* A page to edit the saved address that is toggled */}
            <div className={'editPage hidden'} id={'editPage_'+id}>
                <Card.Title>Delivery Address { index + 1 }</Card.Title>
                <Form.Group controlId={'edit_'+id}>
                    <Form.Label>Name: { address_name }</Form.Label>
                    <Form.Control
                        placeholder='Save address as...'
                        value={editForm.address_name}
                        onChange={(e) => setEditFormValues("address_name", e.target.value)}
                        isInvalid={!!errors['address_name_' + id]}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        { errors['address_name_' + id] }
                    </Form.Control.Feedback>
                    <br />
                    <Form.Label>City: { city }</Form.Label>
                    <Form.Control
                        placeholder='City'
                        value={editForm.city}
                        onChange={(e) => setEditFormValues("city", e.target.value)}
                        isInvalid={!!errors['city_' + id]}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        { errors['city_' + id] }
                    </Form.Control.Feedback>
                    <br />
                    <Form.Label>Address: { address }</Form.Label>
                    <Form.Control
                        placeholder='Address'
                        value={editForm.address}
                        onChange={(e) => setEditFormValues("address", e.target.value)}
                        isInvalid={!!errors['address_' + id]}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        { errors['address_' + id] }
                    </Form.Control.Feedback>
                    <br />
                    <Form.Label>Zipcode: { zipcode }</Form.Label>
                    <Form.Control
                        placeholder='Zipcode'
                        value={editForm.zipcode}
                        onChange={(e) => setEditFormValues("zipcode", e.target.value)}
                        isInvalid={!!errors['zipcode_' + id]}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        { errors['zipcode_' + id] }
                    </Form.Control.Feedback>
                </Form.Group>
            </div>
        </>
        );
    }

    // will delete any of the saved addresses of the user by searching for it with an id of the address
    function deleteAddress(e, id) {
        e.preventDefault();
        // delete the address
        delete form.user_addresses[id];
        // remove the address from the saved address list b/c then it wont be pass to the backend
        setSaved_addresses(saved_addresses.filter(address => address !== id));
    }

    // this function is to use the temporary editForm to update the corresponding address in the form
    function editAddress(e, id, editForm) {
        e.preventDefault();

        // we delete any of the previous errors as they were not saved
        delete errors[('editField_' + id)];

        // this div holds the errors and we toggle a hidden class to hide the errors when the user tries to edit again
        const div = document.getElementById('div_' + id);
        // the edit page has a hidden class that is toggled whne the edit button is pressed
        const edit_page = document.getElementById('editPage_' + id);
        // the address that the user is trying to edit is held in a card that has a hidden class that is toggled
        // to then show the edit page instead
        const card = document.getElementById('card_' + id);
        // we change the inner text/style from edit to save changes
        const edit_button = document.getElementById('editButton_' + id);
        // we hold any errors in here to update the errors object
        const newErrors = {};

        for (const field in editForm) {
            // if a field is empty then we throw an error and changes are not saved
            if (editForm[field] === '') {
                newErrors[('editField_'+id)] = 'Changes were not saved because a field was empty.';
                setErrors(newErrors);
                // break b/c the error would be the same for whichever field it was
                break;
            }
        }

        // if there are no errors then proceed with updating the address
        if (Object.keys(newErrors).length === 0) {
            // toggle the div to hide the errors
            div.classList.toggle('hidden');
            // toggle the edit page to hide it
            edit_page.classList.toggle('hidden');
            // toggle the card to show the address again in the card component
            card.classList.toggle('hidden');
            // change the styles of the edit button back to yellow
            edit_button.classList.toggle('btn-warning');
            edit_button.classList.toggle('btn-success');

            // if edit page is hidden then we can save the changes
            if (edit_page.classList.contains('hidden')) {
                // change the text back to edit so the user can edit again
                edit_button.innerText = 'Edit';
                form.user_addresses[id] = editForm;
                setForm({
                    ...form,
                    'user_addresses': form.user_addresses
                });
            } else {
                // else change the text to save changes
                edit_button.innerText = 'Save Changes';
            }
        }
    }

    // this function is to get a list of the addresses to map over them and display them in cards
    function getAddresses() {
        // this list is to collect the addresses
        const addresses = [];

        // loop through the keys to append them to a list and return them
        for (const key in form.user_addresses) {

            // we do not want the latest address because that is the one that is being saved
            if (key !== Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]) {
                addresses.push(key);
            }
        }

        return addresses;
    }


    // this function is for the user to save an address
    function saveNewAddress(e) {
        e.preventDefault();

        // hold any any errors to update the errors object
        const newErrors = {};

        // loop through the fields in the current address and check if any of them are empty
        for (const field in current_address) {
            // if empty the throw an error
            if (current_address[field] === '') {
                // add a new key/value with the key letting the user know which specific field is still empty
                newErrors[field] = 'Please fill out all fields before adding a new address.';
            }
        }

        // loop through all the saved addresses' name and if they match the current one then throw an error
        // addresses are supposed to have unique names
        for (const key in form.user_addresses) {
            // make the string upper to remove case sensitivity when comparing names
            // if the name matches throw error but make sure that the current address is also not the current one being looped
            if (current_address.address_name.toUpperCase() === form.user_addresses[key].address_name.toUpperCase() && current_address !== form.user_addresses[key]) {
                newErrors['address_name'] = 'This name has been used for a previous address. Please choose a different name.';
            }
        }

        // if there are any errors then alert the user
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            // update saved addresses list to include the new address
            setSaved_addresses(saved_addresses => [...saved_addresses, Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]]);
            // if there are no errors then we add a new address
            // we cannot directly change the form so we assign it to a tmp var to then reassign in setForm function
            const tmp = form.user_addresses;

            //    We need to create a new delivery_address key in the form's user_addresses object. To do so, I set it
            //    up to retrieve the last key in the object, strip 'delivery_address' from the key name to get left with
            //    the integer id of that key, and then add 1 to that to name the new key. We do this because when a key
            //    is deleted, it will change the number of existing keys, so I just pull most recent one to increment
            //    1 as to not use the name of an existing key.

            tmp['delivery_address' + (parseInt(Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1].replace('delivery_address', '')) + 1)]
                                                        = {'address_name': '', 'city': '', 'address': '', 'zipcode': ''};
            // replace the old user_addresses with a new one that has the new address saved
            setForm({
                    ...form,
                    'user_addresses':tmp
            });

            // loop through the keys in the current address to delete the old errors
            for (const key in current_address) {
                delete errors[key];
            }
        }
    }

    // this is to calculate the user's age based on the inputed date
    function getAge(userBirthday) {

        // get the current day
        let today = new Date();
        // get the day of the birthday
        let birthDay = new Date(userBirthday);
        // calculate the difference in months
        let months = today.getMonth() - birthDay.getMonth();
        // calculate the difference in years
        let calculatedAge = today.getFullYear() - birthDay.getFullYear();

        // check if we need to subtract a year to give accurate age because subtracting by year doesn't take months into account
        if ((birthDay.getDate() > today.getDate() && months === 0) || (months < 0)) {
            calculatedAge--;
        }

        return calculatedAge;
    }

    // split it so that it calls two functions and then for user/pass
    // always call handle submit
    async function fetchData() {

        let encoded_username = btoa(form.username)

        let encoded_phone_number = btoa(form.phone_number)

        // do backend check to make sure phone_number is not taken
        const unique_field_request = await fetch("http://127.0.0.1:8000/api/validate-unique-fields/", {
                                                 method: "POST",
                                                 headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({"encoded_username": encoded_username,
                                                                      "encoded_phone_number":  encoded_phone_number})})
        let data = await unique_field_request.json();

        // validate the form to see if there are any errors.
        // pass backend response to throw errors if needed
        const formErrors = validateForm(data);
        handleSubmit(formErrors);
    }

    // useEffect will be used to validate the form on the backend for username/phone number
    useEffect(() => {

        // call handle submit with form errors if formValidation is not 0
        // so do noy fetch data on page first render
        if (formValidation !== 0)
            fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formValidation])

    // this function is to validate the form when the user tries to submit all their info
    const validateForm = ({ username_request, phone_number_request }) => {

        // get certain fields from the form to check if there are any errors
        const { dob, preferred_name, username, password, confirm_password, phone_number, user_addresses } = form;
        const newErrors = {};

        // if user less than 18 years of age throw error b/c user is too young
        if (getAge(dob) < 18) {
            newErrors.dob = 'You need to be at least 18 years old.';
        }

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

        // username cannot be null
        if (username === '') {
            newErrors.username = 'Please enter a username.';
        }

        // check if username is already taken
        if (username_request === 'Found') {
            newErrors.username = 'Username is already taken.';
        }

        // same as preferred_name
        diff = restricted_chars_username.filter(char => !username.includes(char));

        // acceptable $%^&*-_+=~`|/,.;:"'{}[]()!@
        // if the diff is 30 then no restricted chars were used
        if (diff.length !== restricted_chars_username.length) {
            newErrors.username = ['No special chars are allowed besides period (.), hyphen/dash (-), apostrophe (\'), and spaces.'];
        }

        // password must be at least 8 chars and at most 25 chars
        if (8 > password.length || password.length > 25) {
            // this is the first error checked, we can just initialize it
            newErrors.password = ['Be between 8 and 25 characters.'];
        }

        // password and confirm password must match
        if (password !== confirm_password) {
            newErrors.confirm_password = 'Passwords must match.';
        }

        // make sure password has at least 1 lower case letter
        if (!/[a-z]/.test(password)) {
            // passwords can have multiple errors, so depending on if it is the first or not we push or initialize
            if (newErrors.password)
                newErrors.password.push('Contain 1 lower case letter.');
            else {
                newErrors.password = ['Contain 1 lower case letter.']
            }

        }

        // calculate difference to see if no special chars were used
        const acceptable_chars = "$%^&*_+=~`|/,;:!@".split("")

        diff = acceptable_chars.filter(char => !password.includes(char));

        // acceptable $%^&*-_+=~`|/,.;:"'{}[]()!@
        // if the diff is 29 then no special chars were used
        if (diff.length === acceptable_chars.length) {
            // passwords can have multiple errors, so depending on if it is the first or not we push or initialize
            if (newErrors.password)
                newErrors.password.push('Contain one of the following chars (\'$%^&*_+=~`|/,;:\"!@).');
            else {
                newErrors.password = ['Contain one of the following chars (\'$%^&*_+=~`|/,;:\"!@).']
            }
        }

        // I am restricting these chars for now more for testing purposes
        // until I research a bit more on data sanitization
        const restricted_chars = "'\"<>?#\\-.{}[]()".split("")
        diff = restricted_chars.filter(char => !password.includes(char));

        // Still researching which chars to restrict. For now, these are some placeholders.
        // restricted <>?#-.@\
        if (diff.length !== restricted_chars.length) {
            // passwords can have multiple errors, so depending on if it is the first or not we push or initialize
            if (newErrors.password)
                newErrors.password.push('Restricted char detected.');
            else {
                newErrors.password = ['Restricted char detected.']
            }
        }

        // make sure password has at least 1 capital letter
        if (!/[A-Z]/.test(password)) {
            // passwords can have multiple errors, so depending on if it is the first or not we push or initialize
            if (newErrors.password)
                newErrors.password.push('Contain 1 capital letter.');
            else {
                newErrors.password = ['Contain 1 capital letter.']
            }
        }

        // make sure password has at least 1 digit
        if (!/[0-9]/.test(password)) {
            // passwords can have multiple errors, so depending on if it is the first or not we push or initialize
            if (newErrors.password)
                newErrors.password.push('Contain 1 digit.');
            else {
                newErrors.password = ['Contain 1 digit.']
            }
        }

        // check for spaces in the password
        if (password.indexOf(' ') >= 0) {
            // passwords can have multiple errors, so depending on if it is the first or not we push or initialize
            if (newErrors.password)
                newErrors.password.push('Not contain spaces.');
            else {
                newErrors.password = ['Not contain spaces.']
            }
        }

        // phone number must be at least 12 digits
        if (phone_number.length > 0 && phone_number.length < 12) {
            newErrors.phone_number = 'Phone number is too short.';
        } else if (phone_number.length === 0) {
            // phone number cannot be null
            newErrors.phone_number = 'Please enter a phone number.';
        } else {
            // phone numbers should be unique for all users
            if (phone_number_request === 'Found') {
                newErrors.phone_number = 'Phone number is already taken.';
            }
        }

        /*
           I am deleting any addresses that were not specifically saved by the user. If the
           the user filled in all the fields in the delivery address form then no errors
           will get triggered, and the address will be saved. However, I only want to store
           addresses the user specifically chose to save.
        */
        // We only do this if there are no errors because this will delete the current form
        // since the current form is always temporary and never saved
        const tmp = form.user_addresses;

        if (Object.keys(newErrors).length === 0) {
            for (const key in user_addresses) {
                if (!(saved_addresses.includes(key))) {
                    delete tmp[key];
                    setForm({
                        ...form,
                        'user_addresses':tmp
                    })
                }
            }
        }

        return newErrors;
    }

    async function handleSubmit(formErrors) {

        // if formErrors errors keys are greater than 0 then there are errors and can't submit form
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);

        } else {
            // make a copy of the form because I want to encrypt the data
            // it is easier to encrypt a copy then to use the useState functions on the form
            var copy_form = {"user_addresses": {}, "allergies": []};

            // encrypt all fields except user addresses because we encrypt what is inside of that field
            // not the field itself
            Object.keys(form).forEach(function(key, index) {
                if (key !== "user_addresses" && key !== "allergies" && key !== "confirm_password")
                    copy_form[key] = btoa(form[key]);
            });

            // if there are no allergies then push None option
            if (form.allergies.length === 0) {
                form.allergies.push("None")
            }

            // encrypt allergies separately
            for (var i = 0; i < form.allergies.length; i++)
                copy_form.allergies.push(btoa(form.allergies[i]))

            // loop through the addresses
            Object.keys(form.user_addresses).forEach(function(key1, index1) {
                // add an empty object for each address in for to append the data of that address
                copy_form.user_addresses[key1] = {}
                // loop through every field and add the data to the copy form address
                Object.keys(form.user_addresses[key1]).forEach(function(key2, index2) {
                    // edited address have an id field. Do not copy it
                    if (key2 !== "id")
                        copy_form.user_addresses[key1][key2] = btoa(form.user_addresses[key1][key2]);
                });
            });

            // loop through the user addresses
            for (var address in form.user_addresses) {
                // loop through the fields inside the user addresses and encrypt them
                for (var field in copy_form.user_addresses[address]) {
                    copy_form.user_addresses[address][field] = btoa(form.user_addresses[address][field])
                }
            }

            // we send encrypted copy form to the back end
            const submit_request = await fetch("http://127.0.0.1:8000/api/submit-user-form/", {
                                                 method: "POST",
                                                 headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(copy_form)})


            let data = await submit_request.json();

            // if success exists then alert user account was created and redirect to login page
            if (data.success) {
                // we navigate to the login page
                navigate('/login');

                // alert user account was created successfully
                toast.success("Account created!")
            } else {
                // set errors
                setErrors(data);
            }
        }
    }

    return (
        <>
            <Form className="formSubmission">
                <h1 align="center">Sign Up</h1>
                {/* The next blocks handle updating the user's form data and errors */}
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
                        {/* The password field can have multiple errors */}
                        <Form.Control.Feedback type='invalid'>
                            { "Password must..." }
                            { errors.password ?
                                (
                                  Object.keys(errors.password).map((oneKey, i)=>{
                                    return (
                                        <li key={i}>{errors.password[oneKey]}</li>
                                      )
                                  })
                                ) : null
                            }
                        </Form.Control.Feedback>
                    </FloatingLabel>
                    <Form.Text className='text-muted'>
                        Password must be between 8 and 25 characters and contain at least one uppercase letter, one
                        lowercase letter, one special char($%^&*_+=~`|/,;:\!@), and one number.
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId='confirm_password'>
                    <FloatingLabel
                        controlId="confirm_password"
                        label="Confirm Password"
                        className="mb-3"
                    >
                        <Form.Control
                            htmlFor="confirm_password"
                            type='password'
                            value={form.confirm_password}
                            onChange={(e) => setField('confirm_password', e.target.value)}
                            isInvalid={!!errors.confirm_password}
                            placeholder="confirm_password"
                        ></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            { errors.confirm_password }
                        </Form.Control.Feedback>
                    </FloatingLabel>
                </Form.Group>
                <Form.Group controlId='dob'>
                    <FloatingLabel
                        controlId="date"
                        label="Date of Birth"
                        className="mb-3"
                    >
                        <Form.Control
                            htmlFor="dob"
                            type='date'
                            value={form.dob}
                            onChange={(e) => setField('dob', e.target.value)}
                            isInvalid={!!errors.dob}
                            placeholder="dob"
                        ></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            { errors.dob }
                        </Form.Control.Feedback>
                    </FloatingLabel>
                </Form.Group>

                {/* I am using PhoneNumber component Open Source */}
                <Form.Group controlId='phone_number'>
                    <Form.Label>Phone Number</Form.Label>
                    <br />
                    <Input
                        country="US"
                        international
                        withCountryCallingCode
                        value={form.phone_number}
                        onChange={setPhoneNumber}/>
                    <Form.Control
                      isInvalid={!!errors.phone_number}
                      hidden
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        { errors.phone_number }
                    </Form.Control.Feedback>
                </Form.Group>

                {/* If there are saved addresses, then loop through them to display them */}
                { (Object.keys(form.user_addresses).length > 1) ? (
                    getAddresses().map(function(address, index) {
                        return <div key={index}><AddressCards
                                    index={index}
                                    id={address}
                                    address_name={form.user_addresses[address].address_name}
                                    city={form.user_addresses[address].city}
                                    address={form.user_addresses[address].address}
                                    zipcode={form.user_addresses[address].zipcode}
                              /></div>;
                    })
                ) : (null) }

                {/* Input fields are saving an address */}
                { current_address ?
                    <>
                        <Form.Group controlId='delivery_address_name'>
                            <Form.Label>Default Delivery Address (Optional)</Form.Label>
                            <Form.Control
                                placeholder='Save address as...'
                                value={current_address.address_name}
                                onChange={(e) => setField('address_name', e.target.value)}
                                isInvalid={!!errors.address_name}
                            ></Form.Control>
                            <Form.Control.Feedback type='invalid'>
                                { errors.address_name }
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId='delivery_address_city'>
                            <Form.Control
                                placeholder='City'
                                value={current_address.city}
                                onChange={(e) => setField('city', e.target.value)}
                                isInvalid={!!errors.city}
                            ></Form.Control>
                            <Form.Control.Feedback type='invalid'>
                                { errors.city }
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId='delivery_address'>
                            <Form.Control
                                placeholder='Address'
                                value={current_address.address}
                                onChange={(e) => setField('address', e.target.value)}
                                isInvalid={!!errors.address}
                            ></Form.Control>
                            <Form.Control.Feedback type='invalid'>
                                { errors.address }
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId='delivery_address_zipcode'>
                            <Form.Control
                                placeholder='Zipcode'
                                value={current_address.zipcode}
                                onChange={(e) => setField('zipcode', e.target.value)}
                                isInvalid={!!errors.zipcode}
                            ></Form.Control>
                            <Form.Control.Feedback type='invalid'>
                                { errors.zipcode }
                            </Form.Control.Feedback>
                        </Form.Group>
                        {/* Addresses need to be saved */}
                        <Form.Group>
                            <button className={'btn btn-success'} onClick={saveNewAddress}>
                                {(Object.keys(form.user_addresses).length === 1) ? 'Save Address' : 'Save Another Address'}
                            </button>
                        </Form.Group>
                    </>
                : null }

                {/* Multiselect component open source */}
                <p>Allergies</p>
                <Multiselect onSelect={setAllergies} showArrow options={allergies} isObject={false} />


                <Button
                    type='submit'
                    onClick={callUseEffect}
                    className='my-2'
                    variant='primary'>Sign Up</Button>

            </Form>
        </>
    );
}

export default SignUpPage;