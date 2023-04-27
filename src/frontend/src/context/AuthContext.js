import { createContext, useState, useEffect } from 'react'
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export default AuthContext;


export const AuthProvider = ({children}) => {
    // check if there is a token in the storage to retrieve it else set null
    let [tokens, setTokens] = useState(() => localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')) : null)
    // check if we have a token in the storage to get the decoded user data from it
    let [user, setUser] = useState(() => localStorage.getItem('tokens') ? jwt_decode(localStorage.getItem('tokens')) : null)
    // used to decode the tokens to set user data
    let [decodedToken, setDecodedToken] = useState(true)

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
            navigate("/")
        }else{
            // else the username/password was incorrect, so set those errors
            setErrors(data)
        }
    }

    // these are the variables/functions that are passed through context
    let contextData = {
        user:user,
        setUser:setUser,
        tokens:tokens,
        setTokens:setTokens,
        loginUser:loginUser,
    }

    // check if we have auth tokens. If so set the user info
    useEffect(()=> {

        if (tokens) {
            setUser(jwt_decode(tokens.access))
        }

        // auth tokens are decoded so reset decodedToken
        setDecodedToken(false)

    }, [tokens, decodedToken])

    return(
        <AuthContext.Provider value={contextData} >
            {decodedToken ? null : children}
        </AuthContext.Provider>
    )
}