import React from 'react'
import styles from './Card.module.css'

const Card = ({machine_id,location_id,location}) => {
    return (
        <div className={styles.Dropdown}>
                    <button className={styles.Button}>{location}</button>
                    <div className={styles.Dropdown_content}>
                        <a  target="_blank" rel="noopener noreferrer" href={`/freq_amp?machine=${machine_id}&location=${location_id}`}>FFT</a>
                        <a  target="_blank" rel="noopener noreferrer" href={`/freq_phase?machine=${machine_id}&location=${location_id}`}>Phase</a>
                        <a  target="_blank" rel="noopener noreferrer" href={`/acc_time?machine=${machine_id}&location=${location_id}`}>Time History</a>
                    </div>
                </div>
    )
}

export default Card
