import React, { useState } from 'react'
import styles from './Register.module.css'
import FormInput from '../Forminput/Forminput'
import axios from '../../api/axios'
const Register = () => {
    const [userCred, setuserCred] = useState({
        master_username: '',
        master_password: '',
        email: '',
        password: '',
        machines: [],
        factory_name: ''
    })
    const [bearing, setbearing] = useState({ 1: "", 2: "", 3: "" })
    const [error, seterror] = useState(null)
    const [sucess, setsucess] = useState(null)
    const handleChange = (event) => {
        const { name, value } = event.target
        setuserCred({ ...userCred, [name]: value })
    }
    const handleChange_bearing = (event) => {
        const { name, value } = event.target
        setbearing({ ...bearing, [name]: value })
    }
    const add_machines = () => {
        setuserCred({ ...userCred, machines: [...userCred.machines, bearing] })
        setbearing({ 1: "", 2: "", 3: "" })
    }
    const handleSubmit = async () => {
        try {
            const response = await axios.post('/register', { ...userCred })
            setsucess(response.data)

        } catch (error) {
            seterror(error.response.data)
        }

    }
    return (
        <div className={styles.Register}>
            {sucess === null ? (

                <>
                    <h2>Register User and Equipments</h2>
                    <div className={styles.Register_Card}>
                        <div>
                            {error !== null ? (<div className={styles.error}>{error}</div>) : null}
                            <h4>Add User Details and Factory Specifications</h4>
                            <FormInput name='master_username' type='email' value={userCred.master_username} label='Master Username' onChange={handleChange} />
                            <FormInput name='master_password' type='password' value={userCred.master_password} label='Master Password' onChange={handleChange} />
                            <FormInput name='email' type='email' value={userCred.email} label='Email' onChange={handleChange} />
                            <FormInput name='password' type='password' value={userCred.password} label='Password' onChange={handleChange} />
                            <FormInput name='factory_name' type='text' value={userCred.factory_name} label='Factory Name' onChange={handleChange} />
                            <div>Bearings For Equipmnet - {userCred.machines.length + 1}</div>
                            <FormInput name='1' type='text' label='Bearing Name 1' value={bearing[1]} onChange={handleChange_bearing} />
                            <FormInput name='2' type='text' label='Bearing Name 2' value={bearing[2]} onChange={handleChange_bearing} />
                            <FormInput name='3' type='text' label='Bearing Name 3' value={bearing[3]} onChange={handleChange_bearing} />
                        </div>
                        <div className={styles.Container}>
                            <button className={styles.Button} onClick={add_machines}>Add Bearings To Respective Locations</button>
                            <button className={styles.Button} onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                </>
            ) : <><h1>User Registered Please Login!!</h1>
                <h2> Your User Id is <strong>{sucess}</strong> Please note down for future references</h2>
                <a href='/'><button className={styles.Button}>Login</button></a></>}

        </div>
    )
}


export default Register
