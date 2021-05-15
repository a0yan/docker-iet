import { React} from 'react'
import styles from './Dashboard.module.css'
import PieChart from './PieChart/PieChart'
import GaugeChart from './GaugeChart/GaugeChart'
import GaugeChart2 from './GaugeChart2/GaughChart2'
import Card from './Card/Card'
import BarChart from './BarChart/BarChart'
const Dashboard = ({ heading, machine_id }) => {
    const locations=['Location 1','Location 2',"Location 3"]
    return (
        <div className={styles.Container}>
            <h2 className={`${styles.Heading}`}>Equipment {heading}</h2>
            <div className={styles.Dashboard}>
                {/* {location.map((el,i)=><Card key={i} location_id={i+1} location={el}  machine_id={machine_id} />)} */}
                <div className={`${styles.Grid_line} ${styles.Uptime}`}><h3>Total Uptime</h3><h3>2 Days 22 Hours </h3></div>
                <div className={`${styles.Grid_line} ${styles.Oil}`}><h3>Oil Management System </h3><h3>Oil Level Indicator</h3><GaugeChart /> <h3>Oil Quality Indicator</h3><GaugeChart /></div>
                <div className={`${styles.Grid_line} ${styles.Report}`}> <h3>Past Report </h3><PieChart /></div>
                <div className={`${styles.Grid_line} ${styles.Report_2}`}> <h3>Past Report </h3> <BarChart/> </div>
                <div className={`${styles.Grid_line} ${styles.Power}`}>
                    <h3>Power Consumption</h3>
                    <GaugeChart2 />
                    <span>(Kw)</span></div>
                <div className={`${styles.Grid_line} ${styles.Vibrational}`}><h3 style={{marginTop:'0',marginBottom:'2%'}} >Realtime Vibrational Analysis</h3>
                <div className={styles.Locations}>
                    {locations.map((el,i)=>
                        <Card key={i*81} location_id={i+1} machine_id={machine_id} location={el}/>
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
