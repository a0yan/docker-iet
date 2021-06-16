import { React, useEffect, useState, useRef } from 'react'
import styles from './Dashboard.module.css'
import GaugeChart from './GaugeChart/GaugeChart'
import GaugeChart2 from './GaugeChart2/GaughChart2'
import Card from './Card/Card'
import PowerHistory from './Power_History/Power_History'
import TemperatureHistory from './Temperature_History/Temperature_History'
import axios from '../../../../api/axios'
import timeConverter from './TimeConverter/TimeConverter'
import Checkbox from './Checkbox/Checkbox'
// import addNotification from 'react-push-notification'
function showNotification(body) {
    Notification.requestPermission(function (result) {
        if (result === 'granted') {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.showNotification('Warning!!', {
                    body: `${body}`,
                    vibrate: [200, 100, 200, 100, 200, 100, 200],
                    tag: 'vibration-sample'
                });
            });
        }
    });
}
const Dashboard = ({ heading, user, machine_id, locations }) => {
    const ref_el = useRef()
    const ref_count = useRef(0)
    const uptime_ref = useRef(0)
    const [machine_params, setmachine_params] = useState({
        min_oil_level: 0,
        oil_level: 0,
        max_oil_level: 100,
        oil_quality: 0,
        power: 100,
        temperature: 0
    })
    const [time, settime] = useState('')
    const [yesterday_uptime, setyesterday_uptime] = useState('')
    const [issues, setissues] = useState({
        High_Power_Consumption: 0,
        Low_Power: 0,
        Low_Oil_Level: 0,
        High_Oil_Level: 0,
        High_Temperature: 0,
        Low_Temperature: 0
    })
    const [History, setHistory] = useState([])
    const [checkbox, setcheckbox] = useState({
        Uptime: true,
        Oil_Management_System: true,
        Power_Consumption_History: true,
        Temperature_Level_Indicator: true,
        Power_Consumption: true
    })
    useEffect(() => {
        // const ourRequest = axios.CancelToken.source()
        const get_data = async () => {
            if (uptime_ref.current === 0) {
                const yes_uptime = await axios.post('/get-yesterday-uptime', {
                    user_id: user,
                    machine_id: machine_id
                },)
                if (yes_uptime.data !== null) {
                    uptime_ref.current = 1
                    setyesterday_uptime(timeConverter(yes_uptime.data.yesterday_uptime))
                }
            }
            const response = await axios.post('/get-machine-params', {
                user: user,
                machine_id: machine_id
            })
            if (response.data !== false) {
                setHistory(response.data);
                setmachine_params(
                    response.data.data[0]
                )
                let new_issues = {
                    High_Power_Consumption: 0,
                    Low_Power: 0,
                    Low_Oil_Level: 0,
                    High_Oil_Level: 0,
                    High_Temperature: 0,
                    Low_Temperature: 0
                }

                if (response.data.data[0].oil_level < response.data.data[0].min_oil_level) {
                    new_issues = {
                        ...new_issues,
                        Low_Oil_Level: 1,
                        High_Oil_Level: 0

                    }

                }
                else if (response.data.data[0].oil_level > response.data.data[0].max_oil_level) {
                    new_issues = {
                        ...new_issues,
                        Low_Oil_Level: 0,
                        High_Oil_Level: 1

                    }

                }
                else {
                    new_issues = {
                        ...new_issues,
                        Low_Oil_Level: 0,
                        High_Oil_Level: 0

                    }
                }
                if (response.data.data[0].temperature > 80) {
                    new_issues = { ...new_issues, High_Temperature: 1, Low_Temperature: 0 }
                }
                else if (response.data.data[0].temperature < 30) {
                    new_issues = { ...new_issues, Low_Temperature: 1, High_Temperature: 0 }
                }
                else {
                    new_issues = { ...new_issues, Low_Temperature: 0, High_Temperature: 0 }
                }
                if (response.data.data[0].power < 50) {
                    new_issues = {
                        ...new_issues,
                        Low_Power: 1,
                        High_Power_Consumption: 0

                    }
                    await axios.put('/update-downtime', {
                        user_id: user,
                        machine_id: machine_id,
                        time: new Date()
                    })

                    settime('00:00:00')
                }
                else if (response.data.data[0].power >= 50 && response.data.data[0].power <= 80) {
                    new_issues = {
                        ...new_issues,
                        Low_Power: 0,
                        High_Power_Consumption: 0

                    }
                    const prev = await axios.post('/get-downtime', {
                        user_id: user,
                        machine_id: machine_id,
                    })
                    const diff = new Date().getTime() - new Date(prev.data.prev_downtime).getTime()
                    settime(timeConverter(diff))//  converts seconds in HH:MM:SS
                }
                else {

                    new_issues = {
                        ...new_issues,
                        Low_Power: 0,
                        High_Power_Consumption: 1

                    }
                    const prev = await axios.post('/get-downtime', {
                        user_id: user,
                        machine_id: machine_id,
                    })
                    const diff = new Date().getTime() - new Date(prev.data.prev_downtime).getTime()
                    settime(timeConverter(diff))
                }
                setissues(new_issues)


            }
        }
        get_data()
        const clear = setInterval(() => get_data(), 3000)

        return () => {
            clearInterval(clear)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [machine_id, user])


    const issues_list = Object.keys(issues).filter(el => issues[el] > 0)
    if (issues_list.length !== 0) {
        ref_el.current.style.backgroundColor = 'red' // Changes the colour of the issues div-Reference is used instead of state as its value is persisted across re render.
        if (issues_list.length !== ref_count.current) {
            showNotification([...issues_list])
            ref_count.current = issues_list.length
        }
    }
    else {
        if (ref_el.current !== undefined) {
            ref_el.current.style.backgroundColor = 'rgb(36, 233, 69)'
            ref_count.current = 0
        }
    }
    const record_issue = async () => { // Stores the machine parameters on the database in case of any issues if clicked by user
        await axios.post('/record-machine-params', {
            machine_params: machine_params
        })
    }
    return (
        <div className={styles.Container}>
            <h2 className={`${styles.Heading}`}>Equipment {heading}</h2>
            <div className={styles.Checkbox}>
                <div>
                <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Uptime" label="Uptime" value={checkbox.Uptime} />
                <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Power_Consumption" label="Power Consumption" value={checkbox.Power_Constmption} />
                </div>
                <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Oil_Management_System" label="Oil Management System" value={checkbox.Oil_Management_System} />
                <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Temperature_Level_Indicator" label="Temperature Level Indicator" value={checkbox.Temperature_Level_Indicator} />
                <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Power_Consumption_History" label="Power Consumption History" value={checkbox.Power_Consumption_History} />
            </div>
            <div className={styles.Dashboard}>
                <div className={`${styles.Grid_line} ${styles.Uptime} ${!checkbox.Uptime ? styles.Hidden : null}`}><h3 className={styles.Uptime_Heading} >Uptime</h3> <h3 className={styles.Uptime_Heading}>{time}</h3><h3 className={styles.Uptime_Heading}>Yesterday's Uptime</h3><h3 className={styles.Uptime_Heading}>{yesterday_uptime}</h3></div>
                <div className={`${styles.Grid_line} ${styles.Oil} ${!checkbox.Oil_Management_System ? styles.Hidden : null}`}><h3>Oil Management System </h3><h3>Oil Level Indicator</h3>
                    <GaugeChart
                        oil_percent={((machine_params.oil_level - machine_params.min_oil_level) / (machine_params.max_oil_level - machine_params.min_oil_level)) * 100}
                    /> <h3>Oil Quality Indicator</h3><GaugeChart oil_percent={machine_params.oil_quality} /></div>
                <div className={`${styles.Grid_line} ${styles.Temperature} ${!checkbox.Temperature_Level_Indicator ? styles.Hidden : null}`}>
                    <h3>Temperature Level Indicator </h3> <h4>Temperature</h4> <h3>{machine_params.temperature}&deg; C</h3> {History.length !== 0 ? (<TemperatureHistory chart_data={History} />) : null} </div>
                <div className={`${styles.Grid_line} ${styles.Report} ${!checkbox.Power_Consumption_History ? styles.Hidden : null}`}>
                    <h3>Power Consumption History </h3>
                    {History.length !== 0 ? (<PowerHistory chart_data={History} />) : null}
                </div>
                <div className={`${styles.Grid_line} ${styles.Power} ${!checkbox.Power_Consumption ? styles.Hidden : null}`}>
                    <h4>Power Consumption</h4>
                    <GaugeChart2 power={machine_params.power} />
                    <span>(KW)</span>
                </div>
                <div className={`${styles.Grid_line} ${styles.Vibrational}`}><h3 className={styles.Vibrational_Heading}>Realtime Vibrational Analysis</h3>
                    <div className={styles.Locations}>
                        {Object.keys(locations).map((el, i) =>
                            <Card key={(i + 269) * 99} location_id={el} bearing_number={locations[el]} machine_id={machine_id} />
                        )}
                    </div>
                </div>
                <div style={{ backgroundColor: 'rgb(36, 233, 69)' }} className={`${styles.Grid_line} ${styles.Issues}`} ref={ref_el} >
                    <h3>Current Issues</h3>
                    {issues_list.length !== 0 ? issues_list.map(el => (<span>{el}</span>)) : <h4>No Issues</h4>}
                    {issues_list.length !== 0 ? <button className={styles.Button} onClick={(event) => record_issue(event)}>Record Issue</button> : null}
                </div>
            </div>

        </div>
    )
}

export default Dashboard
