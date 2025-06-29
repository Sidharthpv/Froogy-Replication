import React, { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase'
import { FadeLoader } from 'react-spinners'
import { Modal } from 'react-bootstrap';
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

function AllSavings({userId}) {

    const [show, setShow] = useState(false);
      
    const handleClose = () => setShow(false);
    const handleShow = (selectSavingName,selectCategoryId,selectSavingId,selectSavingAmount) => {
      setSelectedSaving(selectSavingName)
      setSelectedSavingId(selectSavingId)
      setSelectedSavingAmount(selectSavingAmount)
      setSelectedCategory(selectCategoryId)
      setShow(true)};


    const[savingsArray,setSavingsArray] = useState([])
    const[categories1,setCategories1] = useState([])
    const[isDisabled, setIsDisabled] = useState(false);
    const[loading,setLoading] = useState(false)
    const[updatedDate,setUpdatedDate] = useState('')
    const[updatedAmount,setUpdatedAmount] = useState('')
    const[updatedName,setUpdatedName] = useState('')
    const[updatedCategory,setUpdatedCategory] = useState('')
    const[selectedSavingId,setSelectedSavingId] = useState('')
    const[selectedSavingAmount,setSelectedSavingAmount] = useState('')
    const[selectedSaving,setSelectedSaving] = useState('')
    const[selectedCategory,setSelectedCategory] = useState('')

    

    useEffect(()=>{
        fetchSavings();
        fetchCategories1();
    },[userId])


//---------------fetching all the categories in the database----------------------
      const fetchCategories1 = async () => {
          try{
              const categories1Ref = collection(db,`users/${userId}/categories`);
              const categoriesSnap1 = await getDocs(categories1Ref);
              const categoryList1 = categoriesSnap1.docs.map((doc)=>({
                  id:doc.id,
                  ...doc.data(),
              }));
              setCategories1(categoryList1)
              console.log(categories1);
              
          }
          catch(error){
              console.log("error fetching categories:", error);
              
          }
      }
  // -------------------------------------------------------------------------------
  


    //--------------------- Function for fetching all the savings------------------------------
    const fetchSavings = async()=>{
      setLoading(true)
        try{
            const fetchedSavings = []
            const categoriesSnap = await getDocs(collection(db,`users/${userId}/categories`));

            if (categoriesSnap.empty) {
              console.log("No categories found");
            }

            for(const categoryDoc of categoriesSnap.docs){
                if(categoryDoc.data().type=="saving"){
                  const categoryId = categoryDoc.id;
                  const categoryname = categoryDoc.data().name;
        
                  // console.log(`Fetching expenses for category: ${categoryname} (ID: ${categoryId})`);
        
                  const savingQuery = query(collection(db,`users/${userId}/categories/${categoryId}/savings`));
                  const savingsSnap = await getDocs(savingQuery);
        
                  if (savingsSnap.empty) {
                    console.log(`No expenses found for category: ${categoryname}`);
                  }
        
                  savingsSnap.forEach((savingDoc)=>{
                    const savingData = savingDoc.data();
        
                    console.log("Saving Data:", savingData);
        
                      const dateObj = savingData.timestamp.toDate();
                      const date = dateObj.getDate();
                      const month = dateObj.toLocaleString("default",{month:"short"});
                      console.log("date:",date);
                      
        
                      fetchedSavings.push({
                        id: savingDoc.id,
                        categoryId,
                        date: `${date}`,
                        month: month,
                        name: savingData.name,
                        amount: savingData.amount,
                        timestamp: dateObj,
                        category: categoryname
                      });
                    
                  });
                }
                
            }

            // Sorting the savings
            fetchedSavings.sort((a,b)=>b.timestamp - a.timestamp)
            setSavingsArray(fetchedSavings)
            setLoading(false)
        }catch(err){
            setLoading(false)
            toast.error("Error fetching savings! Try again")
            
        }
        
    }
  //-------------------------------------------------------------------------------------------------

//------------------------------- function for editing savings---------------------------------------
    const editSavings = async()=>{
      setLoading(true)
        for(let i of savingsArray){
          if(i.name == selectedSaving){
            try{
              console.log("the selected updation category is :",updatedCategory);
      
              if(updatedAmount<0 ){
                alert("Enter valid expense amount!")
              }
              else if(!updatedCategory){
                  alert("enter valid category")
              }
              else if(!updatedName){
                  alert("enter valid expense name")
              }
              
              // first the saving is deleted
              deleteSaving(i.id,i.categoryId,i.amount)
              
              // now add the saving again as a new one
              
              
      
              const categoryPath = `users/${userId}/categories/${updatedCategory}`;
              // console.log(categoryPath);
              
              const categoryRef = doc(db,categoryPath);
      
              // updating the totalSaving field
              const userRef = doc(db,`users/${userId}`);
              const userDoc = await getDoc(userRef);
              let currentTotalSavings = 0;  
              if (userDoc.exists()) {
                currentTotalSavings = userDoc.data().totalSavings || 0;
              }
              const newTotalSavings = currentTotalSavings + Number(updatedAmount);
              await updateDoc(userRef,{totalSavings: newTotalSavings})
      
              const savingRef = doc(collection(categoryRef,"savings"));
      
              const currentDate = new Date(updatedDate);
              // const expenseDate = dateOption === "today" ? currentDate : new Date(currentDate.setDate(currentDate.getDate()-1))
              await setDoc(savingRef,{
                  name: updatedName,
                  amount: Number(updatedAmount),
                  timestamp: currentDate,
              });
      
              
              // console.log("expense added successfully");
              setUpdatedAmount("");
              setUpdatedName("");
              setUpdatedCategory("");
              setUpdatedDate("");
              fetchSavings();
              handleClose()
              setLoading(false)
              toast.success("Saving edited successfully")
            }catch(err){
              setLoading(false)
              toast.error("Error editing Saving! Try again")
              
            }
          }
        }
    }

//-------------------------------------------------------------------------------------------------------

    // -------------------------Function for deleting savings--------------------------------------
    const deleteSaving = async(savingId,categoryId,amount)=>{
      setLoading(true)
      try{
        setIsDisabled(true)
        await deleteDoc(doc(db,`users/${userId}/categories/${categoryId}/savings/${savingId}`));

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
        handleClose()
        setLoading(false)
      }
      catch(err){
        setLoading(false)
        toast.error("Error deleting savings! Try again")
        setIsDisabled(false)
      }
      
      
    }
  //----------------------------------------------------------------------------------------------------

  return (
    <>
      <div className='d-flex flex-column' style={{padding:'0',margin:'0'}}>
      <div className="row " style={{padding:'0',margin:'0'}}>
        <div className="col-sm-1"></div>
        <div className="col-sm-10  mt-5 d-flex flex-column" style={{margin:'0',paddingLeft:'0',paddingRight:'0'}}>
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
                              <p style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)'}} className='text-start'>{eachSaving.category}</p>
                          </div>
                      </div>
                      <div className=' d-flex flex-row-reverse' style={{paddingRight:'24px'}}>
                          <div className='d-flex pt-2'>
                              <p style={{color:'white',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='text-end '>${eachSaving.amount} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginTop:'-3px'}} onClick={()=>handleShow(eachSaving.name,eachSaving.categoryId,eachSaving.id,eachSaving.amount)}>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M16.0856 3.99997C16.8666 3.21892 18.133 3.21892 18.914 3.99997L19.9998 5.08576C20.7808 5.86681 20.7808 7.13313 19.9998 7.91418L17.9998 9.91419L14.0856 5.99997L16.0856 3.99997ZM16.914 5.99997L17.9998 7.08576L18.5856 6.49997L17.4998 5.41418L16.914 5.99997ZM13.4998 6.58576L17.414 10.5L7.91401 20H3.81934L4.56609 15.5195L13.4998 6.58576ZM6.43351 16.4805L6.18026 18H7.08558L14.5856 10.5L13.4998 9.41418L6.43351 16.4805Z" fill="#717171"/>
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


      <div className="row">
        <div className="col-1"></div>
        <div className="col-10" style={{margin:'0'}}>
        <Modal show={show} onHide={handleClose} className='modal-sm expenseModal ' style={{backgroundColor:'transparent',marginTop:'115px'}} >
          <Modal.Body style={{backgroundColor:'var(--Grey-900)'}}>
              <div className="container p-2" style={{backgroundColor:'transparent',marginTop:'24px',paddingLeft:'24px'}}>
                  <p style={{color:'white',backgroundColor:'transparent',fontSize:'var(--H3)'}}>Edit expense</p>
                  <input class="form-control form-control-lg formInput text-light " type="date" id='expenseDate' value={updatedDate} placeholder="Date" style={{width:'100%',backgroundColor:'var(--Grey-900)',borderRadius:'10px',marginBottom:'16px'}} onChange={e=>setUpdatedDate(e.target.value)}/>
                  <input class="form-control form-control-lg formInput text-light " type="text" id='expenseAmount' value={updatedAmount} placeholder="Amount" style={{width:'100%',backgroundColor:'var(--Grey-900)',borderRadius:'10px',marginBottom:'16px'}} onChange={e=>setUpdatedAmount(e.target.value)}/>

                  <select class="form-select form-select-lg " value={updatedCategory}   style={{borderWidth:'0.2px',width:'100%',borderRadius:'10px',backgroundColor:'var(--Grey-900)',color:'var(--Grey-300)',opacity:'0.8',marginBottom:'16px',fontSize:'var(--Body-Medium)',height:'45px'}} onChange={(e)=>{
                    console.log("the selected category for updation is :",e.target.value);
                    
                    setUpdatedCategory(e.target.value)}}>
                    <option value="" disabled>Category</option>
                    {
                        categories1.map((category)=>(
                            
                            
                            <option key={category.id} value={category.id}>{category.name}</option>
                            
                            
                         )) 
                     } 
                    </select>

                    <input class="form-control form-control-lg formInput text-light " type="text" id='expenseName' value={updatedName} placeholder="Expense name" style={{width:'100%',backgroundColor:'var(--Grey-900)',borderRadius:'10px',marginBottom:'16px'}}onChange={e=>setUpdatedName(e.target.value)}/>

                    <div className='action-button ' style={{backgroundColor:"transparent",marginBottom:'16px'}}>
                        <button className='btn  ps-3 pe-3 pt-2 pb-2 ' style={{width: "100%",height:'45px',borderRadius:'30px',fontSize:'16px'}} onClick={editSavings}>Update savings</button>
                    </div>
                    <div className='action-button ' style={{backgroundColor:"transparent"}}>
                        <button className='btn  ps-3 pe-3 pt-2 pb-2 ' style={{width: "100%",height:'45px',borderRadius:'30px',fontSize:'16px',backgroundColor:'transparent',color:'var(--High-Risk)'}} onClick={!isDisabled ? ()=>deleteSaving(selectedSavingId,selectedSavingAmount) : null}>Delete savings</button>
                    </div>
              </div>
          </Modal.Body>
        </Modal>
        </div>
        <div className="col-1"></div>
      </div>


        {
            loading&&(
                <div className='spinner'>
                    <FadeLoader color='var(--Primary-400)' />
                </div>
            )

        }
        


        <ToastContainer position="top-center" autoClose={3000}/>
    </>
  )
}

export default AllSavings
