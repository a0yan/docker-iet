// import React,{useRef,useState,useEffect} from 'react'

//  const Timetoms=(hrs,mins,secs)=>{

//     const duration=hrs*3600000+mins*60000+secs*1000
//     return duration
//  }
// const Uptime = ({power,hrs,mins,secs}) => {
//     const [timer, settimer] = useState(0)
//     const [isActive, setisActive] = useState(true)
//     const timer_id = useRef(null)
//     useEffect(() => {
//         if (power<50){
//         setisActive(false)
//         }
//         else{
//             setisActive(true)
//         }
//         if (isActive===true)
//         timer_id.current=setInterval(()=>{
//             settimer(prevtime=>prevtime+1000)
//         },1000)
//         else{
//             // const new_time=Timetoms(hrs,mins,secs)
//             settimer(0)
//             clearInterval(timer_id.current)
//         }
//         return ()=>clearInterval(timer_id.current)
//     }, [isActive,power])
//       const new_time=msToTime(timer)
//     return (
//         <div>
//             <h4>{new_time}</h4>
//         </div>
//     )
// }

// export default Uptime



const msToTime=(duration)=>{
        
    var seconds = Math.floor((duration / 1000) % 60),
     minutes = Math.floor((duration / (1000 * 60)) % 60),
     hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
 
   hours = (hours < 10) ? "0" + hours : hours;
   minutes = (minutes < 10) ? "0" + minutes : minutes;
   seconds = (seconds < 10) ? "0" + seconds : seconds;
 
   return hours + ":" + minutes + ":" + seconds;
 }
 export default msToTime