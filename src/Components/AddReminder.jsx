import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebase';

function AddReminder({userId}) {

  const[payments,setPayments] = useState([])
  const[paymentName,setPaymentName] = useState('');
  const[paymentDate,setPaymentDate] = useState('');


  // --------------------------function for adding a new payment reminder----------------------------------
  const handleAddPayment = async()=>{
    if(!paymentName || !paymentDate){
      console.log("Please fill in all fields");
      
    }

    try{
      const paymentRef = collection(db,`users/${userId}/upcomingPayments`);
      await addDoc(paymentRef,{
        name: paymentName,
        date: paymentDate,
      });

      setPaymentName('');
      setPaymentDate('');

      fetchPayments();
    }
    catch(error){
      console.log("error adding reminder :",error);
      
    }
  }
// --------------------------------------------------------------------------------------------


// -----------------------------function for fetching all the upcoming payment reminders-----------------------
  const fetchPayments = async()=>{
    try{
      const paymentsSnap = await getDocs(collection(db,`users/${userId}/upcomingPayments`));
      const fetchedPayments = paymentsSnap.docs.map((doc)=>({
        id: doc.id,
        ...doc.data(),
      }));
      setPayments(fetchedPayments);
    }
    catch(error){
      console.log("error fetching the payment reminders:",error);
      
    }
  };
// -----------------------------------------------------------------------------------------------------


// -----------------------function for deleting a payment reminder from the databse-----------------------------
  const deleteReminder = async(paymentId)=>{
    try{
      await deleteDoc(doc(db,`users/${userId}/upcomingPayments/${paymentId}`));
      fetchPayments()
    }
    catch(error){
      console.log("error deleting reminder: ",error);
      
    }
  }
// ---------------------------------------------------------------------------------------------------------
  

  useEffect(()=>{
    fetchPayments();
  },[userId])


  return (
    <>
      <div className="row">
        <div className="col-2">
          
        </div>
        <div className="col-6 p-5 ms-5">
          <h5 style={{color:'white'}}>Payment reminders</h5>
          <p style={{color:"rgba(255, 255, 255, 0.315)"}}>We will add a reminder on home screen five days before the due date, every month.</p>
        </div>
        <div className="col-4"></div>
       
      </div>

      
{/* form for adding a new payment reminder */}
      <div className="container-fluid d-flex justify-content-center p-2 ">
        <div className="container p-2 w-25 d-flex flex-column justify-content-center input-wrapper" style={{marginTop:'60px'}}>
          <input class="form-control form-control-lg formInput text-light mb-3" type="text" id='paymentName' value={paymentName} onChange={e=>setPaymentName(e.target.value)} placeholder="Payment name"/>
          <input class="form-control form-control-lg formInput text-light " type="date" id='paymentDate' value={paymentDate} onChange={e=>setPaymentDate(e.target.value)} placeholder="Next payment date"/>
          <div className='action-button ' style={{backgroundColor:"transparent"}}>
              <button onClick={handleAddPayment} className='btn border border-1 ps-3 pe-3 pt-2 pb-2 mt-3' style={{width: "270px",height:'45px',borderRadius:'10px'}}>Add reminder</button>
          </div>
        </div>
      </div>


{/* displaying the existing payment reminders */}
      <div className="row mt-5">
        <div className="col-2"></div>
        <div className="col-8 ps-3 pe-3">
          {
            payments.map((payment)=>(
              <div className="container d-flex flex-row justify-content-between ps-4 mb-5">
                <div className='ms-5 ps-1'>
                  <p style={{color:'white'}}>{payment.date}</p>
                </div>
                <div className='me-5 pe-4'>
                  <p style={{color:'white',fontWeight:'500', fontSize:'18px'}}>{payment.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{fontSize:'14px'}}><i class="fa-solid fa-trash" style={{color: "#ffffff",cursor:'pointer',opacity:'0.5'}} onClick={()=>deleteReminder(payment.id)}></i></span></p>
                </div>
              </div>
            ))
          }
        </div>
        <div className="col-2"></div>
      </div>

      
    </>
  )
}

export default AddReminder
