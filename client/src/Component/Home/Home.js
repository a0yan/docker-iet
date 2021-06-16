import {React,useEffect} from 'react'
import styles from './Home.module.css'
import Machines from './Machines/Machines'
import axios from '../../api/axios'
const Home = ({setAuth,user,setUser}) => {
    useEffect(() => {
    
        const getstatus=async()=>{
        const res=await axios({
            method:'GET',
            url:'/is-verified',
            headers:{token:window.localStorage.token},
            

        })
        if(res.status===201){
        setUser(res.data.user)
        setAuth(true)
        }
        else{
            setAuth(false)
        }
        
    }
        getstatus()
        // return ()=>{ourRequest.cancel()}
    }, [setAuth,setUser])
    return (
        <>
        <div className={styles.Home}>
            <h1 className={styles.Heading}>INFINITE ENDURANCE<br/>TECHNOLOGIES</h1>
        </div>
        <Machines user={user}/>
        </>

    )
}

export default Home
