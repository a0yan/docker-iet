import './App.css';
import queryString from "query-string";
import {React,useState,useEffect} from 'react'
import Home from './Component/Home/Home';
import Login from './Component/Login/Login';
import {Redirect, Route,Switch} from 'react-router-dom'
import axios from 'axios'
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
  }
  return (
    <div className="App">
    <div className="Navbar">
      <div className="Logo">LOGO</div>
      <div className="Options">
        <div className="Option" onClick={logout}>Logout</div>
      </div>
    </div>
    <Switch>
      <Route exact path='/' render={(props)=>!Auth?(<Login {...props} /> ):(<Redirect to='/home' />)} />
      <Route exact path='/home' render={(props)=>Auth?(<Home {...props} setAuth={setAuth} />):(<Redirect to='/'/>)} />
    </Switch>
    </div>
  );
}

export default App;
