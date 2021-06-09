const  msToTime=(duration)=>{
        
    var seconds = Math.floor((duration / 1000) % 60),
     minutes = Math.floor((duration / (1000 * 60)) % 60),
     hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
 
   hours = (hours < 10) ? "0" + hours : hours;
   minutes = (minutes < 10) ? "0" + minutes : minutes;
   seconds = (seconds < 10) ? "0" + seconds : seconds;
 
   return hours + ":" + minutes + ":" + seconds;
 }

const duration=59415537-19800000
console.log(msToTime(duration));

 module.exports=msToTime