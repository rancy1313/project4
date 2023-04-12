import React, {useState, useEffect, useContext} from 'react'
import AuthContext from '../context/AuthContext'
//import useAxios from '../utils/useAxios'
import useFetch from '../utils/useFetch'

const HomePage = () => {
    let [notes, setNotes] = useState([])
    let {authTokens, logoutUser} = useContext(AuthContext)

    //let api = useAxios()
    let api = useFetch()

    useEffect(()=> {
        getNotes()
    }, [])

    let getNotes = async() =>{
    // this is for axios. Axios has a get method
        //let response = await api.get('/api/notes/')
        let {response, data} = await api('/api/notes/')

        /*if(response.status === 200){
            setNotes(response.data)
        }*/

        if(response.status === 200){
            setNotes(data)
        }

    }

    /*
    This is get notes using update access token every four minutes
    let getNotes = async() =>{
        let response = await fetch('http://127.0.0.1:8000/api/notes/', {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })

        let data = await response.json()

        if(response.status === 200){
            setNotes(data)
        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }

    }
    */

    return (
        <div>
            <p>You are logged to the home page!</p>


            <ul>
                {notes.map(note => (
                    <li key={note.id} >{note.body}</li>
                ))}
            </ul>
        </div>
    )
}

export default HomePage