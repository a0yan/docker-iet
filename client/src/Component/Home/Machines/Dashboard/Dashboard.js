import { React, useEffect, useState } from 'react'
import styles from './Dashboard.module.css'
import GaugeChart from './GaugeChart/GaugeChart'
import GaugeChart2 from './GaugeChart2/GaughChart2'
import Card from './Card/Card'
import Line from './PieChart/PieChart'
import axios from 'axios'
const Dashboard = ({ heading, user, machine_id, locations }) => {
    const [machine_params, setmachine_params] = useState({
        min_oil_level: 0,
        oil_level: 0,
        max_oil_level: 100,
        oil_quality: 0,
        power: 0,
        temperature: 0
    })
    useEffect(() => {
        const get_data = async () => {
            const response = await axios.get('/get-machine-params', {
                headers: {
                    user: user,
                    machine_id: machine_id
                }
            })
            if(response.data!==null){
            await setmachine_params(
                {
                    ...machine_params,
                    min_oil_level:response.data.min_oil_level,
                    max_oil_level:response.data.max_oil_level,
                    oil_level:response.data.oil_level,
                    oil_quality:response.data.oil_quality,
                    power:response.data.power,
                    temperature:response.data.temperature
                }

            )}
            // console.log(response.data);
            // console.log(machine_params);            
        }
        get_data()
    }, [machine_id, user])
    // console.log(machine_params);
    return (
        <div className={styles.Container}>
            <h2 className={`${styles.Heading}`}>Equipment {heading}</h2>
            <div className={styles.Dashboard}>
                <div className={`${styles.Grid_line} ${styles.Uptime}`}><h3>Total Uptime</h3><h3>2 Days 22 Hours </h3></div>
                <div className={`${styles.Grid_line} ${styles.Oil}`}><h3>Oil Management System </h3><h3>Oil Level Indicator</h3><GaugeChart
                    oil_percent={((machine_params.oil_level-machine_params.min_oil_level)/(machine_params.max_oil_level-machine_params.min_oil_level))*100}
                /> <h3>Oil Quality Indicator</h3><GaugeChart oil_percent={machine_params.oil_quality} /></div>
                <div className={`${styles.Grid_line} ${styles.Report}`}> <h3>Past Report </h3><Line /></div>
                <div className={`${styles.Grid_line} ${styles.Report_2}`}> <h3>Temperature Level Indicator </h3> </div>
                <div className={`${styles.Grid_line} ${styles.Power}`}>
                    <h3>Power Consumption</h3>
                    <GaugeChart2 power={machine_params.power} />
                    <span>(Kw)</span></div>
                <div className={`${styles.Grid_line} ${styles.Vibrational}`}><h3 style={{ marginTop: '0', marginBottom: '2%' }} >Realtime Vibrational Analysis</h3>
                    <div className={styles.Locations}>
                        {locations.map((el, i) =>
                            <Card key={i * 81} location_id={el} machine_id={machine_id} />
                        )}
                    </div>
                </div>
                <div className={`${styles.Grid_line} ${styles.Issues}`}>
                    <h3>Current Issues</h3>
                    <h4> No Issues In The System </h4>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
