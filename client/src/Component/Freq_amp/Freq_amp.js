import {React,useEffect,useState} from 'react'
import {Line} from 'react-chartjs-2'
import axios from 'axios'
const Freq_acc = ({db_name}) => {
    const [X, setX] = useState([])
    const [Y, setY] = useState([])
    const [AVG, setAVG] = useState([])
    const [TIMESTAMP,setTIME]=useState(null)
    useEffect(() => {
        const getData=async()=>{ 
            const response=await axios.get(`/get-data`)
            const X_data=response.data.frequency.slice(1,-1).split(',').map(el=>parseFloat(el))
            let avg=0
            const l=X_data.length
            const Y_data=response.data.amplitude.slice(1,-1).split(',').map(el=>{
                avg=avg+(parseFloat(el)/l)
                return parseFloat(el)
            })
            setTIME(response.data.timestamp)
            const AVG_data=new Array(l).fill(avg)
            setX(X_data)
            setY(Y_data)
            setAVG(AVG_data)
        }
        getData()
    }, [db_name])
    let data=null
    if (X.length!==0 && Y.length!==0){
         data={
            labels:X,
            datasets:[{
                data:Y,
                borderColor: '#202060',
                label:'Machine 1'
            },{

                data:AVG,
                borderColor: '#cf0000',
                label:'Average',
                elements:{
                line:{
                    borderWidth:1.5
                },
                point:{
                    radius:0
                }
            }
                
            }]
        }

    }
    const options = {
        responsive:true,
        maintainAspectRatio:true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Frequency',
                    color: 'black',
                    
                },
                ticks: {
                    display: true,
                    color:'black'
                },
                

            },
            y: {
                title: {
                    display: true,
                    text: 'Amplitude',
                    color: 'black',
                },
            }
        },
        plugins: {
            title:{
                display:true,
                text:'FFT',
                font:{
                    size:18,
                }
            },
            legend: {
                labels: {
                    font: {
                        size: 18
                    }
                }
            }
        },
        layout: {
            padding: 15
        },
        elements:{
            line:{borderWidth:1}
        },
    }
    return (

        <div style={{backgroundColor:'whitesmoke',textAlign:'center',padding:'2%'}}>
            {TIMESTAMP!==null?<span>{TIMESTAMP.slice(0,-2)}</span>:null}
            {(X.length!==0 && Y.length!==0)?<Line data={data} options={options} /> :null}
            {TIMESTAMP}
        </div>
    )
}

export default Freq_acc
