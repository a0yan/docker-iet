import React from 'react'
import styles from './Card.module.css'

const Card = ({ machine_id, location_id}) => {
    return (
        <div className={styles.Card}>
            <h4 className={styles.Heading}>Location {location_id}</h4>
            <div className={styles.Links}>
                <a target="_blank" rel="noopener noreferrer" href={`/freq_amp?machine=${machine_id}&location=${location_id}`}><button className={styles.Button}>FFT</button></a>
                <a target="_blank" rel="noopener noreferrer" href={`/freq_phase?machine=${machine_id}&location=${location_id}`}><button className={styles.Button}>Phase</button></a>
                <a target="_blank" rel="noopener noreferrer" href={`/acc_time?machine=${machine_id}&location=${location_id}`}><button className={styles.Button}>Time History</button></a>
            </div>
        </div>
    )
}

export default Card