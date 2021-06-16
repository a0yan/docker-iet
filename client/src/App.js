import './App.css';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from './api/axios'
import Login from './Component/Login/Login';
import Register from './Component/Register/Register'
import { Redirect, Route, Switch,Link} from 'react-router-dom'
const Home = lazy(() => import('./Component/Home/Home'));     //React Lazy Loading 
const FreqAmp = lazy(() => import('./Component/Freq_amp/Freq_amp')) //React Lazy Loading
const FreqPhase = lazy(() => import('./Component/Freq_phase/Freq_phase')); //React Lazy Loading
const Acctime = lazy(() => import('./Component/Acc_time/Acc_time')); //React Lazy Loading
function App(props) {
  const [Auth, setAuth] = useState(false) // Sets status Of the User IF Authenticated or not default False 
  const [user, setUser] = useState(null) // Sets the user_id recieved from the backend if authenticated 
  useEffect(() => {

    const getstatus = async () => { 
      // The utility Of this Function is to check 
      // if the user is signed in or not upon reload of the webpage by checking the stored token in the browser 
      // with the backend (is-verified route)
      const res = await axios({
        method: 'GET',  
        url: '/is-verified',
        headers: { token: localStorage.token } // Sending the stored token 

      })
      if (res.status === 201) {
        setUser(res.data.user)
        setAuth(true) // If response from server is OK changes the auth state to true and redirect to home page else false
      }
      else {
        setAuth(false)
      }

    }
    getstatus() // Function is called when the Page Mounts for tghe first time and on reloads.
  }, [props.history, props.location.search, setUser])
  const logout = () => {
    window.localStorage.clear();   // Logs out the user by changing auth state and clearing local storage of the token
    setAuth(false)
    props.history.push(`/`)
  }
  // These two are css classes defined to hide or show the register and logout option whenever it is appropriate
  const classes = ['Option']            
  const classes_2 = ['Option', 'Hidden']
  if (!Auth) {
    classes.push('Hidden') // Hides the Logout button If the user is not logged In
    classes_2.pop()
  }
  else {
    classes_2.push('Hidden')
  }
  return (
    <div className="App">
      <div className="Navbar">
        <a href='/'> <img className='Logo' src='./logo.png' alt="Logo" /></a>
        <div className="Options">
          <a href='https://www.infiniteendurancetech.com/'><div className="Option">About Us</div></a>
          <a href='https://www.infiniteendurancetech.com/'><div className="Option">Contact Us</div></a>
          <div className={classes.join(' ')} onClick={logout}>Logout</div>
          <Link to='/register' className={classes_2.join(' ')} onClick={logout}>Register</Link>
        </div>
      </div>
      <Switch>
      {/* Show Loading when PAge is about to load */}
        <Suspense fallback={<div>Loading...</div>}> 
          <Route exact path='/' render={(props) => !Auth ? (<Login setAuth={setAuth} setUser={setUser} {...props} />) : (<Redirect to='/home' />)} />
          <Route path='/home' render={(props) => Auth ? (<Home {...props} user={user} setUser={setUser} setAuth={setAuth} />) : (<Redirect to='/' />)} />
          <Route path='/freq_amp' render={(props) => Auth ? (<FreqAmp {...props} user={user} />) : null} />
          <Route path='/freq_phase' render={(props) => Auth ? (<FreqPhase  {...props} user={user} />) : null} />
          <Route path='/acc_time' render={(props) => Auth ? (<Acctime {...props} user={user} />) : null} />
          <Route exact path='/register' render={(props) => <Register {...props} />} />
        </Suspense>
      </Switch>
    </div>
  );
}

export default App;
