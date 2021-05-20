import React, {useEffect,useState,lazy,Suspense} from 'react'
import styles from './Machines.module.css'
import axios from 'axios'
const Dashboard =lazy(()=> import('./Dashboard/Dashboard'))
// import Dashboard from './Dashboard/Dashboard'
const Machines = ({user}) => {
    const [machines, setmachines] = useState([])
    const [locations, setlocations] = useState([])
    useEffect(() =>{
        const get_machine=async()=>{
        const response=await axios.get('/get-machine',{
            headers:{user}
        })
        setmachines(response.data.machine_data.slice(1,-1).split(','))
        setlocations(response.data.location_data.slice(1,-1).split(','))
        // console.log(response.data);
    }
    get_machine()
    
    }, [user])
    return (
        <div className={styles.Machines}>
            <h1 className={styles.Heading}>Your Factory Name</h1>
            <div className={styles.Cards} >
                    <Suspense fallback={<div>Loading...</div>}>
                    {machines.map((el, i) => <Dashboard key={i*25} locations={locations} user={user}  machine_id={i+1} heading={el} />)}
                    </Suspense>
            </div>
        </div>
    )
}

export default Machines
