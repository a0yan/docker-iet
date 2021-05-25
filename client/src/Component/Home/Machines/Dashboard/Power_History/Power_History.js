import React,{useEffect,useState} from 'react'
import {Line} from 'react-chartjs-2' 
const PowerHistory = ({chart_data}) => {
    const [X, setX] = useState([])
    const [Y, setY] = useState([])
    const [X_hourly, setX_hourly] = useState([])
    const [Y_hourly, setY_hourly] = useState([])
    const [X_daily, setX_daily] = useState([])
    const [Y_daily, setY_daily] = useState([])
    const [AVG,setAVG]=useState([])
    const current_history=chart_data.data
    const hourly_history=chart_data.hourly_avg
    const daily_history=chart_data.daily_avg
    useEffect(() => {
        let avg=0
        const len=Y.length
        const power=current_history.slice().reverse().map((el,i)=>{
            avg+=el.power/len
            return el.power
        })
        const AVG_data=new Array(len).fill(avg)
        const time=current_history.slice().reverse().map((el,i)=>{
            return new Date(el.timestamp).toLocaleString('en-UK',{timeZone:'Asia/Kolkata'}).slice(11)
        })
        const y_hourly=[]
        const x_hourly=hourly_history.map((el)=>{
            y_hourly.push(el.hourly_avg_power)
            return new Date(el.timestamp).toLocaleString('en-UK',{timeZone:'Asia/Kolkata'}).slice(11)
        })
        const y_daily=[]
        const X_daily=daily_history.map((el)=>{
            y_daily.push(el.daily_avg_power)
            return new Date(el.timestamp).toLocaleString('en-UK',{timeZone:'Asia/Kolkata'}).slice(11)
        })
        setY(power)
        setX(time)
        setAVG(AVG_data)
        setX_hourly(x_hourly)
        setY_hourly(y_hourly)
        setX_daily(X_daily)
        setY_daily(y_daily)
    }, [current_history,Y.length,hourly_history,daily_history])
    const data={
        labels:X,
        datasets:[{
            label:"Power",
            data:Y,
            borderColor: [
                'rgb(2,71,94)'
              ],
              fill: true,
              backgroundColor:['rgb(2,71,94,0.6)']
        },
        {

            data:AVG, // Avg-data
            borderColor: '#cf0000',
            label:'AVG',
            elements:{
            line:{
                borderWidth:1.5
            },
            point:{
                radius:0
            }
        }
            
        }
    ]
    }
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
                    text: 'Power',
                    color: 'black',
                },
            }
        },
        plugins:{
            title:{
            display:true,
            text:' Current Power V/S Time',
            font:{
                size:15
            }
        }
    }
}
const data_h={
    labels:X_hourly,
    datasets:[{
        label:"Power",
        data:Y_hourly,
        borderColor: [
            'rgb(7,41,34)'
          ],
          fill: true,
          backgroundColor:['rgb(7,41,34,0.6)']
    }]}
    const options_h={
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
                    text: 'Power',
                    color: 'black',
                },
            }
        },
        plugins:{
            title:{
            display:true,
            text: 'Hourly Avg Power V/S Time',
            font:{
                size:15
            }
        }
    }
}

const data_d={
    labels:X_daily,
    datasets:[{
        label:"Power",
        data:Y_daily,
        borderColor: [
            'rgb(110,94,104)'
          ],
          fill: true,
          backgroundColor:['rgb(110,94,104,0.6)']
    }]}
    const options_d={
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
                    text: 'Power',
                    color: 'black',
                },
            }
        },
        plugins:{
            title:{
            display:true,
            text: 'Daily Avg Power V/S Time',
            font:{
                size:15
            }
        }
    }
}
    return (
        <div style={{height:'100%'}}>
            <Line data={data} options={options}  height={200} style={{marginTop:'5%'}} />
            <Line data={data_h} options={options_h} height={300} style={{marginTop:'5%'}}/>
            <Line data={data_d} options={options_d} height={300} style={{marginTop:'5%'}}/>
        </div>
    )
}

export default PowerHistory
