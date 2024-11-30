import React, { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc } from "firebase/firestore";
import { db } from '../firebase'

function AllExpenses({userId}) {
  console.log("userId in AllExpenses:", userId);
  console.log("AllExpenses component rendered");
  
  const[expensesArray,setExpensesArray]=useState([])


  useEffect(()=>{
    fetchExpenses();
  },[userId])


  // -------------------function for fetching all the expenses----------------------------------
  const fetchExpenses = async()=>{
    try{
      const fetchedExpenses = []
      const categoriesSnap = await getDocs(collection(db,`users/${userId}/categories`));

      if (categoriesSnap.empty) {
        console.log("No categories found");
      }

      for(const categoryDoc of categoriesSnap.docs){
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
            category: categoryname
          });
          
        });
        
        
      }
      
      console.log("Final fetched expenses:", fetchedExpenses);
      setExpensesArray(fetchedExpenses)
      
    }
    catch(error){
      console.log("error fetching expenses:",error);
      
    }
  }
// -------------------------------------------------------------------------------------------


// -----------------------------function for deleting an expense from the database-------------------------
  const deleteExpense  =async(expenseId, categoryId, amount)=>{
    try{
      //deleting the expense
      await deleteDoc(doc(db,`users/${userId}/categories/${categoryId}/expenses/${expenseId}`));
      
      //updating the spent field for the curresponding category
      const categoryRef = doc(db,`users/${userId}/categories/${categoryId}`);
      const categorySnap = await getDoc(categoryRef);
      if(categorySnap.exists()){
        const currentSpent = categorySnap.data().spent || 0;
        const updatedSpent = currentSpent - amount;
        await updateDoc(categoryRef,{spent: updatedSpent});

        console.log("updated the spent for the category: ",categoryId);
        
      }
      fetchExpenses();
    }
    catch(error){
      console.log("error deleting the expense: ",error);
      
    }
  };
// ----------------------------------------------------------------------------------------------

  

  return (
    <>
    <div className='d-flex flex-column'>
      <div className="row ">
        <div className="col-2"></div>
        <div className="col-8 p-5 d-flex flex-column">
            <h5 style={{color:'white'}} className='ms-5'>Expenses</h5>
            <div className="container ps-5 pe-5 pb-5 pt-4">
                {
                  expensesArray.map((eachExpense)=>(
                    <div className='container expenseBorder d-flex flex-row justify-content-between  text-center'>
                    <div className='d-flex flex-row justify-content-evenly p-2 ms-3'>
                        <div className="d-flex flex-column me-5 ">
                            <p style={{color:'white',fontSize:'14px'}} className='m-0 '>{eachExpense.date}</p>
                            <p style={{color:'rgba(255, 255, 255, 0.315)',fontSize:'12px'}} >{eachExpense.month}</p>
                        </div>
                        <div className="d-flex flex-column ">
                            <p style={{color:'white',fontSize:'14px'}} className='m-0 text-start'>{eachExpense.name}</p>
                            <p style={{color:'rgba(255, 255, 255, 0.315)',fontSize:'14px'}} className='text-start'>{eachExpense.category}</p>
                        </div>
                    </div>
                    <div className='d-flex flex-row-reverse'>
                        <div className='d-flex align-items-center'>
                            <p style={{color:'white',backgroundColor:'transparent',fontSize:'14px'}} className='text-end '>{eachExpense.amount} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-trash" style={{color: "#ffffff",cursor:'pointer',opacity:'0.5'}} onClick={()=>deleteExpense(eachExpense.id,eachExpense.categoryId,eachExpense.amount)}></i></p>
                        </div>
                    </div>
                </div>
                  ))
                }
                    
                
            </div>
        </div>
        <div className="col-2"></div>
      </div>

      <div className="container justify-content-center " style={{marginTop:'-100px'}} >
        <div className="container p-2 d-flex flex-row flex-wrap justify-content-start" style={{minHeight:'45px',width:'100%',backgroundColor:'rgba(102,102,102,1)',overflowX: 'auto'}}>
          
        
        </div>
      </div>
      </div>
    </>
  )
}

export default AllExpenses
