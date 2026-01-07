import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Home from './Pages/Home'
import Register from './Pages/Register'
import Login from './Pages/Login'
import { AccountPage } from './Pages/AccountPage'
import NotificationProvider from './Components/NotificationProvider'
import { validateLogin } from './Auth'
import Listing from './Pages/Listing'
import SearchResult from './Pages/SearchResult'
import ForgotPassword from './Pages/ForgotPassword'
import ChangePassword from './Pages/ChangePassword'
import EditListing from './Pages/EditListing'
import EnableMFA from './Pages/EnableMFA'
import EnterMFA from './Pages/EnterMFA'
import VerifyAccount from './Pages/VerifyAccount'
import PopupProvider from './Components/PopupProvider'
//import Empty from './Pages/Empty'
import TopNavigation from './Components/TopNavigation'
import { fetchSavedListings } from './SavedListings'
import CreateListing from './Pages/CreateListing'

try {
  await validateLogin();
  await fetchSavedListings();
} catch (error) {
  console.error("Error during initial auth or saved listings fetch:", error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <PopupProvider>
          <TopNavigation/>
          <Routes>
            <Route index element={<Home />}/>
            {/* <Route path='empty' element={<Empty/>} /> */}
            <Route path='listing/:listingId' element={<Listing/>} />
            <Route path='listing/creator' element={<CreateListing/>} />
            <Route path='listing/edit/:listingId' element={<EditListing/>} />
            <Route path='account' element={<AccountPage/>}>
              <Route path='register' element={<Register/>} />
              <Route path='login' element={<Login/>} />
              <Route path='forgotPassword' element={<ForgotPassword/>} />
              <Route path='changePassword/:resetToken' element={<ChangePassword/>} />
              <Route path='enableMFA' element={<EnableMFA/>} />
              <Route path='enterMFA' element={<EnterMFA/>} />
              <Route path='verifyAccount/:verificationCode' element={<VerifyAccount/>} />
            </Route>
            <Route path='search/:searchPhrase' element={<SearchResult/>} />
          </Routes>
        </PopupProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>
)
