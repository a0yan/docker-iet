import React from 'react'
import GaugeChart from 'react-gauge-chart'
const GaugeChart2 = ({power}) => {
    power=power/100
    return (
        <div>
            <GaugeChart id="gauge-chart2" 
            nrOfLevels={25} 
            percent={power}
            textColor={'Black'} 
/>
        </div>
    )

}
export default GaugeChart2
