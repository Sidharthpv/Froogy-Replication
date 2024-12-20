import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { Link } from 'react-router-dom'

function AddExpense({userId}) {

    const[categories1,setCategories1] = useState([])
    const[expenseAmount,setExpenseAmount] = useState("")
    const[expenseCategory,setExpenseCategory] = useState("")
    const[expenseName,setExpenseName] = useState("")
    const[upcomingPayments,setUpcomingPayments] = useState([])
    const[dateOption,setDateOption] = useState("today")


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

    useEffect(()=>{
        
        fetchCategories1()
        // fetchUpcomingPayments()
    },[userId])

// --------------------------function for adding a new expense-----------------------------
    const handleAddExpense = async()=>{
        console.log("Expense Name:", expenseName);
        console.log("Expense Amount:", expenseAmount);
        console.log("Expense Category:", expenseCategory);

        if(expenseAmount<0 ){
            alert("Enter valid expense amount!")
            
        }
        else if(!expenseCategory){
            alert("enter valid category")
        }
        else if(!expenseName){
            alert("enter valid expense name")
        }
        try{
            const categoryPath = `users/${userId}/categories/${expenseCategory}`;
            console.log(categoryPath);
            
            const categoryRef = doc(db,categoryPath);

            // updating the totalExpenses field
            const userRef = doc(db,`users/${userId}`);
            const userDoc = await getDoc(userRef);
            let currentTotalExpenses = 0;  
            if (userDoc.exists()) {
                currentTotalExpenses = userDoc.data().totalExpenses || 0;
            }
            const newTotalExpenses = currentTotalExpenses + Number(expenseAmount);
            await updateDoc(userRef,{totalExpenses: newTotalExpenses})

            const expenseRef = doc(collection(categoryRef,"expenses"));

            const currentDate = new Date();
            const expenseDate = dateOption === "today" ? currentDate : new Date(currentDate.setDate(currentDate.getDate()-1))
            await setDoc(expenseRef,{
                name: expenseName,
                amount: Number(expenseAmount),
                timestamp: expenseDate,
            });

            // updating the spent field in the category and updating percentage
            const categoryDoc = await getDoc(categoryRef)
            if(categoryDoc.exists()){
                const currentSpent = categoryDoc.data().spent || 0;
                const updatedSpent = currentSpent + Number(expenseAmount)

                //calculating new percentage
                const budget = categoryDoc.data().budget || 0;
                const updatedPercentage = budget>0?((updatedSpent/budget)*100).toFixed(2) : 0;
                
                await updateDoc(categoryRef,{
                    spent : updatedSpent,
                    percentage: updatedPercentage
                });
            }
            console.log("expense added successfully");
            setExpenseAmount("");
            setExpenseName("");
            setExpenseCategory("");
            fetchCategories1();
        }
        catch(error){
            console.log("error adding expense:",error);
            
        }
    }
// ------------------------------------------------------------------------------


// ------------------------fetching all the upcoming payment reminders-------------------------------------
    // const fetchUpcomingPayments = async()=>{
    //     console.log("fetchUpcomingPayments function called");
    //     try{
    //       console.log("Fetching upcoming payments for user:", userId);
    
    //       const upcomingPaymentsRef = collection(db,`users/${userId}/upcomingPayments`);
    //       console.log("Reference to upcomingPayments collection:", upcomingPaymentsRef);
    
    //       const paymentsSnap = await getDocs(upcomingPaymentsRef);
    //       if(paymentsSnap.empty){
    //         console.log("upcoming payments is empty");
            
    //       }
    
    //       const upcomingPaymentsData = [];
          
    //       paymentsSnap.forEach((doc)=>{
    //         console.log("Payment Document Data:", doc.data());
    //         const paymentData = doc.data();
    
    //         const paymentDateString = paymentData.date;
    //         const paymentDate = new Date(paymentDateString);
            
            
    //         const today = new Date();
    //         const daysLeft = Math.floor((paymentDate - today) / (1000*60*60*24));
            
            
    //         // checking whether the payment is due within the next 5 days
    //         if(daysLeft<=5 && daysLeft>=0){
    //           upcomingPaymentsData.push({
    //             id: doc.id,
    //             name: paymentData.name,
    //             date: paymentData.date,
    //             daysLeft: daysLeft,
    //           });
    //         }
    //       });
          
          
    //       setUpcomingPayments(upcomingPaymentsData);
    //     }
    //     catch(error){
    //       console.log("error fetching upcoming payments:",error);
          
    //     }
        
    //   }
// --------------------------------------------------------------------------------

  return (
    <>

    {/* input fields for adding new expense */}
      <div className="row " style={{marginTop:'-30px'}}>
        <div className="col-sm-1 col-md-4"></div>
        <div className="col-sm-10 col-md-4 expenseForm ps-5">
            <div className="container-fluid  d-flex justify-content-center p-2">
                <div className="container  p-2 w-25 d-flex flex-grow-1 flex-column justify-content-center input-wrapper" style={{marginTop:'60px'}}>
                    <div className='d-flex flex-row mb-3 expense-wrapper'>
                        <div class="form-check me-4 ">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" checked style={{backgroundColor:'transparent'}} onChange={()=>setDateOption("today")}/>
                            <label class="form-check-label" for="flexRadioDefault1">Today</label>
                        </div>
                        <div className='form-check'>
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" style={{backgroundColor:'transparent'}} onChange={()=>setDateOption("yesterday")}/>
                            <label class="form-check-label" for="flexRadioDefault2">Yesterday</label>
                        </div>
                    </div>
                    <input class="form-control form-control-lg formInput text-light mb-3" id='Amount' value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} type="text" placeholder="Amount"/>
                    <select class="form-select form-select-lg " value={expenseCategory}  onChange={(e)=>setExpenseCategory(e.target.value)} style={{borderWidth:'0.2px',width:'270px',height:'45px',borderRadius:'10px'}}>
                    <option value="" disabled>Category</option>
                    {
                        categories1.map((category)=>(
                            
                            
                            <option key={category.id} value={category.id}>{category.name}</option>
                            
                            
                        ))
                    }
                    </select>
                    <input class="form-control form-control-lg formInput text-light mt-3" id='expenseName' value={expenseName} onChange={e=>setExpenseName(e.target.value)} type="text" placeholder="Expense name"/>
                    <div className='action-button ' style={{backgroundColor:"transparent"}}>
                        <button className='btn  ps-3 pe-3 pt-2 pb-2 mt-3' onClick={handleAddExpense} style={{width: "270px",height:'45px',borderRadius:'30px'}}>Add expense</button>
                    </div>
            </div>
        </div>

        </div>
        <div className="col-sm-1 col-md-4"></div>
    </div>

    {/* displaying all the expenses */}
      <div className="container justify-content-center mb-5" style={{marginTop:'-20px'}}>
      {
        categories1.map((category)=>(
            <Link to={`/categories/${category.id}`} style={{textDecoration:'none'}}>
                <div className="homeExpense row w-100 d-flex flex-row justify-content-center" style={{backgroundColor:'transparent',marginBottom:'-60px'}}>
                    <div className="col-sm-1"></div>
                    <div className="col-sm-10 d-flex flex-row ">
                        <div className="col d-flex flex-column flex-grow-1 justify-content-start rounded-start text-align-center p-2" style={{backgroundColor:'#222'}}>
                            <p style={{color:'var(--Grey-300)',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='mb-1 mt-2'>{category.name}</p>
                            <h5 style={{color:'rgba(255, 255, 255, 0.315)',backgroundColor:'transparent',fontSize:'var(--Body-Small)'}}>${category.budget}</h5>
                        </div>
                        <div className="col d-flex flex-column flex-grow-1 justify-content-end text-end p-2 text-align-center rounded-end" style={{backgroundColor:'#222',marginRight:'-20px'}}>
                            <h5 style={{color:'var(--Grey-300)',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='mb-1 mt-2'>${category.spent}</h5>
                            <p style={{color:'rgba(255, 255, 255, 0.315)',backgroundColor:'transparent',fontSize:'var(--Body-Small)'}}>{Math.trunc(category.percentage)}%</p>
                        </div>
                    </div>
                    <div className="col-sm-1"></div>
                </div>
            </Link>
        ))
      }
        </div>

        {/* displaying upcoming payments
        <div className="row">
            <div className="col-1"></div>
            <div className="col-10 d-flex pe-4">
                <div className="container justify-content-center">
                    <div className="container upcomingDisplay-wrapper d-flex p-2 flex-row flex-wrap align-items-stretch" style={{minHeight: '45px',backgroundColor: 'rgba(34,34,34,1)',padding: '0',width: '100%',}}>
                        {upcomingPayments.length === 1 ? (
                        // if there is only one payment
                            <div className="upcoming-display d-flex flex-column text-start" style={{flex: '1 1 100%', margin: '0',}}>
                                <p style={{color: 'white',backgroundColor: 'transparent',marginBottom: '5px',}}>{upcomingPayments[0].date}</p>
                                <p style={{ color: 'white', backgroundColor: 'transparent' }}>{upcomingPayments[0].name}</p>
                            </div>
                        ) : (
                        // if there are multiple payments
                        upcomingPayments.map((payment, index) => (
                            <div key={index} className="upcoming-display d-flex flex-column text-start m-2" style={{flex: '1 1 0',margin: '0',padding: '5px',boxSizing: 'border-box',}}>
                                <p style={{color: 'white',backgroundColor: 'transparent',marginBottom: '5px',}}>{payment.date}</p>
                                <p style={{ color: 'white', backgroundColor: 'transparent' }}>{payment.name}</p>
                            </div>
                        ))
                        )}
                    </div>
                </div>
            </div>
            <div className="col-1"></div>
        </div> */}


      
    </>
  )
}

export default AddExpense
