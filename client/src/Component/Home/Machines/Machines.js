import React, {useEffect,useState,lazy,Suspense} from 'react'
import styles from './Machines.module.css'
import axios from '../../../api/axios'
const Dashboard =lazy(()=> import('./Dashboard/Dashboard'))
const Machines = ({user}) => {
    const [machines, setmachines] = useState([]) // used to store array of machines  with respect to the current user 
    const [factory_name, setfactory_name] = useState("") // Factory name fetched from the backend
    useEffect(() =>{
        const get_machine=async()=>{
            // This functions retrieves the array of machines from the backend and the factory name  
        const response=await axios.get('/get-machine',{
            headers:{user},
            
        })
        setmachines(response.data.machine_data);
        setfactory_name(response.data.factory_name)
    }
    get_machine()    
    }, [user])
    return (
        <div className={styles.Machines}>
            <h2 className={styles.Heading}>{factory_name}</h2>
            <div className={styles.Cards} >
                    <Suspense fallback={<div>Loading...</div>}>
                    {/* Loops over the number of machines to Create Dashboard per machines */}
                    {machines.map((el, i) => <Dashboard key={(i+1)*279} user={user}  machine_id={i+1} heading={i+1} locations={el} />)}
                    </Suspense>
            </div>
        </div>
    )
}

export default Machines
