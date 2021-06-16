import { React, useState,useRef} from 'react'
import styles from './Login.module.css'
import FormInput from '../Forminput/Forminput'
import axios from '../../api/axios'
import ReCAPTCHA from 'react-google-recaptcha' 
const Login = ({ setAuth, setUser }) => {
    const [userCred, setuserCred] = useState({ email: 'sample@sample.com', password: '5678' }) // Default User Credentials
    const [error, seterror] = useState(null) // IF there is any error default null
    const reRef = useRef(<ReCAPTCHA />) // Refers to the Recaptcha tag
    const handleChange = (event) => {
        // This Function maps the changes in the <input> to the userCred state
        // (Basically It changes the email and password value with the value in the input fields) 
        const { name, value } = event.target
        setuserCred({ ...userCred, [name]: value })
    }
    const handleSubmit = async (event) => {
        // Function is called wheneve the submit button is pressed
        event.preventDefault() // By default the page is refreshes to stop it 
        const token_captcha = await reRef.current.executeAsync() // Creates a captcha token which is send to backend
        reRef.current.reset() // resets token for next login
        
        try {
            // Login Route
            const response = await axios.post('/login', {
                email: userCred.email,      //Sending the email
                password: userCred.password, // Password
                token_captcha //Token
            })
            
            // If the login is sucessful from the backend
            if (response.status === 202) {
                window.localStorage.setItem("token", response.data.token);
                setUser(response.data.user_id) // Set user_id recieved from backend
                setAuth(true) // Authentication True
                seterror(null) //No errors
            }
        }
        catch (error) {
            // IF there's any error then the error message is stired and displayed to the user.
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
