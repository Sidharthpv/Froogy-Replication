import React, { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc } from "firebase/firestore";
import { db } from '../firebase'
import { FadeLoader } from 'react-spinners'


function AllSavings({userId}) {

    const[savingsArray,setSavingsArray] = useState([])
    const[isDisabled, setIsDisabled] = useState(false);
    const[loading,setLoading] = useState(false)
    
    

    useEffect(()=>{
        fetchSavings();
    },[userId])

    //--------------------- Function for fetching all the savings------------------------------
    const fetchSavings = async()=>{
        try{
            const fetchedSavings = []
            const savingsSnap = await getDocs(collection(db,`users/${userId}/savings`))

            if(savingsSnap.empty){
                console.log("no savings found");
                
            }

            for(const savingsDoc of savingsSnap.docs){
                const savingId = savingsDoc.id;
                const dateObj = savingsDoc.data().timestamp.toDate();
                const date = dateObj.getDate();
                const month = dateObj.toLocaleString("default",{month:"short"});

                fetchedSavings.push({
                    id: savingId,
                    date: `${date}`,
                    month: month,
                    name: savingsDoc.data().name,
                    amount: savingsDoc.data().amount,
                    timestamp: dateObj
                })
            }

            // Sorting the savings
            fetchedSavings.sort((a,b)=>b.timestamp - a.timestamp)
            setSavingsArray(fetchedSavings)

        }catch(err){
            console.log("error fetching savings: ",err);
            
        }
    }


    // Function for deleting savings
    const deleteSaving = async(savingId,amount)=>{
      setLoading(true)
      try{
        setIsDisabled(true)
        await deleteDoc(doc(db,`users/${userId}/savings/${savingId}`));

        // Updating the totalSavings field
        const userRef = doc(db,`users/${userId}`)
        const userData = await getDoc(userRef)
        if(userData.exists())
        {
          const currentTotalSavings = userData.data().totalSavings || 0
          const updatedSavings = currentTotalSavings - amount
          await updateDoc(userRef,{totalSavings: updatedSavings})
        }
        fetchSavings();
        setIsDisabled(false);
      }
      catch(err){
        console.log("error deleting the savings: ",err);
        
      }
      setLoading(false)
    }

  return (
    <>
      <div className='d-flex flex-column' style={{padding:'0',margin:'0'}}>
      <div className="row " style={{padding:'0',margin:'0'}}>
        <div className="col-sm-1"></div>
        <div className="col-sm-10 p-0 mt-5 d-flex flex-column" style={{margin:'0',paddingLeft:'0',paddingRight:'0'}}>
            <h5 style={{color:'white',fontSize:'var(--H3)',margin:'0',paddingLeft:'24px'}}>Savings</h5>
            <div className="container pb-5 pt-4" style={{margin:'0',paddingLeft:'0',paddingRight:'0'}}>
                {
                  savingsArray.map((eachSaving)=>(
                    <div className='container  expenseBorder d-flex flex-row flex-shrink-1 justify-content-between  text-center'>
                      <div className='d-flex  flex-row  justify-content-evenly p-2 ms-2'>
                          <div className="d-flex flex-column me-5 flex-shrink-1">
                              <p style={{color:'white',fontSize:'var(--Body-Large)'}} className='m-0 '>{eachSaving.date}</p>
                              <p style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)'}} >{eachSaving.month}</p>
                          </div>
                          <div className="d-flex flex-column flex-shrink-1">
                              <p style={{color:'white',fontSize:'var(--Body-Medium)'}} className='m-0 text-start '>{eachSaving.name}</p>
                              {/* <p style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)'}} className='text-start'>{eachExpense.category}</p> */}
                          </div>
                      </div>
                      <div className=' d-flex flex-row-reverse'>
                          <div className='d-flex pt-2'>
                              <p style={{color:'white',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='text-end '>${eachSaving.amount} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={!isDisabled ? ()=>deleteSaving(eachSaving.id,eachSaving.amount) : null} style={{marginTop:'-5px'}}>
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17 9H8L8 19H17V9ZM6 7V19C6 20.1046 6.89543 21 8 21H17C18.1046 21 19 20.1046 19 19V7H6Z" fill="#717171"/>
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20 6L5 6L5 4L20 4V6Z" fill="#717171"/>
                                  <path d="M10 3L9 4H16L15 3H10Z" fill="#717171"/>
                                </svg>
                              </p>
                          </div>
                      </div>
                    </div>
                  ))
                }
                
                    
                
            </div>
        </div>
        <div className="col-sm-1"></div>
      </div>

      {/* <div className="container justify-content-center " style={{marginTop:'-100px'}} >
        <div className="container p-2 d-flex flex-row flex-wrap justify-content-start" style={{minHeight:'45px',width:'100%',backgroundColor:'rgba(102,102,102,1)',overflowX: 'auto'}}>
          
        
        </div>
      </div> */}
      </div>


        {
            loading&&(
                <div className='spinner'>
                    <FadeLoader color='var(--Primary-400)' />
                </div>
            )

        }
        



    </>
  )
}

export default AllSavings
