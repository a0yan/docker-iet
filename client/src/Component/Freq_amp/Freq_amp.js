import { React, useEffect, useState, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import axios from 'axios'
import qs from 'query-string'
const convert_to_float=(el)=>parseFloat(el)
const Freq_acc = (props) => {
    const [X, setX] = useState([]) // X-coordinate as a list
    const [Data, setData] = useState([]) // All Y-axis data
    const [TIMESTAMP, setTIME] = useState(null) // Timestamp of the data
    const [Nodata, setNodata] = useState(false) // To check if data is recieved or not in the front end
    const [Benchmark, setBenchmark] = useState(0)
    const [Imbalance, setImbalance] = useState(null)
    const ref_el = useRef()

    useEffect(() => {
        const getData = async () => {
            // To retrieve the data from the backend by sending user_id,machine_id
            // and location_id to uniquely idetify the required data
            const params = qs.parse(props.location.search)   // Parse the machine_id and location_id from the url search params 
            const machine_id = params.machine
            const location_id = params.location
            const bearing_number = params.bearing_number
            const response = await axios.post(`/get-data`, {

                user: props.user,
                machine_id: machine_id,
                location_id: location_id,
                bearing_number: bearing_number
                
            })
            if (response.data!== null) {
                const X_data = response.data.db_data.frequency.slice(1, -1).split(',').map(el => parseFloat(el)) // Converting the data from a string
                let avg = 0                                                                           // of list to a list
                const l =X_data.length
                const Y_data = response.data.db_data.amplitude.slice(1, -1).split(',').map(el => {
                    avg = avg + (parseFloat(el) / l)                                  // Converting the data from a string and also calculating average value
                    return parseFloat(el)
                })
                let imbalance = null
                let {bpfo,bpfi,ftf,bsf}=response.data.bearing_data!==undefined?response.data.bearing_data:Infinity
                bpfo=convert_to_float(bpfo)
                bpfi=convert_to_float(bpfi)
                ftf=convert_to_float(ftf)
                bsf=convert_to_float(bsf)
                await setBenchmark(10 * avg)
                let first = null
                const ratios = Y_data.map((el, index) => {
                    if (el >= Benchmark && first === null) {
                        first = X_data[index]
                        return 1
                    }
                    else if (el >= Benchmark) {
                        const ratio = (X_data[index] / first).toFixed(2)
                        if (first !== 0) {
                            
                            if(Math.abs(bpfo-ratio)<=0.05){   //0.05
                                    imbalance=`BPFO on ${bearing_number} , Please Check`
                                    
                            }
                            if(Math.abs(bpfi-ratio)<=0.05){
                                    imbalance=`BPFI on ${bearing_number} , Please Check`
                            
                            }
                            if(Math.abs(ftf-ratio)<=0.05){
                                    imbalance=`FTF on ${bearing_number} , Please Check`
                                    
                            }
                            if(Math.abs(bsf-ratio)<=0.05){
                                imbalance=`BSF on ${bearing_number} , Please Check`
                                
                            }
                            if(Math.abs(4-ratio)<=0.1){
                                    imbalance=`Imbalance , Please Check`
                                    
                            }
                            if(Math.abs(8-ratio)<=0.1){
                                
                                    imbalance=`Imbalance , Please Check`  
                            }
                                
                        }
                        return ratio

                    }
                    else {
                        return null
                    }
                })
                const indtime = new Date(response.data.db_data.timestamp)
                const new_time = indtime.toLocaleString('en-UK', { timeZone: 'Asia/Kolkata' }) // Changing timezone from GMT to IST
                const AVG_data = new Array(l).fill(avg)
                const data_map = X_data.map((el, index) => {
                    return {
                        x: el,
                        y: Y_data[index],
                        avg: AVG_data[index],
                        ratios: ratios[index]
                        
                    }
                })
                setX(X_data)
                setImbalance(imbalance)
                setTIME(new_time)
                setData(data_map)
            }
            else {
                setNodata(true)
            }
        }
        getData()
        const clear = setInterval(() => getData(), 3500)
        return () => clearInterval(clear)

    }, [props, Benchmark])
    let data = null
    if (X.length !== 0 && Data.length !== 0) {
        data = {
            labels: X,  // X-data
            datasets: [{
                data: Data,  // Y-data
                borderColor: '#202060',
                label: 'Machine 1',
                elements: {
                    point: {
                        radius: 3,
                        pointStyle: function (context) {
                            var index = context.dataIndex
                            var value = context.dataset.data[index].y
                            return value >= Benchmark ? 'star' : 'none'

                        }
                    },
                    parsing: {
                        xAxisKey: 'x',
                        yAxisKey: 'y'
                    },
                }
            }, {

                data: Data, // Avg-data
                borderColor: '#cf0000',
                label: 'Average',
                elements: {
                    line: {
                        borderWidth: 2
                    },
                    point: {
                        radius: 0
                    }
                },
                parsing: {
                    xAxisKey: 'x',   //Graph is plotted against X and AVG
                    yAxisKey: 'avg'
                }

            }, {

                data: Data, 
                backgroundColor: 'white',
                type: 'scatter',
                label: "Ratio to 1st Peak",
                parsing: {
                    xAxisKey: 'x',         //Graph is plotted against X and Ratios
                    yAxisKey: 'ratios'
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }


            }]
        }

    }
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Frequency',
                    color: 'black',

                },
                ticks: {
                    display: true,
                    color: 'black'
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
            title: {
                display: true,
                text: 'FFT',
                font: {
                    size: 18,
                }
            },
            legend: {
                labels: {
                    font: {
                        size: 18
                    }
                },
                display: true
            }
        },
        layout: {
            padding: 15
        },
        elements: {
            line: { borderWidth: 1 }
        },
        interaction: {
            mode: 'index'
        }
    }
    if (ref_el.current !== undefined) {
        if (Imbalance !== null) {
            ref_el.current.style.backgroundColor = 'red'
        }
        else {
            ref_el.current.style.backgroundColor = 'rgb(36, 233, 69)'
        }
    }
    return (

        <div style={{ backgroundColor: 'white', textAlign: 'center', padding: '2%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', flex: '1' }}>{TIMESTAMP !== null ? <span>{TIMESTAMP}</span> : null}</div>
            {(X.length !== 0 && Data.length !== 0) ? <Line data={data} options={options} /> : null}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <div ref={ref_el} style={{ height: '100px', width: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px' }}>
                    {Imbalance!==null ? <h3>{Imbalance}</h3> : <h3>No Issues</h3>}</div>
            </div>
            {Nodata ? (<h2>Sorry No Data Found !!!</h2>) : null}

        </div>
    )
}

export default Freq_acc
