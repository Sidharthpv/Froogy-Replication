import React, { useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import { auth, provider, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { browserLocalPersistence, GoogleAuthProvider , setPersistence, signInWithPopup } from "firebase/auth";
import Header from '../Components/Header';
import { useAuthState } from 'react-firebase-hooks/auth';


function Login() {
  //ask for account choose during each login
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt : "select_account"
  })

  const[user] = useAuthState(auth)

  const navigate = useNavigate();

  useEffect(()=>{
    if(user){
      navigate("/home")
    }
  },[user])

  //create user document for first time login
  const createUserDoc = async(user)=>{
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          salary:0,
          totalBudgeted:0,
          totalSavings:0,
          totalExpenses:0,
          photoURL: user.photoURL,
          createdAt,
        });
        
        
      } catch (error) {
        console.error("Error creating user document: ", error);
      }
    }
  };
  
//function for google login
  const handleGoogleLogin = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDoc(user);
      console.log("User Info:", user);
      navigate("/home");
      
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to login");
    }
  };

  return (
    <>
      <Header/>
      <div className="container mt-2 p-5 w-100">
        <div className="container login-background ps-2 pe-2 align-items-start ">
          <div className="row">
            <div className="col-sm-4 ">
              
            </div>
            <div className="col-sm-4">
              <div className="container login-contents ms-0 d-flex flex-column flex-shrink-1 justify-content-center align-items-start flex-shrink-1">
                  <h1 className=''>Heya!</h1>
                  <p style={{fontSize:'16px'}}>Use this simple expense tracker to monitor your daily <br />spending</p>
                  <p className='text-warning'>If you are logging in for the first time, Please go to Budgets <br />to set up your categories and budget amounts, like $1000 <br />for groceries.</p>
                  <div className='login-button' style={{backgroundColor:"transparent"}}>
                    <button className='btn border p-2' onClick={handleGoogleLogin}>Login with Google</button>
                  </div>
                </div>
              </div>
            <div className="col-sm-4"></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
