import React, { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase'
import { FadeLoader } from 'react-spinners'
import { Modal } from 'react-bootstrap';
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";


function AllExpenses({userId}) {
  console.log("userId in AllExpenses:", userId);
  console.log("AllExpenses component rendered");

  const [show, setShow] = useState(false);
  
  const handleClose = () => setShow(false);
  const handleShow = (selectExpenseName,selectCategoryId,selectExpenseId,selectExpenseAmount) => {
    setSelectedExpense(selectExpenseName)
    setSelectedCategory(selectCategoryId)
    setSelectedExpenseId(selectExpenseId)
    setSelectedExpenseAmount(selectExpenseAmount)
    setShow(true)};
  
  const[expensesArray,setExpensesArray]=useState([])
  const[isDisabled, setIsDisabled] = useState(false);
  const[loading,setLoading] = useState(false)
  const[categories1,setCategories1] = useState([])
  const[updatedDate,setUpdatedDate] = useState('')
  const[updatedAmount,setUpdatedAmount] = useState('')
  const[updatedName,setUpdatedName] = useState('')
  const[updatedCategory,setUpdatedCategory] = useState('')
  const[selectedExpense,setSelectedExpense] = useState('')
  const[selectedCategory,setSelectedCategory] = useState('')
  const[selectedExpenseId,setSelectedExpenseId] = useState('')
  const[selectedExpenseAmount,setSelectedExpenseAmount] = useState('')
  
  
  


  useEffect(()=>{
    fetchExpenses();
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
  


  // -------------------function for fetching all the expenses----------------------------------
  const fetchExpenses = async()=>{
    setLoading(true)
    try{
      const fetchedExpenses = []
      const categoriesSnap = await getDocs(collection(db,`users/${userId}/categories`));

      if (categoriesSnap.empty) {
        console.log("No categories found");
      }

      for(const categoryDoc of categoriesSnap.docs){
        if(categoryDoc.data().type=="expense"){
          const categoryId = categoryDoc.id;
          const categoryname = categoryDoc.data().name;

          console.log(`Fetching expenses for category: ${categoryname} (ID: ${categoryId})`);

          const expensesQuery = query(collection(db,`users/${userId}/categories/${categoryId}/expenses`));
          const expensesSnap = await getDocs(expensesQuery);

          if (expensesSnap.empty) {
            console.log(`No expenses found for category: ${categoryname}`);
          }

          expensesSnap.forEach((expenseDoc)=>{
            const expenseData = expenseDoc.data();

            console.log("Expense Data:", expenseData);

              const dateObj = expenseData.timestamp.toDate();
              const date = dateObj.getDate();
              const month = dateObj.toLocaleString("default",{month:"short"});
              console.log("date:",date);
              

            fetchedExpenses.push({
              id: expenseDoc.id,
              categoryId,
              date: `${date}`,
              month: month,
              name: expenseData.name,
              amount: expenseData.amount,
              timestamp: dateObj,
              category: categoryname
            });
            
          });
        }
        
      }

      // Sorting the expenses
      fetchedExpenses.sort((a,b)=>b.timestamp - a.timestamp)
      
      console.log("Final fetched expenses:", fetchedExpenses);
      setExpensesArray(fetchedExpenses)
      setLoading(false)

    }
    catch(error){
      setLoading(false)
      if (error.message === "Failed to fetch") {
        toast.error("Network issue: Try again");
      } else {
      console.error("Error:", error.message);
      }

    }
  }
// -------------------------------------------------------------------------------------------


// ----------------------------function for editing an expense---------------------------------------
const editExpense = async()=>{
  setLoading(true)
  for(let i of expensesArray){
    if(i.name == selectedExpense){
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
        
        // first the expense is deleted
        deleteExpense(i.id,i.categoryId,i.amount)
        
        // now add the expense again as a new one
        
        

        const categoryPath = `users/${userId}/categories/${updatedCategory}`;
        // console.log(categoryPath);
        
        const categoryRef = doc(db,categoryPath);

        // updating the totalExpenses field
        const userRef = doc(db,`users/${userId}`);
        const userDoc = await getDoc(userRef);
        let currentTotalExpenses = 0;  
        if (userDoc.exists()) {
            currentTotalExpenses = userDoc.data().totalExpenses || 0;
        }
        const newTotalExpenses = currentTotalExpenses + Number(updatedAmount);
        await updateDoc(userRef,{totalExpenses: newTotalExpenses})

        const expenseRef = doc(collection(categoryRef,"expenses"));

        const currentDate = new Date(updatedDate);
        // const expenseDate = dateOption === "today" ? currentDate : new Date(currentDate.setDate(currentDate.getDate()-1))
        await setDoc(expenseRef,{
            name: updatedName,
            amount: Number(updatedAmount),
            timestamp: currentDate,
        });

        // updating the spent field in the category and updating percentage
        const categoryDoc = await getDoc(categoryRef)
        if(categoryDoc.exists()){
            const currentSpent = categoryDoc.data().spent || 0;
            const updatedSpent = currentSpent + Number(updatedAmount)

            //calculating new percentage
            const budget = categoryDoc.data().budget || 0;
            const updatedPercentage = budget>0?((updatedSpent/budget)*100).toFixed(2) : 0;
            
            await updateDoc(categoryRef,{
                spent : updatedSpent,
                percentage: updatedPercentage
            });
        }
        // console.log("expense added successfully");
        setUpdatedAmount("");
        setUpdatedName("");
        setUpdatedCategory("");
        setUpdatedDate("");
        fetchExpenses();
        handleClose()
        setLoading(false)
        toast.success("Expense edited successfully")
      }catch(err){
        setLoading(false)
        toast.error("Error editing expense! Try again")
        
      }
    }
  }
  

}


// -----------------------------function for deleting an expense from the database-------------------------
  const deleteExpense  =async(expenseId, categoryId, amount)=>{
    setLoading(true)
    try{
      setIsDisabled(true)
      //deleting the expense
      await deleteDoc(doc(db,`users/${userId}/categories/${categoryId}/expenses/${expenseId}`));
      
      //updating the spent field for the curresponding category
      const categoryRef = doc(db,`users/${userId}/categories/${categoryId}`);
      const categorySnap = await getDoc(categoryRef);
      if(categorySnap.exists()){
        const currentSpent = categorySnap.data().spent || 0;
        const updatedSpent = currentSpent - amount;
        const budget = categorySnap.data().budget || 0;
        const updatedPercentage = budget>0?((updatedSpent/budget)*100).toFixed(2) : 0;
        console.log(updatedPercentage);
        
        await updateDoc(categoryRef,{spent: updatedSpent,percentage: updatedPercentage});

        console.log("updated the spent for the category: ",categoryId);
        
      }

      //Updating the totalExpenses field
      const userRef = doc(db,`users/${userId}`);
      const userData = await getDoc(userRef);
      if(userData.exists()){
        const currentTotalExpenses = userData.data().totalExpenses || 0;
        const updatedExpenses = currentTotalExpenses - amount;
        await updateDoc(userRef,{totalExpenses: updatedExpenses})
      }

      fetchExpenses();
      setIsDisabled(false);
      handleClose()
      setLoading(false)
    }
    catch(error){
      setLoading(false)
      toast.error("Error deleting expense! Try again")
      setIsDisabled(false)

    }
  };
// ----------------------------------------------------------------------------------------------


  

  return (
    <>
    <div className='d-flex flex-column' style={{padding:'0',margin:'0'}}>
      <div className="row " style={{padding:'0',margin:'0'}}>
        <div className="col-sm-1"></div>
        <div className="col-sm-10  mt-5 d-flex flex-column" style={{margin:'0',paddingLeft:'0',paddingRight:'0'}}>
            <h5 style={{color:'white',fontSize:'var(--H3)',margin:'0',paddingLeft:'24px'}} >Expenses</h5>
            <div className="container  pb-5 pt-4" style={{margin:'0',paddingLeft:'0',paddingRight:'0'}}>
                {
                  expensesArray.map((eachExpense)=>(
                    <div className='container  expenseBorder d-flex flex-row flex-shrink-1 justify-content-between  text-center'>
                      <div className='d-flex  flex-row  justify-content-evenly p-2 ms-2'>
                          <div className="d-flex flex-column me-5 flex-shrink-1">
                              <p style={{color:'white',fontSize:'var(--Body-Large)'}} className='m-0 '>{eachExpense.date}</p>
                              <p style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)'}} >{eachExpense.month}</p>
                          </div>
                          <div className="d-flex flex-column flex-shrink-1">
                              <p style={{color:'white',fontSize:'var(--Body-Medium)'}} className='m-0 text-start '>{eachExpense.name}</p>
                              <p style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)'}} className='text-start'>{eachExpense.category}</p>
                          </div>
                      </div>
                      <div className=' d-flex flex-row-reverse' style={{paddingRight:'24px'}}>
                          <div className='d-flex align-items-center'>
                              <p style={{color:'white',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='text-end '>${eachExpense.amount} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={!isDisabled ? ()=>deleteExpense(eachExpense.id,eachExpense.categoryId,eachExpense.amount) : null} style={{marginTop:'-5px'}}>
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17 9H8L8 19H17V9ZM6 7V19C6 20.1046 6.89543 21 8 21H17C18.1046 21 19 20.1046 19 19V7H6Z" fill="#717171"/>
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M20 6L5 6L5 4L20 4V6Z" fill="#717171"/>
                                  <path d="M10 3L9 4H16L15 3H10Z" fill="#717171"/>
                                </svg> */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginTop:'-3px'}} onClick={()=>handleShow(eachExpense.name,eachExpense.categoryId,eachExpense.id,eachExpense.amount)}>
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
        <div className="col-10 container-fluid" style={{margin:'0'}}>
        <Modal show={show} onHide={handleClose} className='modal expenseModal ' style={{backgroundColor:'transparent',marginTop:'115px'}} >
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
                        <button className='btn  ps-3 pe-3 pt-2 pb-2 ' style={{width: "100%",height:'45px',borderRadius:'30px',fontSize:'16px'}} onClick={editExpense}>Update expense</button>
                    </div>
                    <div className='action-button ' style={{backgroundColor:"transparent"}}>
                        <button className='btn  ps-3 pe-3 pt-2 pb-2 ' style={{width: "100%",height:'45px',borderRadius:'30px',fontSize:'16px',backgroundColor:'transparent',color:'var(--High-Risk)'}} onClick={!isDisabled ? ()=>deleteExpense(selectedExpenseId,selectedCategory,selectedExpenseAmount) : null}>Delete expense</button>
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

export default AllExpenses
