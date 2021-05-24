import React,{useEffect,useState} from 'react'
import {Line} from 'react-chartjs-2' 
const PowerHistory = ({history}) => {
    const [X, setX] = useState([])
    const [Y, setY] = useState([])
    const [AVG,setAVG]=useState([])
    useEffect(() => {
        let avg=0
        const len=Y.length
        const power=history.slice().reverse().map((el,i)=>{
            avg+=el.power/len
            return el.power
        })
        const AVG_data=new Array(len).fill(avg)
        const time=history.slice().reverse().map((el,i)=>{
            return new Date(el.timestamp).toLocaleString('en-UK',{timeZone:'Asia/Kolkata'})
        })
        setY(power)
        setX(time)
        setAVG(AVG_data)
    }, [history,Y.length])
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
            text:'Power V/S Time',
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

export default PowerHistory
