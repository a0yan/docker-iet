import React from 'react'
import styles from './Card.module.css'
const Card = ({heading},) => {
    return (
        <div className={styles.Card}>
        <div className={styles.Card_Inner}>
            <div className={styles.Card_Front}>
                <h2 className={styles.Heading}>{heading}</h2>
            </div>
            <div className={styles.Card_Back}>
                <div className={styles.Dropdown}>
                    <button className={styles.Button}>Location 1 </button>
                    <div className={styles.Dropdown_content}>
                        <a target="_blank" rel="noopener noreferrer" href='/freq_amp'>FFT</a>
                        <a target="_blank" rel="noopener noreferrer" href='/freq_phase'>Phase</a>
                        <a target="_blank" rel="noopener noreferrer" href='/acc_time'>Time History</a>
                    </div>
                </div>
                <div className={styles.Dropdown}>
                    <button className={styles.Button}>Location 2 </button>
                    <div className={styles.Dropdown_content}>
                        <a target="_blank" rel="noopener noreferrer" href='/freq_amp'>FFT</a>
                        <a target="_blank" rel="noopener noreferrer" href='/freq_phase'>Phase</a>
                        <a target="_blank" rel="noopener noreferrer" href='/acc_time'>Time History</a>
                    </div>
                </div>
                <div className={styles.Dropdown}>
                    <button className={styles.Button}>Location 3 </button>
                    <div className={styles.Dropdown_content}>
                        <a target="_blank" rel="noopener noreferrer" href='/freq_amp'>FFT</a>
                        <a target="_blank" rel="noopener noreferrer" href='/freq_phase'>Phase</a>
                        <a target="_blank" rel="noopener noreferrer" href='/acc_time'>Time History</a>
                    </div>
                </div>
            </div>
        </div>    
        </div>
    )
}

export default Card
