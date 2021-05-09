import './App.css';
import queryString from "query-string";
import {React,useState,useEffect} from 'react'
import Home from './Component/Home/Home';
import Login from './Component/Login/Login';
import {Redirect, Route,Switch} from 'react-router-dom'
import axios from 'axios'
import FreqAcc from './Component/Freq_acc/Freq_acc';
import FreqPhase from './Component/Freq_phase/Freq_phase';
import Acctime from './Component/Acc_time/Acc_time';
function App(props) {
  const [Auth, setAuth] = useState(false)
  useEffect(() => {
    const query=queryString.parse(props.location.search)
    const getstatus=async()=>{
      const res=await axios({
          method:'GET',
          url:'http://localhost:5000/is-verified',
          headers:{token:localStorage.token}

      })
      if(res.data===true){
      setAuth(true)
      }
      else{
          setAuth(false)
      }
      
  }
  if (query.token) {
    window.localStorage.setItem("token", query.token);
    props.history.push('/home')
 }
      getstatus()
  }, [props.history,props.location.search])
  const logout=()=>{
    window.localStorage.clear();
    setAuth(false)
    props.history.push('/')
  }
  const classes=['Option']
  if (!Auth){
    classes.push('Hidden')
  }
  return (
    <div className="App">
    <div className="Navbar">
      <div className="Logo">LOGO</div>
      <div className="Options">
        <div className={classes.join(' ')} onClick={logout}>Logout</div>
      </div>
    </div>
    <Switch>
      <Route exact path='/' render={(props)=>!Auth?(<Login {...props} /> ):(<Redirect to='/home' />)} />
      <Route exact path='/home' render={(props)=>Auth?(<Home {...props} setAuth={setAuth} />):(<Redirect to='/'/>)} />
      <Route path='/freq_acc' render={(props)=>Auth?(<FreqAcc {...props}  db_name='freq_acc3'/>):null } />
      <Route exact path='/freq_phase' render={(props)=>Auth?(<FreqPhase {...props} db_name='freq_acc4'/>):null} />
      <Route exact path='/acc_time' render={(props)=>Auth?(<Acctime {...props} db_name='freq_acc5'/>):null} />
    </Switch>
    </div>
  );
}

export default App;
