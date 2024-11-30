import React, { useEffect, useState } from 'react'
import Header from '../Components/Header';
import SpecificCategory from '../Components/SpecificCategory';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

function ViewACategory() {
    const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); 
        console.log('User logged in:', currentUser.uid);
      } else {
        setUser(null); 
        console.log('No user is logged in.');
      }
      setLoading(false); 
    });

    return () => unsubscribe(); 
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }


  return (
    <>
      <Header insideHome/>
      <SpecificCategory userId={user.uid}/>
    </>
  )
}

export default ViewACategory
