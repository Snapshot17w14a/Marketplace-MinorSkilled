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
import { validateLogin } from './Auth'
import Listing from './Pages/Listing'
import SearchResult from './Pages/SearchResult'
import { fetchSavedListings } from './SavedListings'
import ForgotPassword from './Pages/ForgotPassword'
import ChangePassword from './Pages/ChangePassword'

await validateLogin();
fetchSavedListings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route index element={<Home />}/>
          <Route path='listing/:listingId' element={<Listing/>} />
          <Route path='listingCreator' element={<LisitngCreator/>} />
          <Route path='account' element={<AccountPage/>}>
            <Route path='register' element={<Register/>} />
            <Route path='login' element={<Login/>} />
            <Route path='forgotPassword' element={<ForgotPassword/>} />
            <Route path='changePassword/:resetToken' element={<ChangePassword/>} />
          </Route>
          <Route path='search/:searchPhrase' element={<SearchResult/>} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>
)
