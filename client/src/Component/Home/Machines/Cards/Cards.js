import React from 'react'
import styles from './Cards.module.css'
import Card from './Card/Card'
const Cards = ({heading,machine_id}) => {
    const location=['Location 1','Location 2','Location 3']
    return (
        <div className={styles.Card}>
        <div className={styles.Card_Inner}>
            <div className={styles.Card_Front}>
                <h2 className={styles.Heading}>Machine {heading}</h2>
            </div>
            <div className={styles.Card_Back}>
                {location.map((el,i)=><Card key={i} location_id={i+1} location={el}  machine_id={machine_id} />)}
            </div>
        </div>    
        </div>
    )
}

export default Cards
