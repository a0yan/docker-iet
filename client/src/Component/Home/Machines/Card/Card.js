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
                <a href='/'><button className={styles.Button}>Parameter 1</button></a>
                <a href='/'><button className={styles.Button}>Parameter 2</button></a>
                <a href='/'><button className={styles.Button}>Parameter 3</button></a>
            </div>
        </div>    
        </div>
    )
}

export default Card
