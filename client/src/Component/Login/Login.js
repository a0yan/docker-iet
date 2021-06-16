import { React, useState,useRef} from 'react'
import styles from './Login.module.css'
import FormInput from '../Forminput/Forminput'
import axios from '../../api/axios'
import ReCAPTCHA from 'react-google-recaptcha'
const Login = ({ setAuth, setUser }) => {
    const [userCred, setuserCred] = useState({ email: 'sample@sample.com', password: '5678' })
    const [error, seterror] = useState(null)
    const reRef = useRef(<ReCAPTCHA />)
    const handleChange = (event) => {
        const { name, value } = event.target
        setuserCred({ ...userCred, [name]: value })
    }
    const handleSubmit = async (event) => {
        event.preventDefault()
        const token_captcha = await reRef.current.executeAsync()
        reRef.current.reset()
        
        try {
            const response = await axios.post('/login', {
                email: userCred.email,
                password: userCred.password,
                token_captcha
            })
            
            if (response.status === 202) {
                window.localStorage.setItem("token", response.data.token);
                setUser(response.data.user_id)
                setAuth(true)
                seterror(null)
            }
        }
        catch (error) {
            seterror(error.response.data)

        }

    }


    return (
        <div className={styles.Login} >
            <h1 className={styles.Heading}> Infinite Endurance Technologies </h1>
            <div className={styles.LoginCard}  >
                {error !== null ? (<div className={styles.Error}>{error}</div>) : null}
                <h3>Sign In</h3>
                <form onSubmit={handleSubmit} className={styles.Content}>
                    <FormInput name='email' type='email' value={userCred.email} label='Email' onChange={handleChange} />
                    <FormInput name='password' type='password' value={userCred.password} label='Password' onChange={handleChange} />
                    <ReCAPTCHA
                        sitekey="6LeicRsbAAAAANVKVME_chF-ixOgDsq-Fi3q8CNR"
                        size='invisible'
                        ref={reRef}
                    />
                    <div className={styles.Wrapper}>
                        <button className={styles.Button} onClick={handleSubmit}> Login In </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
