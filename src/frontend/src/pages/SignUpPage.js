import { useState, useEffect, useContext } from 'react';

// phone number input code
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { Multiselect } from "multiselect-react-dropdown";
import Button from 'react-bootstrap/Button';

const secret = 'superSecret';

function SignUpPage() {

    // set the available allergies to pass in the bootstrap selector
    const allergies = ['Milk', 'Egg', 'Fish', 'Crustacean Shell Fish', 'Tree Nuts', 'Wheat', 'Peanuts', 'Soybeans', 'Sesame']


    // used to trigger handleSubmit
    const [formValidation, setFormValidation] = useState(0);


    // set the date of birth value here to preset the date of birth option to current date
    var dateObj = new Date();
    //months from 1-12
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newDate = year + "-" + month.toString().padStart(2, '0') + "-" + day.toString().padStart(2, '0');



    // we have a base form set that will hold all the information from the user to send to the backend when completed
    const [form, setForm] = useState({'dob': newDate, 'name': '', 'username': '', 'password': '',
                                      'confirm_password': '', 'allergies': ['None'], 'phone_number': '',
                                      'user_addresses': {'delivery_address1': {'address_name': '', 'city': '',
                                      'address': '', 'zipcode': ''}}});

    // if the data from the user is not up to specifications then there will be an error and the form will
    // not be sent to the backend
    const [errors, setErrors] = useState({});

    // this is to shorten the code needed to get the current address which is the address that is currently being edited
    const current_address = form['user_addresses'][Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]];

    // this is used for our onChange function to update the form
    const setField = (field, value) => {
        console.log('field: ', field);
        console.log('value: ', value);
        /*
           1. if it is a delivery address change then those are updated differently
              b/c they are kept in a object.
           2. We want to update the current address the user is editing which is the last item in the
              user_addresses
        */
        if (field in form['user_addresses'][Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]]) {
            // assign delivery_address to tmp var
            const tmp = form.user_addresses
            // tmp and form.delivery_address point to same dict,
            // but changes are not saved so we use the setForm func to save the changes
            tmp[Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]][field] = value
            setForm({
                ...form,
                'user_addresses':tmp
            })
        } else {
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
    }


    // only addresses that were saved by the user will be sent to the backend
    const [saved_addresses, setSaved_addresses] = useState([]);



    function setPhoneNumber(value) {

        // the phone number component will return undefined if it becomes empty
        if (value == undefined)
            // so we make sure it get changed to empty string if that happens
            value = ""

        // update the form
        setForm({
            ...form,
            'phone_number':value
        })

        // delete the errors
        if(!!errors['phone_number'])
        setErrors({
            ...errors,
            'phone_number':null
        })

        // check if value is not null first to make sure .length doesn't crash
        if (value && value.length > 12) {
            const newErrors = {'phone_number': 'Phone number too long.'};
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
        console.log(form)
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

        return (
        <>
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

            <div className={'editPage hidden'} id={'editPage_'+id}>
                <Card.Title>Delivery Address { index + 1 }</Card.Title>
                <Form.Group controlId={'edit_'+id}>
                    <Form.Label>Name: { address_name }</Form.Label>
                    <Form.Control
                        placeholder='Save address as...'
                        value={editForm.address_name}
                        onChange={(e) => setEditForm({...editForm, 'address_name': e.target.value})}
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
                        onChange={(e) => setEditForm({...editForm, 'city': e.target.value})}
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
                        onChange={(e) => setEditForm({...editForm, 'address': e.target.value})}
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
                        onChange={(e) => setEditForm({...editForm, 'zipcode': e.target.value})}
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
                addresses.push(key)
            }
        }

        return addresses;
    }


    // this function is for the user to save an address
    function saveNewAddress(e) {
        e.preventDefault();

        // hold any any errors to update the errors object
        const newErrors = {}

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
            setSaved_addresses(saved_addresses => [...saved_addresses, Object.keys(form.user_addresses)[Object.keys(form.user_addresses).length - 1]])
            // if there are no errors then we add a new address
            // we cannot directly change the form so we assign it to a tmp var to then reassign in setForm function
            const tmp = form.user_addresses

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
            })
            // loop through the keys in the current address to delete the old errors
            for (const key in current_address) {
                delete errors[key];
            }
        }
    }

    // split it so that it calls two functions and then for user/pass
    // always call handle submit
    async function fetchData() {

        // this dict is used to pass backend data to validate the form
        //const backend_dict = {'username_request': '', 'phone_number_request': ''}

        let encoded_username = btoa(form.username)

        let encoded_phone_number = btoa(form.phone_number)
        /*
        const username_request = await fetch("http://127.0.0.1:8000/api/username-validation/", {
                                             method: "POST",
                                             headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(encoded_username)});

        // update value in the backend dict that gets passed to validate form
        backend_dict.username_request = await username_request.json();

        // do backend check to make sure phone_number is not taken
        const phone_number_request = await fetch("http://127.0.0.1:8000/api/phone-number-validation/", {
                                                 method: "POST",
                                                 headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(encoded_phone_number)})

        // update value in the backend dict that gets passed to validate form
        backend_dict.phone_number_request = await phone_number_request.json();*/


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
        //const formErrors = validateForm(backend_dict)
        //handleSubmit(formErrors);
        console.log(data)

    }

    // useEffect will be used to validate the form on the backend for username/phone number
    useEffect(() => {

        // call handle submit with form errors if formValidation is not 0
        // so do noy fetch data on page first render
        if (formValidation !== 0)
            fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formValidation])

    return (
    <>
        <h1>Hello world</h1>
        <Form className="formSubmission">
            <Form.Group controlId='name'>
                <Form.Label>Preferred Name</Form.Label>
                <Form.Control
                    type='text'
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    isInvalid={!!errors.name}
                ></Form.Control>
                <Form.Control.Feedback type='invalid'>
                    { errors.name }
                </Form.Control.Feedback>
            </Form.Group>
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
            <Form.Group controlId='confirm_password'>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                    type='password'
                    value={form.confirm_password}
                    onChange={(e) => setField('confirm_password', e.target.value)}
                    isInvalid={!!errors.confirm_password}
                ></Form.Control>
                <Form.Control.Feedback type='invalid'>
                    { errors.confirm_password }
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId='dob'>
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                    type='date'
                    value={form.dob}
                    onChange={(e) => setField('dob', e.target.value)}
                    isInvalid={!!errors.dob}
                ></Form.Control>
                <Form.Control.Feedback type='invalid'>
                    { errors.dob }
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId='phone_number'>
                <Form.Label>Phone Number</Form.Label>
                <PhoneInput
                  defaultCountry="US"
                  placeholder="Enter phone number"
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
            ) : (null)

            }
            {current_address ?
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

                    <Form.Group>
                        <button className={'btn btn-success'} onClick={saveNewAddress}>
                            {(Object.keys(form.user_addresses).length === 1) ? 'Save Address' : 'Save Another Address'}
                        </button>
                    </Form.Group>
                </>
            : null }

            <p>Allergies</p>
            <Multiselect onSelect={setAllergies} showArrow options={allergies} isObject={false} />

            <Form.Group>
                <Button
                    type='submit'
                    onClick={callUseEffect}
                    className='my-2'
                    variant='primary'>Sign Up</Button>
            </Form.Group>
        </Form>
    </>
    );
}

export default SignUpPage;