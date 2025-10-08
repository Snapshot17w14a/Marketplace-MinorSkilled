import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Home from './Pages/Home'
import CreateUser from './Pages/CreateUser'
import Login from './Pages/Login'
import { AccountPage } from './Pages/AccountPage'
import NotificationProvider from './Components/NotificationProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
    <NotificationProvider>
        <Routes>
          <Route index element={<Home />}/>
          <Route path='account' element={<AccountPage/>}>
            <Route path='register' element={<CreateUser/>} />
            <Route path='login' element={<Login/>} />
          </Route>
        </Routes>
    </NotificationProvider>
      </BrowserRouter>
  </StrictMode>
)
