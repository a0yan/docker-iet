import { React, useState } from 'react'
import styles from './Login.module.css'
import Icon from '../../assets/search.svg'
import FormInput from '../Forminput/Forminput'
const Login = () => {
    const [userCred_register, setuserCred_register] = useState({ displayName: '', email: '', password: '', confirmPassword: '' })
    const handleChange_register = (event) => {
        const { name, value } = event.target
        setuserCred_register({ ...userCred_register, [name]: value })
    }
    const [userCred, setuserCred] = useState({email: '', password: ''})
    const handleChange = (event) => {
        const { name, value } = event.target
        setuserCred({ ...userCred_register, [name]: value })
    }
    return (
        <div className={styles.Login} >
            <h1> Infinite Endurance Technologies </h1>
            <div className={styles.LoginCard}>
                <div className={styles.Register} >
                    <h1>I do not have an account</h1>
                    <form>
                        <FormInput name='displayName' type='text' value={userCred_register.displayName} label='Display Name' onChange={handleChange_register} />
                        <FormInput name='email' type='email' value={userCred_register.email} label='Email' onChange={handleChange_register} />
                        <FormInput name='password' type='password' value={userCred_register.password} label='Password' onChange={handleChange_register} />
                        <FormInput name='confirmPassword' type='password' value={userCred_register.confirmPassword} label='Confirm Password' onChange={handleChange_register} />
                    </form>
                    <button className={styles.Button} >Register</button>
                </div>
                <div className={styles.Content}>
                <h1>I do  have an account</h1>
                    <form>
                        <FormInput name='email' type='email' value={userCred.email} label='Email' onChange={handleChange} />
                        <FormInput name='password' type='password' value={userCred.password} label='Password' onChange={handleChange} />
                    </form>
                    <button className={styles.Button} > Login In </button>
                    OR
                    <a href="/auth/google" >
                        <button className={styles.Button} > Login with  <img src={Icon} style={{ height: '33%', width: '33%' }} alt="G-Icon" /> </button>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Login
