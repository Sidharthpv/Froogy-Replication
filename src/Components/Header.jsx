import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { Col, Container, Nav, Navbar, Row } from 'react-bootstrap'
import { auth } from '../firebase';
import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import logo from '../assets/logo.png'

function Header({insideHome}) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("You have been logged out.");
      navigate("/")
      // Optional: Redirect user after logout
      // window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Try again.");
    }
  };

  

  return (

    <>
      <div className="row">
        <div className="col-1"></div>
        <div className="col-9">
        <Navbar  expand="lg" variant="dark" className='ms-5'>
      <Container >
        <Link to={'/home'} style={{textDecoration:'none'}}><Navbar.Brand ><img height={"29px"} width={"84px"} src={logo} alt="logo" style={{left:"0"}} /></Navbar.Brand></Link>
      {insideHome&&(
        <>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
        <Navbar.Collapse id="basic-navbar-nav">
         
          <Nav className="me-auto">
            
              <Nav.Link  className='navElements me-4'>
                <Link to={'/home'} style={{textDecoration:'none',color:'white'}}>Home</Link>
              </Nav.Link>
            
            
              <Nav.Link  className='navElements me-4'>
                <Link to={'/budget'} style={{textDecoration:'none',color:'white'}}>Budget</Link>
              </Nav.Link>
            
              <Nav.Link  className='navElements me-4'>
                <Link to={'/expenses'} style={{textDecoration:'none',color:'white'}}>Expenses</Link>
              </Nav.Link>
          </Nav>
          <Nav className='ms-auto ' >
            <div className='action-button' style={{backgroundColor:"transparent"}}>
              <button className='btn border border-1 ps-3 pe-3 pt-2 pb-2' onClick={handleLogout} >Logout</button>
            </div>
          </Nav> 
        
        
        </Navbar.Collapse></> ) 
      } 
      </Container>
    </Navbar>
        </div>
        <div className="col-2">
        <Navbar.Collapse id="basic-navbar-nav">
        <Nav className='ms-auto ' >
            <div className='logout-button' style={{backgroundColor:"transparent"}}>
              <button className='btn border border-1 ps-3 pe-3 pt-2 pb-2' onClick={handleLogout} >Logout</button>
            </div>
        </Nav>
        </Navbar.Collapse> 
      
        </div>
      </div>

      
    </>
  )
}

export default Header
