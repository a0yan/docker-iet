import './App.css';
import queryString from "query-string";
import React, { useState,useEffect,lazy,Suspense } from 'react';
import axios from 'axios'
import Login from './Component/Login/Login';
import {Redirect, Route,Switch} from 'react-router-dom'
const Home=lazy(()=>import('./Component/Home/Home'));
const FreqAmp=lazy(()=>import('./Component/Freq_amp/Freq_amp'))
const FreqPhase=lazy(()=>import('./Component/Freq_phase/Freq_phase'));
const Acctime=lazy(()=>import('./Component/Acc_time/Acc_time'));
function App(props) {
  const [Auth, setAuth] = useState(false)
  const [user, setUser] = useState(null)
  useEffect(() => {
    const query=queryString.parse(props.location.search)
    const getstatus=async()=>{
      const res=await axios({
          method:'GET',
          url:'/is-verified',
          headers:{token:localStorage.token}

      })
      if(res.status===201){
      setUser(res.data.user)
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
  }, [props.history,props.location.search,setUser])
  const logout=()=>{
    window.localStorage.clear();
    setAuth(false)
    props.history.push(`/`)
  }
  const classes=['Option']
  if (!Auth){
    classes.push('Hidden')
  }
  return (
    <div className="App">
    <div className="Navbar">
      <img className='Logo' src='./logo.png'  alt="Logo" />
      <div className="Options">
        <div className="Option">About Us</div>
        <div className="Option">Contact Us</div>
        <div className={classes.join(' ')} onClick={logout}>Logout</div>
      </div>
    </div>
    <Switch>
    <Suspense fallback={<div>Loading...</div>}>
      <Route exact path='/' render={(props)=>!Auth?(<Login  setAuth={setAuth} setUser={setUser} {...props} /> ):(<Redirect to='/home' />)} />
      <Route  path='/home' render={(props)=>Auth?(<Home {...props} user={user} setUser={setUser} setAuth={setAuth}  />):(<Redirect to='/'/>)} />
      <Route path='/freq_amp' render={(props)=>Auth?(<FreqAmp {...props} user={user}/>):null } />
      <Route  path='/freq_phase' render={(props)=>Auth?(<FreqPhase  {...props} user={user} />):null} />
      <Route  path='/acc_time' render={(props)=>Auth?(<Acctime {...props}  user={user} />):null} />
      </Suspense>
    </Switch>
    </div>
  );
}

export default App;
