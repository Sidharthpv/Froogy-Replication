import { useState } from 'react'

import './App.css'
import Header from './Components/Header'
import { Route, Routes } from 'react-router-dom'
import Login from './Pages/Login'
import Home from './Pages/Home'
import Budget from './Pages/Budget'
import Expenses from './Pages/Expenses'
import UpcomingPayments from './Pages/UpcomingPayments'
import ViewACategory from './Pages/ViewACategory'

function App() {

  return (
    <>
      
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/budget' element={<Budget/>}/>
        <Route path='/expenses' element={<Expenses/>}/>
        <Route path='/upcoming' element={<UpcomingPayments/>}/>
        <Route path='/categories/:categoryId' element={<ViewACategory/>}/>
      </Routes>
    </>
  )
}

export default App
