import React, { useEffect, useState } from 'react'
import { doc, collection, setDoc, getDoc, updateDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FadeLoader } from 'react-spinners'
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";


function SetIncomeBudget({userId}) {
   
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const[categoryName,setCategoryName] = useState("")
    const[budget,setBudget] = useState("")
    const[totalBudgeted,setTotalBudgeted] = useState(0)
    const[totalSavings,setTotalSavings] = useState(0)
    const[totalExpenses,setTotalExpenses] = useState(0)
    const[salary,setSalary] = useState(0)
    const[surplus,setSurplus] = useState(0)
    const[categories,setCategories] = useState([])
    const[expSave,setExpSave] = useState("expenses")
    const[isDisabled, setIsDisabled] = useState(false);

    const[loading,setLoading] = useState(false)
    

    useEffect(() => {


    
        fetchTotals();
        fetchCategories();
        
        
      }, [userId]);


      // fetch all existing category details
      const fetchCategories = async () => {
        setLoading(true)
          try{
              const categoriesRef = collection(db,`users/${userId}/categories`);
              const categoriesSnap = await getDocs(categoriesRef);
              const categoryList = categoriesSnap.docs.map((doc)=>({
              id:doc.id,
              ...doc.data(),
          }));

          setCategories(categoryList);
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
      



      //fetch total budgeted amount,savings,expenses,salary and set the surplus amount
      const fetchTotals = async () => {
        setLoading(true)
        try {
          const userRef = doc(db, `users/${userId}`);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
              const userData = userDoc.data()
              setTotalBudgeted(userDoc.data().totalBudgeted || 0);
              setTotalSavings(userDoc.data().totalSavings || 0);
              setTotalExpenses(userDoc.data().totalExpenses || 0);
              setSalary(userData.salary || 0)
              setSurplus(userData.salary - userData.totalBudgeted)
              setLoading(false)
          }
        } catch (error) {
          setLoading(false)
          if (error.message === "Failed to fetch") {
            toast.error("Network issue: Try again");
          } else {
          console.error("Error:", error.message);
          }
        }
      };


      // --------------------------------function for adding salary-----------------------------
    const addSalary = async()=>{
      setLoading(true)
        // e.preventDefault();
        if(!salary || salary<=0){
            alert("enter a valid salary")
            return;
        }
        try{
            const userRef = doc(db, `users/${userId}`);
            await updateDoc(userRef, { salary: Number(salary) });
            setSalary(Number(salary))
            handleClose();
            setLoading(false)
          
        }
        catch(error)
        {
            setLoading(false)
            toast.error("Error adding salary! Try again")
            
        }
        
       
        
    }
// ----------------------------------------------------------------------------


//-------------------- function for adding a new category and the budget for it--------------------
    const addBudget = async () => {
      setIsDisabled(true)
      setLoading(true)
        // e.preventDefault();
    
        // Form validation
          if (!categoryName.trim()) {
            toast.warning("Please enter a valid category name.");
            setLoading(false);
            return;
          }

          if (!budget || isNaN(budget) || Number(budget) <= 0) {
            toast.warning("Please enter a valid budget amount greater than 0.");
            setLoading(false);
            return;
          }

          if (!expSave || (expSave !== "expenses" && expSave !== "savings")) {
            toast.warning("Please select a valid type (Expenses or Savings).");
            setLoading(false);
            return;
          }

        try {
          if(expSave=="expenses"){
            const percentage = budget > 0 ? 0 : 0;
            // Add the new category to the subcollection
            const categoryRef = doc(collection(db, `users/${userId}/categories`));
            await setDoc(categoryRef, { name: categoryName, budget: Number(budget), spent: 0, type: "expense" });
      
            //  Get the current total budgeted value
            const userRef = doc(db, `users/${userId}`);
            const userDoc = await getDoc(userRef);
            let currentTotalBudgeted = 0;
      
            if (userDoc.exists()) {
              currentTotalBudgeted = userDoc.data().totalBudgeted || 0;
            }
      
            // Update the totalBudgeted field
            const newTotal = currentTotalBudgeted + Number(budget);
            await updateDoc(userRef, { totalBudgeted: newTotal });
      
            setCategories((prevCategories)=>[
              ...prevCategories,
              {id: categoryRef.id,name: categoryName ,budget: Number(budget),spent:0,percentage:percentage}
            ]);

            // Update state to reflect new totalBudgeted
            setTotalBudgeted(newTotal);
            // setSurplus(salary - newTotal)
            console.log("data added successfully");
            toast.success("Expense category added successfully")
            
          }
          else{
            const percentage = budget > 0 ? 0 : 0;
            const categoryRef = doc(collection(db, `users/${userId}/categories`));
            // Add new savings category
            const savingsRef = doc(collection(db,`users/${userId}/categories`));
            await setDoc(savingsRef,{name: categoryName, amount: Number(budget), spent: 0, type: "saving"});

            // Get current total savings value
            // const userRef = doc(db,`users/${userId}`);
            // const userDoc = await getDoc(userRef);
            // let currentTotalSavings = 0;

            // if(userDoc.exists()){
            //   currentTotalSavings = userDoc.data().totalSavings || 0;
            // }

            // // Update the totalSavings field
            // const newTotal = currentTotalSavings + Number(budget);
            // await updateDoc(userRef, {totalSavings: newTotal});

            // Update state to reflect new totalSavings
            // setTotalSavings(newTotal)
            // setSurplus(salary - newTotal)

            setCategories((prevCategories)=>[
              ...prevCategories,
              {id: categoryRef.id,name: categoryName ,budget: Number(budget),spent:0,percentage:percentage}
            ]);

            console.log("savings added successfully");
            toast.success("Saving category added successfully")
            
          }
         
            // Reset form fields
        setCategoryName("");
        setBudget("");
        setLoading(false)
        fetchCategories()
        setIsDisabled(false)
          
        } catch (error) {
          setLoading(false)
          toast.error("Error adding category! Try again")
          setIsDisabled(false)
        }
    
       
      };
// ---------------------------------------------------------------------------------------


// -------------------function for deleting a category from the database----------------------
      const deleteCategory = async (categoryId, categoryBudget) => {
        setLoading(true)
        try {
            setIsDisabled(true)
            // Delete category from Firestore
            const categoryRef = doc(db, `users/${userId}/categories/${categoryId}`);
            const categorySnap = await getDoc(categoryRef)

            if (!categorySnap.exists()) {
              console.error("Category does not exist");
              return;
            }
            
            if(categorySnap.data().type=="expense"){
              const currentSpent = categorySnap.data().spent
            
              await deleteDoc(categoryRef);

              // Update totalBudgeted in Firestore
              const userRef = doc(db, `users/${userId}`);
              const userDoc = await getDoc(userRef)
              const newTotalBudgeted = totalBudgeted - categoryBudget;
              const currentTotalExpenses = userDoc.data().totalExpenses || 0
              const newTotalExpenses = currentTotalExpenses - currentSpent
              await updateDoc(userRef, { totalBudgeted: newTotalBudgeted, totalExpenses: newTotalExpenses });
              setTotalBudgeted(newTotalBudgeted);
              setTotalExpenses(newTotalExpenses)
              // setSurplus(salary - newTotalBudgeted);

              
            }
            else{
              const currentSpent = categorySnap.data().spent
            
              await deleteDoc(categoryRef);
              // Update totalSavings in Firestore
              const userRef = doc(db, `users/${userId}`);
              const userDoc = await getDoc(userRef)
              const currentTotalSavings = userDoc.data().totalSavings || 0
              const newTotalSavings = currentTotalSavings - currentSpent
              await updateDoc(userRef, { totalSavings: newTotalSavings });
              setTotalSavings(newTotalSavings)
            }

            // Update local state
            setCategories(categories.filter((category) => category.id !== categoryId));
            setIsDisabled(false)
            console.log("Category deleted successfully");
            setLoading(false)

        } catch (error) {
          setLoading(false)
          toast.error("Error deleting category! Try again")
          setIsDisabled(false)
        }
        
    };
// ------------------------------------------------------------------------------------------------
    

  return (



    <>
    
    <div style={{backgroundColor:'#222',width:'100%',paddingRight:'0'}}>
    {/* displaying salary, total budgeted and surplus */}
      <div className="row mt-5"  style={{padding:'0'}}>
        <div className="col-1"></div>
        <div className="col-10" style={{margin:'0',padding:'0'}}>
          <h5 style={{color:'white',fontSize:'var(--H3)',marginTop:'-8px'}}>Budget</h5>
        </div>
        <div className="col-1"></div>
      </div>
      <div className="row" style={{padding:'0'}}>
        <div className="col-1"></div>
        <div className="col-10  d-flex flex-row" style={{margin:'0',paddingLeft:'34px',paddingRight:'34px',width:'100%'}}>

          <div className="container align-self-center tile  flex-shrink-1 flex-grow-1" style={{backgroundColor:'#222',padding:'15px',borderRadius:'10px',marginTop:'33px',width:'182px',height:'114px',marginRight:'16px'}}>
            <p style={{backgroundColor:'transparent',color:'var(--Grey-300)',fontSize:'var(--Body-Small)'}}>Income</p>
            <div className='d-flex flex-row ' style={{backgroundColor:'transparent',marginTop:'30px'}}>
              <h5 style={{backgroundColor:'transparent',color:'white'}}>${salary}</h5>
              <button className='btn' style={{backgroundColor:'transparent',marginTop:'-8px',marginLeft:'3px'}} onClick={handleShow} >
                <svg width="26px" height="26px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{backgroundColor:'transparent',color:'var(--Grey-500)'}}>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.0856 3.99997C16.8666 3.21892 18.133 3.21892 18.914 3.99997L19.9998 5.08576C20.7808 5.86681 20.7808 7.13313 19.9998 7.91418L17.9998 9.91419L14.0856 5.99997L16.0856 3.99997ZM16.914 5.99997L17.9998 7.08576L18.5856 6.49997L17.4998 5.41418L16.914 5.99997ZM13.4998 6.58576L17.414 10.5L7.91401 20H3.81934L4.56609 15.5195L13.4998 6.58576ZM6.43351 16.4805L6.18026 18H7.08558L14.5856 10.5L13.4998 9.41418L6.43351 16.4805Z" fill="#717171"/>
                </svg>
              </button>
              <Modal show={show} onHide={handleClose} className='modal-sm' style={{backgroundColor:'transparent',marginTop:'115px'}} >
                <Modal.Body style={{backgroundColor:'rgba(15,15,19,1)'}}>
                    <div className="container p-2" style={{backgroundColor:'transparent',marginTop:'40px',marginBottom:'50px'}}>
                        <p style={{color:'rgba(255, 255, 255, 0.315)',backgroundColor:'transparent'}}>Monthly income</p>
                        <input type="text" placeholder='Type here..' id='salary' onChange={e=>setSalary(e.target.value)} className='formInput me-5' style={{backgroundColor:'rgba(15,15,19,1)',marginLeft:'0',width:'260px'}}/>
                        <div className='action-button ' style={{backgroundColor:'rgba(15,15,19,1)'}}>
                            <button onClick={addSalary} className='btn border border-1 ps-3 pe-3 pt-2 pb-2 mt-2' style={{height:'45px',borderRadius:'10px'}}>Save</button>
                        </div>
                    </div>
                </Modal.Body>
              </Modal>
            </div>
          </div>

          <div className="container align-self-center tile flex-shrink-1 flex-grow-1" style={{backgroundColor:'#222',padding:'15px',borderRadius:'10px',marginTop:'32px',width:'182px',height:'114px',marginBottom:'20px'}}>
            <p style={{backgroundColor:'transparent',color:'var(--Grey-300)',fontSize:'var(--Body-Small)'}}>Expenses</p>
            <div className='d-flex flex-row ' style={{backgroundColor:'transparent',marginTop:'30px'}}>
              <h5 style={{backgroundColor:'transparent',color:'white'}}>${totalExpenses}</h5>
              <p style={{color:'var(--Grey-500)',backgroundColor:'transparent',marginLeft:'10px'}}>{totalExpenses>0?Math.trunc(((totalExpenses/salary)*100)):0}%</p>
            </div>
          </div>

          
        
        </div>
        <div className="col-1"></div>
      </div>

      <div className="row" style={{padding:'0'}}>
        <div className="col-1"></div>
        <div className="col-10 d-flex flex-row justify-content-center" style={{margin:'0',paddingLeft:'34px',paddingRight:'34px',width:'100%'}}>
          {/* <Link to={'/upcoming'} style={{textDecoration:'none'}}>
          <p className='text-end' style={{color:'rgba(255, 255, 255, 0.315)'}}>Upcoming payments</p>
          </Link> */}
          
          <div className="container align-self-center tile flex-shrink-1 flex-grow-1" style={{backgroundColor:'#222',padding:'15px',borderRadius:'10px',width:'182px',height:'114px',marginRight:'16px'}}>
            <p style={{backgroundColor:'transparent',color:'var(--Grey-300)',fontSize:'var(--Body-Small)'}}>Savings</p>
            <div className='d-flex flex-row ' style={{backgroundColor:'transparent',marginTop:'30px'}}>
              <h5 style={{backgroundColor:'transparent',color:'white'}}>${totalSavings}</h5>
              <p style={{color:'var(--Grey-500)',backgroundColor:'transparent',marginLeft:'10px'}}>{totalSavings>0?Math.trunc(((totalSavings/salary)*100)):0}%</p>
            </div>
          </div>

          <div className="container align-self-center tile flex-shrink-1 flex-grow-1" style={{backgroundColor:'#222',padding:'15px',borderRadius:'10px',width:'182px',height:'114px'}}>
            <p style={{backgroundColor:'transparent',color:'var(--Grey-300)',fontSize:'var(--Body-Small)'}}>Surplus</p>
            <div className='d-flex flex-row ' style={{backgroundColor:'transparent',marginTop:'30px'}}>
              <h5 style={{backgroundColor:'transparent',color:'white'}}>${salary-(totalExpenses+totalSavings)}</h5>
              <p style={{color:'var(--Grey-500)',backgroundColor:'transparent',marginLeft:'10px'}}>{salary-(totalExpenses+totalSavings)>0?Math.trunc((((salary-(totalExpenses+totalSavings))/salary)*100)):0}%</p>
            </div>
          </div>
        </div>
        <div className="col-1"></div>
      </div>


      </div>

      
     <div className='container ' style={{backgroundColor:'black',width:'100vw',margin:'0',padding:'0'}}>

{/* form for adding a new category */}
      <div className="row top-container" style={{width:'100vw',backgroundColor:'black'}}>
        <div className="col-sm-1"></div>
        <div className="col-sm-10 d-flex justify-content-center " style={{width:'100%',backgroundColor:'black',paddingRight:'0',paddingLeft:'0'}}>
          <div className="container-fluid  d-flex justify-content-center  " style={{backgroundColor:'black',width:'100%'}}>
            <div className="container  p-2 w-25 d-flex flex-grow-1 flex-column justify-content-center input-wrapper" style={{marginTop:'30px',backgroundColor:'black',paddingLeft:'0',paddingRight:'0',marginRight:'7px'}}>
              <input class="form-control form-control-lg formInput text-light mb-4" type="text" id='categoryName' onChange={e=>setCategoryName(e.target.value)} value={categoryName} placeholder="Category name" style={{marginLeft:'15px',marginRight:'15px',width:'100%',backgroundColor:'black'}}/>

              <div className='d-flex flex-row mb-4' style={{backgroundColor:'black',marginLeft:'15px'}}>
                <div class="form-check me-4" style={{backgroundColor:'black'}}>
                    <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked={expSave === 'expenses'} style={{backgroundColor:'transparent',width:'18px',height:'18px'}} onChange={()=>setExpSave("expenses")}/>
                    <label class="form-check-label" for="flexRadioDefault1" style={{backgroundColor:'black',fontSize:'var(--Body-Medium)'}}>Expenses</label>
                </div>
                <div className='form-check' style={{backgroundColor:'black'}}>
                    <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked={expSave === 'savings'} style={{backgroundColor:'transparent',width:'18px',height:'18px'}} onChange={()=>setExpSave("savings")}/>
                    <label class="form-check-label" for="flexRadioDefault2" style={{backgroundColor:'black',fontSize:'var(--Body-Medium)'}}>Savings</label>
                </div>
              </div>

              <input class="form-control form-control-lg formInput text-light mb-2" type="text" id='budget' onChange={e=>setBudget(e.target.value)} value={budget} placeholder="Budget amount"  style={{marginLeft:'15px',marginRight:'10px',width:'100%',backgroundColor:'black'}}/>
              <div className='action-button' style={{backgroundColor:"transparent",paddingLeft:'0',paddingRight:'0'}}>
                  <button onClick={!isDisabled ? addBudget : null} className='btn ps-3 pe-3 pt-2 pb-2 mt-2' style={{width: "100%",height:'45px',borderRadius:'30px',marginLeft:'15px'}}>Add budget</button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-1" ></div>
      </div>



{/* displaying the existing expense categories */}
        {
            categories.filter((category)=>category.type=="expense").length > 0 && (
                <p style={{fontSize:'var(--Body-Small)',color:'var(--Grey-500)',paddingLeft:'24px',marginBottom:'-20px',marginTop:'20px'}}>Expense categories</p>
            )
        }
      <div className="row d-flex flex-column  " style={{backgroundColor:'black',marginRight:'0'}}>
        <div className="col-sm-1"></div>
        <div className="col-sm-12 budgetCategory" style={{backgroundColor:'black'}}>
            <div className="container p-2 " style={{backgroundColor:'transparent'}}>
              <hr style={{color:'#222',height:'3px',marginTop:'-15px'}}/>
            </div>
        {
            categories.map((category)=>(
                category.type=="expense" ? (
                  <div className="col w-50 m-auto d-flex flex-row justify-content-between  text-center p-2 " style={{backgroundColor:'transparent',width:'100%'}}>
                    <p style={{color:'var(--Grey-300)',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} >{category.name}</p>
                    <p style={{color:'var(--Grey-300)',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='text-end'>${category.budget} &nbsp;&nbsp;&nbsp;&nbsp; <span style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)',backgroundColor:'transparent'}}>{Math.trunc(((category.budget/salary)*100))}%</span> &nbsp;&nbsp;&nbsp;&nbsp;
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: "var(--Grey-500)",cursor:'pointer',opacity:'0.5',backgroundColor:'transparent',marginTop:'-5px'}} onClick={!isDisabled?()=>deleteCategory(category.id,category.budget):null} >
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17 9H8L8 19H17V9ZM6 7V19C6 20.1046 6.89543 21 8 21H17C18.1046 21 19 20.1046 19 19V7H6Z" fill="#717171"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20 6L5 6L5 4L20 4V6Z" fill="#717171"/>
                        <path d="M10 3L9 4H16L15 3H10Z" fill="#717171"/>
                      </svg>
                    </p>
                </div>
                ) : null
            ))
        }
        </div>
        <div className="col-sm-1"></div>
      </div>


      {/* displaying the existing savings categories */}
      {
            categories.filter((category)=>category.type=="saving").length > 0 && (
                <p style={{fontSize:'var(--Body-Small)',color:'var(--Grey-500)',paddingLeft:'24px',marginBottom:'-20px'}}>Savings categories</p>
            )
      }

      <div className="row d-flex flex-column  " style={{backgroundColor:'black',marginRight:'0'}}>
        <div className="col-sm-1"></div>
        <div className="col-sm-12 budgetCategory" style={{backgroundColor:'black'}}>
            <div className="container p-2 " style={{backgroundColor:'transparent'}}>
              <hr style={{color:'#222',height:'3px',marginTop:'-15px'}}/>
            </div>
        {
            categories.map((category)=>(
                category.type=="saving" ? (
                  <div className="col w-50 m-auto d-flex flex-row justify-content-between  text-center p-2 " style={{backgroundColor:'transparent',width:'100%'}}>
                    <p style={{color:'var(--Grey-300)',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} >{category.name}</p>
                    <p style={{color:'var(--Grey-300)',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='text-end'>${category.amount} &nbsp;&nbsp;&nbsp;&nbsp; <span style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)',backgroundColor:'transparent'}}>{Math.trunc(((category.amount/salary)*100))}%</span> &nbsp;&nbsp;&nbsp;&nbsp;
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: "var(--Grey-500)",cursor:'pointer',opacity:'0.5',backgroundColor:'transparent',marginTop:'-5px'}} onClick={!isDisabled?()=>deleteCategory(category.id,category.amount):null} >
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17 9H8L8 19H17V9ZM6 7V19C6 20.1046 6.89543 21 8 21H17C18.1046 21 19 20.1046 19 19V7H6Z" fill="#717171"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20 6L5 6L5 4L20 4V6Z" fill="#717171"/>
                        <path d="M10 3L9 4H16L15 3H10Z" fill="#717171"/>
                      </svg>
                    </p>
                </div>
                ) : null
            ))
        }
        </div>
        <div className="col-sm-1"></div>
      </div>



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
// 
// 
export default SetIncomeBudget
