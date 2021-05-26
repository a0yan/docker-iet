import React,{useState,useEffect} from 'react'
import {Line} from 'react-chartjs-2'
const Temperature_History = ({chart_data}) => {
    const [X, setX] = useState([])
    const [Y, setY] = useState([])
    const current_history=chart_data.data
    useEffect(() => {
        const temp=[]
        const time=current_history.slice().reverse().map((el,i)=>{
            temp.push(el.temperature)
            return new Date(el.timestamp).toLocaleString('en-UK',{timeZone:'Asia/Kolkata'}).slice(11)
        })
        setX(time)
        setY(temp)
    }, [current_history])
    const data={
        labels:X,
        datasets:[{
            label:"Temperature °C",
            data:Y,
            borderColor: [
                '#ff8474'
              ],
              fill: false,
        }]}
        const options={
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        color: 'black',
                        
                    },
                    
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature °C',
                        color: 'black',
                    },
                }
            },
            plugins:{
                title:{
                display:true,
                text: 'Current Temperature V/S Time',
                font:{
                    size:15
                }
            }
        }
    }
    
    return (
        <div>
            <Line data={data} options={options} height={250}/>
        </div>
    )
}

export default Temperature_History
