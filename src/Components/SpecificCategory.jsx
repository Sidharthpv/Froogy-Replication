import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase';

function SpecificCategory({userId}) {

    const {categoryId} = useParams()
    console.log("category id is: ",categoryId);
    
    const[expenses,setExpenses] = useState([]);
    

    // -----------------------function for fetching the expenses for a particular category------------------------
    const fetchCategoryExpense = async () => {
        try {
            if (!categoryId) {
                console.error("Category ID is missing!");
                return;
            }

            const fetchedExpenses = [];
            
            const categoryRef = doc(db, `users/${userId}/categories/${categoryId}`);
            const categorySnap = await getDoc(categoryRef);
            
            if (categorySnap.exists()) {
                const categoryname = categorySnap.data().name;

                const expensesRef = collection(db, `users/${userId}/categories/${categoryId}/expenses`);
                const expensesSnap = await getDocs(expensesRef);

                expensesSnap.forEach((expenseDoc) => {
                    const expenseData = expenseDoc.data();
                    const dateObj = expenseData.timestamp.toDate();
                    const date = dateObj.getDate();
                    const month = dateObj.toLocaleString("default", { month: "short" });

                    fetchedExpenses.push({
                        date: `${date}`,
                        month: month,
                        name: expenseData.name,
                        amount: expenseData.amount,
                        category: categoryname,
                    });
                });
            } else {
                console.error("Category not found");
            }
            
            setExpenses(fetchedExpenses);
        } catch (error) {
            console.log("Error fetching the expenses: ", error);
        }
    };
// ---------------------------------------------------------------------------------------------------
    
    useEffect(()=>{
        fetchCategoryExpense()
    },[userId])

  return (
    <>
      {/* <div className="row ">
        <div className="col-2"></div>
        {expenses.length>0?(
        <div className="col-8 p-5 d-flex flex-column">
            
            <h5 style={{color:'white'}} className='ms-5'>{expenses[0].category}</h5>
            <div className="container ps-5 pe-5 pb-5 pt-4">
                
                    <div className='container expenseBorder d-flex flex-column   ps-0 pe-0' style={{minHeight:'232px'}}>
                    {expenses.map((expense)=>(
                      <div className='d-flex flex-row justify-content-between expenseBorder ps-5 pe-5'>  
                    <div className='d-flex flex-row  p-2 ' >
                        <div className="d-flex flex-column me-5 ">
                            <p style={{color:'white',fontSize:'14px',fontWeight:'bold'}} className='m-0 '>{expense.date}</p>
                            <p style={{color:'rgba(255, 255, 255, 0.315)',fontSize:'12px'}} >{expense.month}</p>
                        </div>
                        <div className="d-flex flex-column ">
                            <p style={{color:'white',fontSize:'14px',fontWeight:'bold'}} className='mt-2 text-start '>{expense.name}</p>
                            
                        </div>
                    </div>
                    <div className='d-flex flex-row-reverse' >
                        <div className='d-flex align-items-start'>
                            <p style={{color:'white',backgroundColor:'transparent',fontSize:'14px',fontWeight:'bold'}} className='text-end mt-3 me-2'>${expense.amount} </p>
                        </div>
                    </div>
                    </div>))
                    }
                    </div>
            </div>
        </div>
        ): <div className='col-8'></div>}
        <div className="col-2"></div>
      </div> */}

<div className='d-flex flex-column'>
      <div className="row ">
        <div className="col-sm-1"></div>
        {expenses.length>0?(
            <div className="col-sm-10 p-0 mt-5 d-flex flex-column">
                <h5 style={{color:'white',fontSize:'var(--H3)'}} className='ms-5'>{expenses[0].category}</h5>
                <div className="container ps-3 pe-3 pb-5 pt-4">
                    {
                        expenses.map((expense)=>(
                            <div className='container  expenseBorder d-flex flex-row flex-shrink-1 justify-content-between  text-center'>
                                <div className='d-flex  flex-row  justify-content-evenly p-2 ms-3'>
                                    <div className="d-flex flex-column me-5 flex-shrink-1">
                                        <p style={{color:'white',fontSize:'var(--Body-Large)'}} className='m-0 '>{expense.date}</p>
                                        <p style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)'}} >{expense.month}</p>
                                    </div>
                                    <div className="d-flex flex-column flex-shrink-1">
                                        <p style={{color:'white',fontSize:'var(--Body-Medium)'}} className='m-0 text-start '>{expense.name}</p>
                                        {/* <p style={{color:'var(--Grey-500)',fontSize:'var(--Body-Small)'}} className='text-start'>{eachExpense.category}</p> */}
                                    </div>
                                </div>
                                <div className=' d-flex flex-row-reverse'>
                                    <div className='d-flex pt-2'>
                                        <p style={{color:'white',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='text-end '>${expense.amount} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={()=>deleteExpense(eachExpense.id,eachExpense.categoryId,eachExpense.amount)} style={{marginTop:'-5px'}}>
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M17 9H8L8 19H17V9ZM6 7V19C6 20.1046 6.89543 21 8 21H17C18.1046 21 19 20.1046 19 19V7H6Z" fill="#717171"/>
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M20 6L5 6L5 4L20 4V6Z" fill="#717171"/>
                                            <path d="M10 3L9 4H16L15 3H10Z" fill="#717171"/>
                                        </svg> */}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                    
                
                </div>
            </div>
        ): <div className="col-sm-10"></div>}
        <div className="col-sm-1"></div>
      </div>

      {/* <div className="container justify-content-center " style={{marginTop:'-100px'}} >
        <div className="container p-2 d-flex flex-row flex-wrap justify-content-start" style={{minHeight:'45px',width:'100%',backgroundColor:'rgba(102,102,102,1)',overflowX: 'auto'}}>
          
        
        </div>
      </div> */}
      </div>
        
        
    </>
  )
}

export default SpecificCategory
