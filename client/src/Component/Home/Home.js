import {React,useEffect} from 'react'
import styles from './Home.module.css'
import Machines from './Machines/Machines'
import axios from 'axios'
const Home = ({setAuth}) => {
    useEffect(() => {
        const getstatus=async()=>{
        const res=await axios({
            method:'GET',
            url:'/is-verified',
            headers:{token:window.localStorage.token}

        })
        console.log(res.data);
        if(res.data===true)
        setAuth(true)
        else{
            setAuth(false)
        }
        
    }
        getstatus()
    }, [setAuth])
    return (
        <>
        <div className={styles.Home}>
            <h1 className={styles.Heading}>INFINITE ENDURANCE TECHNOLOGIES</h1>
        </div>
        <Machines/>
        </>

    )
}

export default Home
