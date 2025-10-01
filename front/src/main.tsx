import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
//import CreateUser from './Pages/CreateUser'
import Home from './Pages/Home'
import CreateUser from './Pages/CreateUser'
import Login from './Pages/Login'
import { AccountPage } from './Pages/AccountPage'
//import Login from './Pages/Login'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='bg-neutral-100 dark:bg-[#1c1c1d] h-[100vh] w-[100vw] block box-border'>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />}/>
          <Route path='account' element={<AccountPage/>}>
            <Route path='register' element={<CreateUser/>} />
            <Route path='login' element={<Login/>} />
          </Route>
          {/* <Route path='/register' element={<CreateUser/>}/>
          <Route path='/login' element={<Login/>}/> */}
        </Routes>
      </BrowserRouter>
    </div>
  </StrictMode>
)
