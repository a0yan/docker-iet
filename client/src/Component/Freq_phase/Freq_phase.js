import {React,useEffect,useState} from 'react'
import qs from 'query-string'
import {Line} from 'react-chartjs-2'
import axios from 'axios'
const Freq_phase = (props) => {
    const [X, setX] = useState([])
    const [Y, setY] = useState([])
    const [AVG,setAVG]=useState([])
    const [TIMESTAMP,setTIME]=useState(null)
    const [Nodata, setNodata] = useState(false)
    useEffect(() => {
        const params=qs.parse(props.location.search)
            const machine_id=params.machine
            const location_id=params.location
        const getData=async()=>{ 
            const response=await axios.get(`/get-data`,{
                headers:{
                    user:props.user,
                    machine_id:machine_id,
                    location_id:location_id
                }
            }
            )

            if(response.data!==null){
            const X_data=response.data.frequency.slice(1,-1).split(',').map(el=>parseFloat(el))
            let avg=0
            const l=X_data.length
            const Y_data=response.data.phase.slice(1,-1).split(',').map(el=>{
                avg=avg+(parseFloat(el)/l)
                return parseFloat(el)*(180/Math.PI)
            })
            const indtime=new Date (response.data.timestamp)
            const new_time=indtime.toLocaleString(undefined,{timezone:"Asia/Kolkata"})
            setTIME(new_time)
            const AVG_data=new Array(l).fill(avg)
            setX(X_data)
            setY(Y_data)
            setAVG(AVG_data)

        }
        else{
            setNodata(true)
        }
    }
        getData()
    }, [props])
    let data=null
    if (X.length!==0 && Y.length!==0){
         data={
            labels:X,
            datasets:[{
                data:Y,
                borderColor: '#023e8a',
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
                    text: 'Phase',
                    color: 'black',
                },
            }
        },
        plugins: {
            title:{
                display:true,
                text:'Phase',
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
        elements:{
            line:{borderWidth:1}
        },
        layout: {
            padding: 15
        }
    }
    return (

        <div style={{textAlign:'center',padding:'2%',backgroundColor:'white'}}>
            {TIMESTAMP!==null?<span>{TIMESTAMP.slice(0,-2)}</span>:null}
            {(X.length!==0 && Y.length!==0)?<Line data={data} options={options} />:null}
            {Nodata?(<h2>Sorry No Data Found !!!</h2>):null}
            
            
        </div>
    )
}

export default Freq_phase
