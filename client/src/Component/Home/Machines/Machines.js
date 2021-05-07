import { React, useEffect } from 'react'
import Card from './Card/Card'
import styles from './Machines.module.css'
import AOS from 'aos'
import "aos/dist/aos.css"
const Machines = () => {
    useEffect(() => {
        AOS.init({
            duration: 2000
        })
    }, [])
    const machines = ["Machine 1", "Machine 2", "Machine 3"]
    return (
        <div className={styles.Machines}>
            <h1 className={styles.Heading} data-aos="zoom-in-down" >  Machine States </h1>
            <div className={styles.Cards} data-aos="slide-right">
                    {machines.map((el, i) => <Card key={i} heading={el} />)}
                
            </div>
        </div>
    )
}

export default Machines
