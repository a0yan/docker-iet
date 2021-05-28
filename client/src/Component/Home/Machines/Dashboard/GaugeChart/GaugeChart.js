import React from 'react'
import GaugeChart from 'react-gauge-chart'
const Gauge_Chart = ({oil_percent}) => {
    oil_percent=(oil_percent/100)%1
    console.log(oil_percent);
    return (
        <div>
            <GaugeChart id="gauge-chart1" colors={['#ce1212','#ffcc29','#54e346']} textColor={'Black'}  percent={oil_percent}  />
        </div>
    )
}

export default Gauge_Chart
