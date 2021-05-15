import {React,useEffect,useState} from 'react'
import Dashboard from './Dashboard/Dashboard'
import styles from './Machines.module.css'
import axios from 'axios'
const Machines = ({setMachine,user}) => {
    const [machines, setMachines] = useState([])
    useEffect(() =>{
        const get_machine=async()=>{
        const response=await axios.get('/get-machine',{
            headers:{user}
        })
        setMachines(response.data)
    }
    get_machine()
    
    }, [user])
    return (
        <div className={styles.Machines}>
            <h1 className={styles.Heading}>Your Factory Name</h1>
            <div className={styles.Cards} >
                    {machines.map((el, i) => <Dashboard key={i}  machine_id={i+1} heading={el} />)}
                
            </div>
        </div>
    )
}

export default Machines
