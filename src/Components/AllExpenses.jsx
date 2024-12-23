import React, { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc } from "firebase/firestore";
import { db } from '../firebase'
import { FadeLoader } from 'react-spinners'


function AllExpenses({userId}) {
  console.log("userId in AllExpenses:", userId);
  console.log("AllExpenses component rendered");
  
  const[expensesArray,setExpensesArray]=useState([])
  const[isDisabled, setIsDisabled] = useState(false);
  const[loading,setLoading] = useState(false)
  
  


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
            timestamp: dateObj,
            category: categoryname
          });
          
        });
        
        
      }

      // Sorting the expenses
      fetchedExpenses.sort((a,b)=>b.timestamp - a.timestamp)
      
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
    }
    catch(error){
      console.log("error deleting the expense: ",error);
      
    }
    setLoading(false)
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
                      <div className=' d-flex flex-row-reverse'>
                          <div className='d-flex align-items-center'>
                              <p style={{color:'white',backgroundColor:'transparent',fontSize:'var(--Body-Medium)'}} className='text-end '>${eachExpense.amount} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={!isDisabled ? ()=>deleteExpense(eachExpense.id,eachExpense.categoryId,eachExpense.amount) : null} style={{marginTop:'-5px'}}>
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

export default AllExpenses
