import {React,useEffect} from 'react'
import styles from './Home.module.css'
import Machines from './Machines/Machines'
import AOS from 'aos'
import "aos/dist/aos.css"
import axios from 'axios'
const Home = ({setAuth}) => {
    useEffect(() => {
        AOS.init({
            duration: 2000
        })
        const getstatus=async()=>{
        const res=await axios({
            method:'GET',
            url:'http://localhost:5000/is-verified',
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
        <div className={styles.Introduction}>
            <h1 className={styles.Heading} data-aos="zoom-in-up" data-aos-easing="ease-in-sine">Infinite Endurance Tech</h1>
        </div>
        <Machines/>
        </>

    )
}

export default Home
