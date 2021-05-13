import {React,useEffect,useState} from 'react'
import {Line} from 'react-chartjs-2'
import axios from 'axios'
import qs from 'query-string'
const Acc_time = (props) => {
    const [X, setX] = useState([])
    const [Y, setY] = useState([])
    const [AVG, setAVG] = useState([])
    const [TIMESTAMP,setTIME]=useState(null)
    const [Nodata, setNodata] = useState(false)
    useEffect(() => {
        const getData=async()=>{
            const params=qs.parse(props.location.search)
            const machine_id=params.machine
            const location_id=params.location 
            const response=await axios.get(`/get-data`,{
                headers:{
                    user:props.user,
                    machine_id:machine_id,
                    location_id:location_id}

            }
            )
            
            if (response.data!==null){
            const X_data=response.data.time.slice(1,-1).split(',').map(el=>parseFloat(el))
            let avg=0
            const l=X_data.length
            const Y_data=response.data.acceleration.slice(1,-1).split(',').map(el=>{
                avg=avg+(parseFloat(el)/l)
                return parseFloat(el)
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
    }, [props,Nodata])
    let data=null
    if (X.length!==0 && Y.length!==0){
         data={
            labels:X,
            datasets:[{
                data:Y,
                borderColor: '#1e5f74',
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
                    text: 'Time',
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
                    text: 'Acceleration',
                    color: 'black',
                },
            }
        },
        plugins: {
            title:{
                display:true,
                text:'Time History',
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

        <div style={{textAlign:'center',padding:'2%',backgroundColor:'white'}}>
            {TIMESTAMP!==null?<span>{TIMESTAMP.slice(0,-2)}</span>:null}
            {(X.length!==0 && Y.length!==0)?<Line data={data} options={options} />:null}
            {Nodata?(<h2>Sorry No Data Found !!!</h2>):null}
            
        </div>
    )
}

export default Acc_time
