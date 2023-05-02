import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import AccountInfo from '../components/AccountInfo';


const AccountPage = () => {

    return (
        <>
            <div className="formSubmission">
                <h1 align="center">Account Info.</h1>
                <Tabs
                    defaultActiveKey="account_info"
                    id="account-setting-links"
                    className="mb-3"
                >
                <Tab eventKey="account_info" title="Personal Info.">
                    <AccountInfo />
                </Tab>
                <Tab eventKey="profile" title="Profile">

                </Tab>
                <Tab eventKey="contact" title="Contact">

                </Tab>
            </Tabs>
            </div>
        </>
    );
}

export default AccountPage;