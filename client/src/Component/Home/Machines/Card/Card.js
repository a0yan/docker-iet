import React from 'react'
import styles from './Card.module.css'
const Card = ({heading}) => {
    return (
        <div className={styles.Card}>
        <div className={styles.Card_Inner}>
            <div className={styles.Card_Front}>
                <h2>{heading}</h2>
            </div>
            <div className={styles.Card_Back}>
                <a href='/freq_acc' target="_blank" rel="noopener noreferrer" ><button className={styles.Button}>FFT</button></a>
                <a href='/freq_phase' target="_blank" rel="noopener noreferrer"><button className={styles.Button}>Freq V/S Phase</button></a>
                <a href='/acc_time' target="_blank" rel="noopener noreferrer" ><button className={styles.Button}>Acceleration V/S Time</button></a>
            </div>
        </div>    
        </div>
    )
}

export default Card
