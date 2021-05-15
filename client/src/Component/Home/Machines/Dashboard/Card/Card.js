import React from 'react'
import styles from './Card.module.css'

const Card = ({ machine_id, location_id, location }) => {
    return (
        <div className={styles.Card}>
            <h4 className={styles.Heading}>{location}</h4>
            <div className={styles.Links}>
                <button className={styles.Button}><a target="_blank" rel="noopener noreferrer" href={`/freq_amp?machine=${machine_id}&location=${location_id}`}>FFT</a></button>
                <button className={styles.Button}><a target="_blank" rel="noopener noreferrer" href={`/freq_phase?machine=${machine_id}&location=${location_id}`}>Phase</a></button>
                <button className={styles.Button}><a target="_blank" rel="noopener noreferrer" href={`/acc_time?machine=${machine_id}&location=${location_id}`}>Time History</a></button>
            </div>
        </div>
    )
}

export default Card
