import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Home from './Pages/Home'
import Register from './Pages/AccountManagement/Register'
import Login from './Pages/AccountManagement/Login'
import { AccountPage } from './Pages/AccountManagement/AccountPage'
import NotificationProvider from './Components/NotificationProvider'
import { validateLogin } from './Auth'
import { fetchSavedListings } from './SavedListings'
import Listing from './Pages/Listings/Listing'
import SearchResult from './Pages/SearchResult'
import ForgotPassword from './Pages/AccountManagement/ForgotPassword'
import ChangePassword from './Pages/AccountManagement/ChangePassword'
import EditListing from './Pages/Listings/EditListing'
import EnableMFA from './Pages/AccountManagement/EnableMFA'
import EnterMFA from './Pages/AccountManagement/EnterMFA'
import VerifyAccount from './Pages/VerifyAccount'
import PopupProvider from './Components/PopupProvider'
import TopNavigation from './Components/TopNavigation'
import CreateListing from './Pages/Listings/CreateListing'
import Management from './Pages/Management'

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
            <Route path='listing/:listingId' element={<Listing/>} />
            <Route path='listing/creator' element={<CreateListing/>} />
            <Route path='listing/edit/:listingId' element={<EditListing/>} />
            <Route path='management/:page' element={<Management/>} />
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
