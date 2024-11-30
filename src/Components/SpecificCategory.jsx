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
      <div className="row ">
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
      </div>
    </>
  )
}

export default SpecificCategory
