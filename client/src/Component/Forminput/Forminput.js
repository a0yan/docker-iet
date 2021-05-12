import React from 'react'
import styles from './Forminput.module.css'
const Forminput = (props) => {
    const clss = [styles.form_input_label]
    if (props.value.length) {
        clss.push(styles.shrink)
    }
    const label = props.label ? (
        <label className={clss.join(' ')}>{props.label}</label>
    ) : null
    return (
        <div className={styles.group}>
            {label}
            <input className={styles.form_input} onChange={props.mc} {...props} />
        </div>
    )
}
export default Forminput