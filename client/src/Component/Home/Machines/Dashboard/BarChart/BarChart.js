import React from 'react'
import { Bar } from 'react-chartjs-2'
const BarGraph = () => {
    const data = {
        labels: ['A', 'B', 'C', 'D', 'E'],
        datasets: [{
            label:['Expenses'],
            data: [110, 50, 90, 150, 77],
            backgroundColor: ['rgba(54, 162, 235, 0.8)']
        }]
    }
    const options = {
        indexAxis: 'y',
        plugins: {
            title: {
                display: true,
                text: 'January 2021',
                font: {
                    size: 20
                },
            },
        },
        
    }
    return (
        <div>
            <Bar data={data} options={options} height={350} />
        </div>
    )
}

export default BarGraph
