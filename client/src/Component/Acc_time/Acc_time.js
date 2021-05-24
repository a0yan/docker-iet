import {React,useEffect,useState} from 'react'
import {Line} from 'react-chartjs-2'
import axios from 'axios'
import qs from 'query-string'
const Acc_time = (props) => {
    const [X, setX] = useState([])    // X-coordinate as a list  
    const [Y, setY] = useState([])   //  Y-coordinates as alist
    const [AVG, setAVG] = useState([]) // Average value of the Y-coordinates 
    const [TIMESTAMP,setTIME]=useState(null) // Timestamp of the data
    const [Nodata, setNodata] = useState(false) // To check if data is recieved or not in the front end
    useEffect(() => {
        const getData=async()=>{
            // To retrieve the data from the backend by sending user_id,machine_id
            // and location_id to uniquely idetify the required data 
            const params=qs.parse(props.location.search)  // Parse the machine_id and location_id from the url search params
            const machine_id=params.machine
            const location_id=params.location 
            const response=await axios.post(`/get-data`,{
                
                    user:props.user,
                    machine_id:machine_id,
                    location_id:location_id

            }
            )
            
            if (response.data!==null){
            // Change the state only If response is not null
            const X_data=response.data.time.slice(1,-1).split(',').map(el=>parseFloat(el))
            let avg=0
            const l=X_data.length
            const Y_data=response.data.acceleration.slice(1,-1).split(',').map(el=>{
                avg=avg+(parseFloat(el)/l)
                return parseFloat(el)
            })
            const indtime=new Date (response.data.timestamp)
            const new_time=indtime.toLocaleString('en-UK',{timeZone:'Asia/Kolkata'}) //Converting GMT to IST
            setTIME(new_time)
            const AVG_data=new Array(l).fill(avg)
            setX(X_data)         // Setting respective data in the array
            setY(Y_data)
            setAVG(AVG_data)
        }
        else{
            setNodata(true)
            
        }
    }
    getData()
    const clear=setInterval(()=>getData(),1800)   // Re runs the fetching of data after every 5 sec or 5000 ms
    return ()=>clearInterval(clear) // Clears the Interval when Component Unmounts
        
    }, [props,Nodata])
    let data=null
    if (X.length!==0 && Y.length!==0){
         data={
            labels:X,  // X-data
            datasets:[{
                data:Y,  //Y-data
                borderColor: '#1e5f74',
                label:'Machine 1'
            },{

                data:AVG, // AVG-data
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
            {TIMESTAMP!==null?<span>{TIMESTAMP}</span>:null} 
            {(X.length!==0 && Y.length!==0)?<Line data={data} options={options} />:null}
            {Nodata?(<h2>Sorry No Data Found !!!</h2>):null} 
            
        </div>
    )
}

export default Acc_time
