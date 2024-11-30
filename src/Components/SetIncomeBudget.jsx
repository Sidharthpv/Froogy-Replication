import React, { useEffect, useState } from 'react'
import { doc, collection, setDoc, getDoc, updateDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function SetIncomeBudget({userId}) {
   
    
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const[categoryName,setCategoryName] = useState("")
    const[budget,setBudget] = useState(0)
    const[totalBudgeted,setTotalBudgeted] = useState(0)
    const[salary,setSalary] = useState(0)
    const[surplus,setSurplus] = useState(0)
    const[categories,setCategories] = useState([])

    useEffect(() => {

        // fetch all existing category details
        const fetchCategories = async () => {
            try{
                const categoriesRef = collection(db,`users/${userId}/categories`);
                const categoriesSnap = await getDocs(categoriesRef);
                const categoryList = categoriesSnap.docs.map((doc)=>({
                id:doc.id,
                ...doc.data(),
            }));

            setCategories(categoryList);
            }
            catch(error){
                console.log("error fetching category list:",error);
                
            }

        }
        



        //fetch total budgeted amount,salary and set the surplus amount
        const fetchTotalBudgeted = async () => {
          try {
            const userRef = doc(db, `users/${userId}`);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data()
                setTotalBudgeted(userDoc.data().totalBudgeted || 0);
                setSalary(userData.salary || 0)
                setSurplus(userData.salary - userData.totalBudgeted)
            }
          } catch (error) {
            console.error("Error fetching total budgeted:", error);
          }
        };
    
        fetchTotalBudgeted();
        fetchCategories();
      }, [userId]);


      // --------------------------------function for adding salary-----------------------------
    const addSalary = async()=>{
        // e.preventDefault();
        if(!salary || salary<=0){
            alert("enter a valid salary")
            return;
        }
        try{
            const userRef = doc(db, `users/${userId}`);
            await updateDoc(userRef, { salary: Number(salary) });
            setSalary(Number(salary))
        }
        catch(error)
        {
            console.log("error updating salary:",error);
            
        }
        
        handleClose();
    }
// ----------------------------------------------------------------------------


//-------------------- function for adding a new category and the budget for it--------------------
    const addBudget = async () => {
        // e.preventDefault();
    
        if (!categoryName || budget <= 0) {
            alert("enter a valid category name and budget")
            return;
        }
    
        try {
          const percentage = budget > 0 ? 0 : 0;
          // Step 1: Add the new category to the subcollection
          const categoryRef = doc(collection(db, `users/${userId}/categories`));
          await setDoc(categoryRef, { name: categoryName, budget: Number(budget), spent: 0 });
    
          // Step 2: Get the current total budgeted value
          const userRef = doc(db, `users/${userId}`);
          const userDoc = await getDoc(userRef);
          let currentTotalBudgeted = 0;
    
          if (userDoc.exists()) {
            currentTotalBudgeted = userDoc.data().totalBudgeted || 0;
          }
    
          // Step 3: Update the totalBudgeted field
          const newTotal = currentTotalBudgeted + Number(budget);
          await updateDoc(userRef, { totalBudgeted: newTotal });
    
          setCategories((prevCategories)=>[
            ...prevCategories,
            {id: categoryRef.id,name: categoryName ,budget: Number(budget),spent:0,percentage:percentage}
          ]);

          // Step 4: Update state to reflect new totalBudgeted
          setTotalBudgeted(newTotal);
          setSurplus(salary - newTotal)
          console.log("data added successfully");
          
        } catch (error) {
          console.error("Error updating total budgeted:", error);
        }
    
        // Reset form fields
        setCategoryName("");
        setBudget("");
      };
// ---------------------------------------------------------------------------------------


// -------------------function for deleting a category from the database----------------------
      const deleteCategory = async (categoryId, categoryBudget) => {
        try {
            // Step 1: Delete category from Firestore
            const categoryRef = doc(db, `users/${userId}/categories/${categoryId}`);
            await deleteDoc(categoryRef);

            // Step 2: Update totalBudgeted in Firestore
            const userRef = doc(db, `users/${userId}`);
            const newTotalBudgeted = totalBudgeted - categoryBudget;
            await updateDoc(userRef, { totalBudgeted: newTotalBudgeted });

            // Step 3: Update local state
            setCategories(categories.filter((category) => category.id !== categoryId));
            setTotalBudgeted(newTotalBudgeted);
            setSurplus(salary - newTotalBudgeted);
            console.log("Category deleted successfully");
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };
// ------------------------------------------------------------------------------------------------
    

  return (



    <>

    {/* displaying salary, total budgeted and surplus */}
      <div className="row" style={{marginTop:'65px'}}>
        <div className="col-sm-3"></div>
        <div className="col-sm-3">
          <h5 style={{color:'white'}}>Budget</h5>
          <div className="container align-self-center" style={{backgroundColor:'rgb(34, 36, 38)',padding:'15px',borderRadius:'10px',marginTop:'40px'}}>
            <p style={{backgroundColor:'transparent',color:'rgba(255, 255, 255, 0.315)'}}>Income</p>
            <div className='d-flex flex-row justify-content-between' style={{backgroundColor:'transparent'}}>
              <h5 style={{backgroundColor:'transparent',color:'white'}}>${salary}</h5>
              <button className='btn' style={{backgroundColor:'transparent'}} onClick={handleShow} ><i class="fa-solid fa-pen"  style={{color: "#ffffff",backgroundColor:'transparent'}}></i></button>
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
        </div>
        <div className="col-sm-3">
          <Link to={'/upcoming'} style={{textDecoration:'none'}}>
          <p className='text-end' style={{color:'rgba(255, 255, 255, 0.315)'}}>Upcoming payments</p>
          </Link>
          <div className="container align-self-center" style={{backgroundColor:'rgb(34, 36, 38)',padding:'15px',borderRadius:'10px',marginTop:'40px'}}>
            <p style={{backgroundColor:'transparent',color:'rgba(255, 255, 255, 0.315)'}}>Budgeted</p>
            <h5 style={{backgroundColor:'transparent',color:'white'}}>${totalBudgeted}</h5>
          </div>
        </div>
        <div className="col-sm-3"></div>
      </div>

      <div className="row">
        <div className="col-sm-3"></div>
        <div className="col-sm-6">
        <div className="container align-self-center" style={{backgroundColor:'rgb(34, 36, 38)',padding:'15px',borderRadius:'10px',marginTop:'20px'}}>
            <p style={{backgroundColor:'transparent',color:'rgba(255, 255, 255, 0.315)'}}>Surplus</p>
            <h5 style={{backgroundColor:'transparent',color:'white'}}>${surplus}</h5>
          </div>
        </div>
        <div className="col-sm-3"></div>
      </div>


{/* form for adding a new category */}
      <div className="row">
        <div className="col-sm-4"></div>
        <div className="col-sm-4 d-flex justify-content-center ps-5">
        <div className="container-fluid  d-flex justify-content-center p-2 ">
        <div className="container  p-2 w-25 d-flex flex-grow-1 flex-column justify-content-center input-wrapper" style={{marginTop:'60px'}}>
          <input class="form-control form-control-lg formInput text-light mb-2" type="text" id='categoryName' onChange={e=>setCategoryName(e.target.value)} placeholder="Category name"/>
          <input class="form-control form-control-lg formInput text-light " type="text" id='budget' onChange={e=>setBudget(e.target.value)} placeholder="Budget amount"/>
          <div className='action-button' style={{backgroundColor:"transparent"}}>
              <button onClick={addBudget} className='btn border border-1 ps-3 pe-3 pt-2 pb-2 mt-2' style={{width: "270px",height:'45px',borderRadius:'10px'}}>Add budget</button>
          </div>
        </div>
      </div>
        </div>
        <div className="col-sm-4"></div>
      </div>


{/* displaying the existing categories */}
      <div className="row d-flex flex-column  homeExpense " style={{backgroundColor:'transparent'}}>
        {
            categories.map((category)=>(
                <div className="col w-50 m-auto d-flex flex-row justify-content-between  text-center p-2 border-bottom" style={{backgroundColor:'transparent'}}>
                    <p style={{color:'rgba(255, 255, 255, 0.315)',backgroundColor:'transparent'}} >{category.name}</p>
                    <p style={{color:'rgba(255, 255, 255, 0.315)',backgroundColor:'transparent'}} className='text-end'>${category.budget} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-trash" style={{color: "#ffffff",cursor:'pointer',opacity:'0.5'}} onClick={()=>deleteCategory(category.id,category.budget)}></i></p>
                </div>
            ))
        }
      </div>
    </>
  )
}

export default SetIncomeBudget
