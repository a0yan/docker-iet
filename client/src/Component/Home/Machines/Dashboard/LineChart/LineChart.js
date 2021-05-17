import React from 'react'
import {Line} from 'react-chartjs-2' 
const PieChart = () => {
    const data={
        labels:['A','B','C','D','E','F','G','H','I','J','K','L','M','N'],
        datasets:[{
            data:[100,500,250,180,90,250,235,754,214,314,686,12,45,67,46,88,65,99,76,9,65],
            borderColor: [
                'rgb(2,71,94)'
              ],
              fill: true,
              backgroundColor:['rgb(2,71,94,0.6)']
        }]
    }
    const options={
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'X-Label',
                    color: 'black',
                    
                },
                
            },
            y: {
                title: {
                    display: true,
                    text: 'Y-Label',
                    color: 'black',
                },
            }
        },
        plugins:{
            title:{
            display:true,
            text:'January 2021',
            font:{
                size:15
            }
        }
    }
}
    return (
        <div style={{height:'100%'}}>
            <Line data={data} options={options} height={300}  />
        </div>
    )
}

export default PieChart
