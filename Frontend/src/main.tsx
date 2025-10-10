import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Home from './Pages/Home'
import Register from './Pages/Register'
import Login from './Pages/Login'
import { AccountPage } from './Pages/AccountPage'
import NotificationProvider from './Components/NotificationProvider'
import LisitngCreator from './Pages/ListingCreator'
import { ValidateToken } from './Auth'

ValidateToken();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <NotificationProvider>
          <Routes>
            <Route index element={<Home />}/>
            <Route path='listingCreator' element={<LisitngCreator/>} />
            <Route path='account' element={<AccountPage/>}>
              <Route path='register' element={<Register/>} />
              <Route path='login' element={<Login/>} />
            </Route>
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
  </StrictMode>
)
