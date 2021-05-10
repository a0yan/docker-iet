import {React} from 'react'
import styles from './Login.module.css'
import Icon from '../../assets/search.svg'
const Login = () => {
    
    return (
        <div className={styles.Login} >
            <div className={styles.LoginCard}>
                <div className={styles.Background} />
                <div className={styles.Content}>
                    <h1> Infinite Endurance Tech </h1>
                    <a href="/auth/google" >
                        <button className={styles.Button} > Login with  <img src={Icon} style={{height:'33%',width:'33%'}} alt="G-Icon" /> </button>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Login
