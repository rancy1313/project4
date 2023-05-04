import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import Alert from 'react-bootstrap/Alert';
import SearchDropdown from '../components/SearchDropDown';


const HomePage = () => {

    // format the phone number
    function setPhoneNumber(phoneNumber) {
      return ["+1 ", '(', phoneNumber.slice(2, 5), ') ', phoneNumber.slice(5, 8), '-', phoneNumber.slice(8, 13)].join('');

    }

    let { user } = useContext(AuthContext);

    // get user data and display it on an alert
    return (
        <div>

            <Alert variant="success">
                <Alert.Heading>Welcome, { user.preferred_name }!</Alert.Heading>
                <p>You are logged to the home page!</p>
                <ul>
                    <li>Birthday: { user.dob }</li>
                    <li>Phone Number: { setPhoneNumber(user.phone_number) }</li>
                    <li>Allergies: { user.allergies }</li>
                </ul>
            </Alert>

            <SearchDropdown />
        </div>
    )
}

export default HomePage