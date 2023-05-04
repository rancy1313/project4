import { createContext, useState, useEffect } from 'react'
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';

const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({ children }) => {
    // check if there is a token in the storage to retrieve it else set null
    let [tokens, setTokens] = useState(() => localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')) : null)
    // check if we have a token in the storage to get the decoded user data from it
    let [user, setUser] = useState(() => localStorage.getItem('tokens') ? jwt_decode(localStorage.getItem('tokens')) : null)

    let navigate = useNavigate()

    // login the user if there are no errors
    let loginUser = async (e, errors, setErrors) => {
        e.preventDefault()

        // attempt to get token from backend with user data
        let response = await fetch('http://127.0.0.1:8000/api/token/', {
                                        method:'POST',
                                        headers:{
                                            'Content-Type':'application/json'
                                        },
                                        body:JSON.stringify({'username': e.target.username.value, 'password': e.target.password.value})
                                    })

        let data = await response.json()

        // if the response is good(200)
        if(response.status === 200){
            // set the auth tokens from the backend
            setTokens(data)
            // decode the user data and store it in the local storage then navigate to home
            setUser(jwt_decode(data.access))
            localStorage.setItem('tokens', JSON.stringify(data))
            // customize the alert for the user with user name
            const message = `Login successful! Welcome ${jwt_decode(data.access)["preferred_name"]}.`;
            //toast.success(message);
            toast.success(message)
            navigate("/")
        } else {
            // else the username/password was incorrect, so set those errors
            setErrors(data)
        }
    }

    // update tokens on each call from the user
    let updateTokens = async ()=> {
        // call the custom refresh route bc we are passing a username
         let response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
                                         method:'POST',
                                         headers:{
                                             'Content-Type':'application/json'
                                         },
                                        body: JSON.stringify({ 'refresh': tokens?.refresh, 'username': user.username })
                                     })

         let data = await response.json()

         // if the response status is good then set the new tokens
         if (response.status === 200) {
             setTokens(data);
             setUser(jwt_decode(data.access));
             localStorage.setItem('tokens', JSON.stringify(data));
         } else {
            // if there are any errors then logout the user
             navigate("/logout");
         }
     }

    // these are the variables/functions that are passed through context
    let contextData = {
        user: user,
        setUser: setUser,
        tokens: tokens,
        setTokens: setTokens,
        loginUser: loginUser,
        updateTokens: updateTokens,
    }

    return(

        <AuthContext.Provider value={contextData} >
            { children }
        </AuthContext.Provider>
    )
}