import { React, useEffect, useState, useRef } from 'react'
import styles from './Dashboard.module.css'
import GaugeChart from './GaugeChart/GaugeChart'
import GaugeChart2 from './GaugeChart2/GaughChart2'
import Card from './Card/Card'
import PowerHistory from './Power_History/Power_History'
import TemperatureHistory from './Temperature_History/Temperature_History'
import axios from 'axios'
import timeConverter from './TimeConverter/TimeConverter'
// import addNotification from 'react-push-notification'
function showNotification(body) {
  Notification.requestPermission(function(result) {
    if (result === 'granted') {
      navigator.serviceWorker.ready.then(function(registration) {
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
    const [machine_params, setmachine_params] = useState({
        min_oil_level: 0,
        oil_level: 0,
        max_oil_level: 100,
        oil_quality: 0,
        power: 100,
        temperature: 0
    })
    const [time, settime] = useState('')
    const [issues, setissues] = useState({
        High_Power_Consumption: 0,
        Low_Power: 0,
        Low_Oil_Level: 0,
        High_Oil_Level: 0,
        High_Temperature: 0,
        Low_Temperature: 0
    })
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
                    axios.put('/update-downtime', {
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
                    settime(timeConverter(diff))
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
        return () => clearInterval(clear)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [machine_id, user])
    // console.log(machine_params);

    const issues_list = Object.keys(issues).filter(el => issues[el] > 0)
    if (issues_list.length !== 0) {
        ref_el.current.style.backgroundColor = 'red'
        if (issues_list.length !== ref_count.current) {
            showNotification([...issues_list])
            ref_count.current=issues_list.length 
        }
    }
    else {
        if (ref_el.current !== undefined) {
            ref_el.current.style.backgroundColor = 'rgb(36, 233, 69)'
            ref_count.current = 0
        }
    }
    const record_issue = async (event) => {
        axios.post('/record-machine-params', {
            machine_params: machine_params
        })
    }
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
                    {History.length !== 0 ? (<PowerHistory chart_data={History} />) : null}
                </div>
                <div className={`${styles.Grid_line} ${styles.Temperature}`}>
                    <h3>Temperature Level Indicator </h3> <h4>Temperature</h4> <h3>{machine_params.temperature}&deg; C</h3> {History.length !== 0 ? (<TemperatureHistory chart_data={History} />) : null} </div>
                <div className={`${styles.Grid_line} ${styles.Power}`}>
                    <h4>Power Consumption</h4>
                    <GaugeChart2 power={machine_params.power} />
                    <span>(KW)</span>
                </div>
                <div className={`${styles.Grid_line} ${styles.Vibrational}`}><h3 style={{ marginTop: '0', marginBottom: '0.2%' }} >Realtime Vibrational Analysis</h3>
                    <div className={styles.Locations}>
                        {Object.keys(locations).map((el, i) =>
                            <Card key={i * 99} location_id={el} bearing_number={locations[el]} machine_id={machine_id} />
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
