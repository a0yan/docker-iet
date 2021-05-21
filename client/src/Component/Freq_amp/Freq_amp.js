import {React,useEffect,useState} from 'react'
import {Line} from 'react-chartjs-2'
import axios from 'axios'
import qs from 'query-string'
const Freq_acc = (props) => {
    const [X, setX] = useState([]) // X-coordinate as a list
    const [Y, setY] = useState([]) // Y-coordinate as a list
    const [AVG, setAVG] = useState([]) // Avg  as a list
    const [TIMESTAMP,setTIME]=useState(null) // Timestamp of the data
    const [Nodata,setNodata]=useState(false) // To check if data is recieved or not in the front end
    const [Benchmark, setBenchmark] = useState(0)
    const [Ratios, setRatios] = useState([])
    useEffect(() => {
        const getData=async()=>{
            // To retrieve the data from the backend by sending user_id,machine_id
            // and location_id to uniquely idetify the required data 
            const params=qs.parse(props.location.search)   // Parse the machine_id and location_id from the url search params 
            const machine_id=params.machine
            const location_id=params.location
            const response=await axios.post(`/get-data`,{
                
                    user:props.user,
                    machine_id:machine_id,
                    location_id:location_id
                
            })
            if(response.data!==null){
            const X_data=response.data.frequency.slice(1,-1).split(',').map(el=>parseFloat(el)) // Converting the data from a string
            let avg=0                                                                           // of list to a list
            const l=X_data.length
            const Y_data=response.data.amplitude.slice(1,-1).split(',').map(el=>{
                avg=avg+(parseFloat(el)/l)                                  // Converting the data from a string and also calculating average value
                return parseFloat(el)
            })
            await setBenchmark(12*avg)
            const indtime=new Date (response.data.timestamp)
            const new_time=indtime.toLocaleString(undefined,{timezone:"Asia/Kolkata"}) // Changing timezone from GMT to IST
            setTIME(new_time)
            const AVG_data=new Array(l).fill(avg)
            setX(X_data)
            const peaks=Y_data.filter((el)=>el>=Benchmark)
            const first_el=peaks[0]
            const ratios=peaks.map((item)=>Math.round(item/first_el))
            setY(Y_data)
            setRatios(ratios)
            setAVG(AVG_data)
           }
           else{
               setNodata(true)
           }
        }
        
        const clear=setInterval(()=>getData(),1800)
        return ()=>clearInterval(clear)
        
    }, [props,Benchmark])
    let data=null
    if (X.length!==0 && Y.length!==0){
         data={
            labels:X,  // X-data
            datasets:[{
                data:Y,  // Y-data
                borderColor: '#202060',
                label:'Machine 1',
                elements:{
                point:{
                    radius:3,
                    pointStyle:function(context){
                        var index=context.dataIndex
                        var value=context.dataset.data[index]
                        return value>=Benchmark?'star':'circle'

                    }
                }
            }
            },{

                data:AVG, // Avg-data
                borderColor: '#cf0000',
                label:'Average',
                elements:{
                line:{
                    borderWidth:2
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

        <div style={{backgroundColor:'white',textAlign:'center',padding:'2%'}}>
            {TIMESTAMP!==null?<span>{TIMESTAMP.slice(0,-2)}</span>:null}
            {(X.length!==0 && Y.length!==0)?<Line data={data} options={options} /> :null}
            {Nodata?(<h2>Sorry No Data Found !!!</h2>):null}

        </div>
    )
}

export default Freq_acc
