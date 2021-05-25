import { React, useEffect, useState, useRef } from 'react'
import styles from './Dashboard.module.css'
import GaugeChart from './GaugeChart/GaugeChart'
import GaugeChart2 from './GaugeChart2/GaughChart2'
import Card from './Card/Card'
import PowerHistory from './Power_History/Power_History'
import axios from 'axios'
import timeConverter from './TimeConverter/TimeConverter'
const Dashboard = ({ heading, user, machine_id, locations }) => {
    const ref_el = useRef(0)
    const [machine_params, setmachine_params] = useState({
        min_oil_level: 0,
        oil_level: 0,
        max_oil_level: 100,
        oil_quality: 0,
        power: 100,
        temperature: 0
    })
    const [time, settime] = useState('')
    const [issues, setissues] = useState(new Set([]))
    const [History, setHistory] = useState([])
    useEffect(() => {
        const get_data = async () => {
            const response = await axios.post('/get-machine-params', {
                user: user,
                machine_id: machine_id
            })
            if (response.data !== false) {
                setHistory(response.data);
                setmachine_params(
                    response.data.data[0]
                )
                if (response.data.data[0].power < 50) {
                    ref_el.current.style.backgroundColor = 'red'
                    await axios.put('/update-downtime', {
                        user_id: user,
                        machine_id: machine_id,
                        time: new Date()
                    })
                    setissues(new Set(["No Power"]))
                    settime('00:00:00')
                }
                else if (response.data.data[0].power > 50 && response.data.data[0].power < 80) {
                    setissues(new Set([]))
                    ref_el.current.style.backgroundColor = 'rgb(36, 233, 69)'
                    const prev = await axios.post('/get-downtime', {
                        user_id: user,
                        machine_id: machine_id,
                    })
                    const diff = new Date().getTime() - new Date(prev.data.prev_downtime).getTime()
                    settime(timeConverter(diff))
                }
                else if (response.data.data[0].power > 80) {
                    setissues(new Set(["High Power Consumption"]))
                    const prev = await axios.post('/get-downtime', {
                        user_id: user,
                        machine_id: machine_id,
                    })
                    const diff = new Date().getTime() - new Date(prev.data.prev_downtime).getTime()
                    settime(timeConverter(diff))
                    ref_el.current.style.backgroundColor = 'red'
                }

            
            }
        }
        get_data()
        const clear = setInterval(() => get_data(), 2000)
        return () => clearInterval(clear)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [machine_id, user])
    // console.log(machine_params);
    return (
        <div className={styles.Container}>
            <h2 className={`${styles.Heading}`}>Equipment {heading}</h2>
            <div className={styles.Dashboard}>
                <div className={`${styles.Grid_line} ${styles.Uptime}`}><h3>Total Uptime</h3> <h3>{time}</h3></div>
                <div className={`${styles.Grid_line} ${styles.Oil}`}><h3>Oil Management System </h3><h3>Oil Level Indicator</h3>
                    <GaugeChart
                        oil_percent={((machine_params.oil_level - machine_params.min_oil_level) / (machine_params.max_oil_level - machine_params.min_oil_level)) * 100}
                    /> <h3>Oil Quality Indicator</h3><GaugeChart oil_percent={machine_params.oil_quality} /></div>
                <div className={`${styles.Grid_line} ${styles.Report} `}>
                    <h3>Power Consumption History </h3>
                        <GaugeChart2 power={machine_params.power} />
                        {History.length !== 0 ? (<PowerHistory chart_data={History} />) : null}
                </div>
                <div className={`${styles.Grid_line} ${styles.Report_2}`}> <h3>Temperature Level Indicator </h3> <h4>Temperature</h4> <h2>{machine_params.temperature}&deg; C</h2> </div>
                <div className={`${styles.Grid_line} ${styles.Power}`}>
                    <h3>Power Consumption</h3>
                    <GaugeChart2 style={{ height: '100%' }} power={machine_params.power} />
                    <span>(Kw)</span></div>
                <div className={`${styles.Grid_line} ${styles.Vibrational}`}><h3 style={{ marginTop: '0', marginBottom: '2%' }} >Realtime Vibrational Analysis</h3>
                    <div className={styles.Locations}>
                        {locations.map((el, i) =>
                            <Card key={i * 99} location_id={el} machine_id={machine_id} />
                        )}
                    </div>
                </div>
                <div style={{ backgroundColor: 'rgb(36, 233, 69)' }} className={`${styles.Grid_line} ${styles.Issues}`} ref={ref_el} >
                    <h3>Current Issues</h3>
                    {issues.size !== 0 ? ([...issues].map((el) => <h4>{el}</h4>)) : (<h3>No Issues Found</h3>)}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
