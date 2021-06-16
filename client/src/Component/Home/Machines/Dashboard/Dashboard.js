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
// This function asks the user for notifications and notify them regarding the issues when called
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
    // We are using useref in some cases instead of usestate because state is refreshed and clears after rerender while refs donot change after rerenders
    const ref_el = useRef() // refers to the issues div whoose background color need to be changed
    const ref_count = useRef(0) //refers to the count of the number of issues
    const uptime_ref = useRef(0) // refers to the yesterdays uptime as it is required to be rendered only once
    // MAchine parameters
    const [machine_params, setmachine_params] = useState({
        min_oil_level: 0,
        oil_level: 0,
        max_oil_level: 100,
        oil_quality: 0,
        power: 100,
        temperature: 0
    })
    // Current Uptime of the equipment
    const [time, settime] = useState('')
    // Yesterdays Uptime
    // Issues regarding different properties of the equipment
    const [issues, setissues] = useState({
        High_Power_Consumption: 0,
        Low_Power: 0,
        Low_Oil_Level: 0,
        High_Oil_Level: 0,
        High_Temperature: 0,
        Low_Temperature: 0
    })
    // Stores the previous 100 readings of Power and Temperature History that are to be plot
    const [History, setHistory] = useState([])
    // Stores the value true or false If the corresponding tile is visible or not which is linked with the checkbox
    const [checkbox, setcheckbox] = useState({
        Uptime: true,
        Oil_Management_System: true,
        Power_Consumption_History: true,
        Temperature_Level_Indicator: true,
        Power_Consumption: true
    })
    useEffect(() => {
        const get_data = async () => {
            // The get_data function is ran after approx every 3 sec or 3000 msec to retrieve the newest data possible from the
            // database and accordingly change the properties like Current Issues  
            if (uptime_ref.current === 0) {
                // If yesterdays uptime is not updated update it
                const yes_uptime = await axios.post('/get-yesterday-uptime', {
                    user_id: user,
                    machine_id: machine_id
                })
                if (yes_uptime.data !== null) {
                    // setting the reference as 
                    uptime_ref.current = (timeConverter(yes_uptime.data.yesterday_uptime))
                }
            }
            // Call to recieve all the machine parameters with respect to machine_id and user_id
            const response = await axios.post('/get-machine-params', {
                user: user,
                machine_id: machine_id
            })
            if (response.data !== false) {
                // History data includes present data + past 100 rows +Daily Avg + Hourly Avs 
                setHistory(response.data);
                //Present Machine Data is 1st element of the 100 row data array as it is ordered neswest to oldest.
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
                // If Oil level < Min Oil Level Issue is incremented 
                if (response.data.data[0].oil_level < response.data.data[0].min_oil_level) {
                    new_issues = {
                        ...new_issues,
                        Low_Oil_Level: 1,
                        High_Oil_Level: 0

                    }

                }
                // Similarly for other properties
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
                // If Power is less than threshold limit then the machine is switched off and uptime goes to 00:00:00
                // and the current time is stored in the database so when power is above the threshold limit 
                // then the current time when machine is running is sybtracted from the stored time so that running time is
                // calculated  
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
                //If power is above the threshold limit then the uptime is calculated by  suntracting current time by the
                // stored time when machine was down.
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
                // Atlast when all checks of parameters are completed the state of issues is changed.
                setissues(new_issues)
            }
        }
        get_data()
        const clear = setInterval(() => get_data(), 3000) // Function calling every 3 secs

        return () => {
            clearInterval(clear) // Unmounting
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [machine_id, user])


    const issues_list = Object.keys(issues).filter(el => issues[el] > 0) // Filters and stores the keys in an array of issue names if there are any issues as they will be >0.
    if (issues_list.length !== 0) {
        // If number of issues >0
        ref_el.current.style.backgroundColor = 'red' // Changes the colour of the issues div-Reference is used instead of state as its value is persisted across re render.
        // This is tricky as we donot want to notify the user about the issues  everytime the get_data() function fetches new results
        // We push a notification only when the count of issues changes from the previous count when results were fetched.
        if (issues_list.length !== ref_count.current) {
            showNotification([...issues_list]) // Show all the issues in the notification
            ref_count.current = issues_list.length // Now the current issues length is stored in reference so it can be compared next time.
        }
    }
    // If there are no issues change the colour of the div back to green
    else {

        if (ref_el.current !== undefined) // Waiting till ref_el refrences to the issues div else it will cause an error 
        {
            ref_el.current.style.backgroundColor = 'rgb(36, 233, 69)'
            ref_count.current = 0 // number of issues are 0
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
                {/* All the Checkboxes are in this div which have a set checkbox property which changes the checkbox value*/}
                <div>
                    <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Uptime" label="Uptime" value={checkbox.Uptime} />
                    <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Power_Consumption" label="Power Consumption" value={checkbox.Power_Constmption} />
                </div>
                <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Oil_Management_System" label="Oil Management System" value={checkbox.Oil_Management_System} />
                <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Temperature_Level_Indicator" label="Temperature Level Indicator" value={checkbox.Temperature_Level_Indicator} />
                <Checkbox checkbox={checkbox} setcheckbox={setcheckbox} name="Power_Consumption_History" label="Power Consumption History" value={checkbox.Power_Consumption_History} />
            </div>
            <div className={styles.Dashboard}>
                {/* Uptime Div */}
                <div className={`${styles.Grid_line} ${styles.Uptime} ${!checkbox.Uptime ? styles.Hidden : null}`}><h3 className={styles.Uptime_Heading} >Uptime</h3> <h3 className={styles.Uptime_Heading}>{time}</h3><h3 className={styles.Uptime_Heading}>Yesterday's Uptime</h3><h3 className={styles.Uptime_Heading}>{uptime_ref.current}</h3></div>
                {/* Oil Level Div uses GaugeChart which is used from react-gauge-chart library */}
                <div className={`${styles.Grid_line} ${styles.Oil} ${!checkbox.Oil_Management_System ? styles.Hidden : null}`}><h3>Oil Management System </h3><h3>Oil Level Indicator</h3>
                    <GaugeChart
                        oil_percent={((machine_params.oil_level - machine_params.min_oil_level) / (machine_params.max_oil_level - machine_params.min_oil_level)) * 100}
                    /> <h3>Oil Quality Indicator</h3><GaugeChart oil_percent={machine_params.oil_quality} />
                </div>
                {/* Temperature Level and Temperature Control Div */}
                <div className={`${styles.Grid_line} ${styles.Temperature} ${!checkbox.Temperature_Level_Indicator ? styles.Hidden : null}`}>
                    <h3>Temperature Level Indicator </h3> <h4>Temperature</h4> <h3>{machine_params.temperature}&deg; C</h3> {History.length !== 0 ? (<TemperatureHistory chart_data={History} />) : null}
                </div>
                {/* Power Consumption Report  Div*/}
                <div className={`${styles.Grid_line} ${styles.Report} ${!checkbox.Power_Consumption_History ? styles.Hidden : null}`}>
                    <h3>Power Consumption History </h3>
                    {History.length !== 0 ? (<PowerHistory chart_data={History} />) : null}
                </div>
                {/* Power Consumption Meter */}
                <div className={`${styles.Grid_line} ${styles.Power} ${!checkbox.Power_Consumption ? styles.Hidden : null}`}>
                    <h4>Power Consumption</h4>
                    <GaugeChart2 power={machine_params.power} />
                    <span>(KW)</span>
                </div>
                {/* Vibrational Analysis Div */}
                <div className={`${styles.Grid_line} ${styles.Vibrational}`}>
                    <h3 className={styles.Vibrational_Heading}>Realtime Vibrational Analysis</h3>
                    <div className={styles.Locations}>
                        {/* Random keys required to identify each component uniquely when iterating over */}
                        {Object.keys(locations).map((el, i) =>
                            <Card key={(i +101)* 99} location_id={el} bearing_number={locations[el]} machine_id={machine_id} />
                        )}
                    </div>
                </div>
                <div style={{ backgroundColor: 'rgb(36, 233, 69)' }} className={`${styles.Grid_line} ${styles.Issues}`} ref={ref_el} >
                    <h3>Current Issues</h3>
                    {issues_list.length !== 0 ? issues_list.map((el,i) => (<span key={i+10097} >{el}</span>)) : <h4>No Issues</h4>}
                    {issues_list.length !== 0 ? <button className={styles.Button} onClick={(event) => record_issue(event)}>Record Issue</button> : null}
                </div>
            </div>

        </div>
    )
}

export default Dashboard
