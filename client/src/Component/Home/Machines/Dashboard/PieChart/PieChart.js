import React from 'react'
import {Pie} from 'react-chartjs-2' 
const PieChart = () => {
    const data={
        labels:['A','B','C','D','E'],
        datasets:[{
            data:[100,500,250,180,90],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(159,230,160)',
                'rgb(2,71,94)'
              ]
        }]
    }
    const options={
        plugins:{
            title:{
            display:true,
            text:'January 2021',
            font:{
                size:20
            }
        }
    }
}
    return (
        <div style={{height:'300px',width:'300px',textAlign:'center'}}>
            <Pie data={data} options={options}  height={1750}/>
        </div>
    )
}

export default PieChart
