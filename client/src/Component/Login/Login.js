import { React, useState } from 'react'
import styles from './Login.module.css'
import Icon from '../../assets/search.svg'
import FormInput from '../Forminput/Forminput'
import axios from 'axios'
const Login = ({setAuth,setUser}) => {
    const [userCred, setuserCred] = useState({email: '', password: ''})
    const handleChange = (event) => {
        const { name, value } = event.target
        setuserCred({ ...userCred, [name]: value })
    }
    const handleSubmit=async(event)=>{
        event.preventDefault()
        const response=await axios.post('login',{
            email:userCred.email,
            password:userCred.password
        })
        if (response.status===202){
            window.localStorage.setItem("token", response.data.token);
            setUser(response.data.user_id)
            setAuth(true)
            
        }
    }
    return (
        <div className={styles.Login} >
            <h1 className={styles.Heading}> Infinite Endurance Technologies </h1>
            <div className={styles.LoginCard}>
                <h1>Sign In</h1>
                    <form onSubmit={handleSubmit} className={styles.Content}>
                        <FormInput name='email' type='email' value={userCred.email} label='Email' onChange={handleChange} />
                        <FormInput name='password' type='password' value={userCred.password} label='Password' onChange={handleChange} />
                    
                    <button className={styles.Button} onClick={handleSubmit}> Login In </button>
                    <h4 style={{margin:'0'}}>OR</h4>
                    <a href="/auth/google" >
                        <button className={styles.Button} > Login with  <img src={Icon} style={{ height: '33%', width: '33%' }} alt="G-Icon" /> </button>
                    </a>
                    </form>
            </div>
        </div>
    )
}

export default Login
