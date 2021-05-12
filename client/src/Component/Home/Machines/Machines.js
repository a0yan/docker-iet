import React from 'react'
import Card from './Card/Card'
import styles from './Machines.module.css'
const Machines = () => {
    const machines = ["Machine 1", "Machine 2", "Machine 3"]
    return (
        <div className={styles.Machines}>
            <h1 className={styles.Heading}>Your Factory Name</h1>
            <div className={styles.Cards} >
                    {machines.map((el, i) => <Card key={i} heading={el} />)}
                
            </div>
        </div>
    )
}

export default Machines
