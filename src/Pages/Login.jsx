import React, { useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { browserLocalPersistence, getRedirectResult, GoogleAuthProvider , setPersistence, signInWithPopup, signInWithRedirect } from "firebase/auth";
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

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        console.log("Checking for redirect result...");
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          console.log("Redirect result user:", result.user);
          await createUserDoc(result.user);
          navigate("/home"); // ✅ Redirect to home page
        } else {
          console.log("No redirect result available.");
        }
      } catch (error) {
        console.error("Redirect Login Error:", error);
      }
    };
  
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("Auth state changed:", currentUser);
      if (currentUser) {
        navigate("/home"); // ✅ Redirect to home on login
      }
    });
  
    checkRedirect(); // ✅ Always check redirect login on mount
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);



  
  

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
  // const handleGoogleLogin = async () => {
  //   try {
  //     console.log("Starting Google Login...");
  //     await setPersistence(auth, browserLocalPersistence).catch((error)=>{
  //       alert("Failed to set persistence: ",error)
  //     });
  //     console.log("Persistence set successfully.");
  //     await signInWithRedirect(auth, provider); // Redirects for login
  //     console.log("Redirect initiated successfully.");
  //     // navigate("/home");
      
  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     alert("Failed to login:", error.message);
  //   }
  // };

  // const handleGoogleLogin = async () => {
  //   try {
  //     await setPersistence(auth, browserLocalPersistence).catch((error)=>{
  //       alert("Failed to set persistence: ",error)
  //     });
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
  //     await createUserDoc(user);
  //     console.log("User Info:", user);
  //     // navigate("/home");
      
  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     alert("Failed to login:", error.message);
  //   }
  // };

  const handleGoogleLogin = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence); // 🔹 Ensure persistence before login
  
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
  
      // Detect Safari/iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
      if (isIOS || isSafari) {
        console.log("iOS or Safari detected. Using signInWithRedirect.");
        await signInWithRedirect(auth, provider); // 🔹 Use redirect to avoid pop-up issues
      } else {
        console.log("Using signInWithPopup.");
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          await createUserDoc(result.user);
          navigate("/home"); // 🔹 Ensure redirect to home
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to login: " + error.message);
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
                  <h1 className=''>Heya! update3</h1>
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
