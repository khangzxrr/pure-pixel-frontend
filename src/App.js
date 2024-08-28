import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import MainLayout from "./layouts/MainLayout";
import React from "react";
import Album from "./pages/Customer/Album";
import Photo from "./pages/Customer/Photo";
import Booking from "./pages/Customer/Booking";
import Transaction from "./pages/Customer/Transaction";
import Profile from "./pages/Customer/Profile";
import Discover from "./pages/HomePage/Discover";
import Licensing from "./pages/HomePage/Licensing";
import Membership from "./pages/HomePage/Membership";
import Quest from "./pages/HomePage/Quest";
import CustomerLayout from "./layouts/CustomerLayout";
import Blog from "./pages/HomePage/Blog";
import Award from "./pages/HomePage/Award";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            {/* <Route path="/reject" element={<UserBanned />} /> */}
            {/* <Route
              path="/productDetail/:productId"
              element={<ProductDetailPage />}
            /> */}
            <Route path="/discover" element={<Discover />} />
            <Route path="/licensing" element={<Licensing />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/quest" element={<Quest />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/award" element={<Award />} />
            {/* CUSTOMER ROLE */}
            <Route
              path="/customer"
              element={
                // <ProtectRole requiredRole={1}>
                <CustomerLayout />
                // </ProtectRole>
              }
            >
              <Route index element={<Navigate to="/customer/album" />} />
              <Route path="/customer/album" element={<Album />} />

              <Route path="/customer/photo" element={<Photo />} />
              <Route path="/customer/booking" element={<Booking />} />
              <Route path="/customer/transaction" element={<Transaction />} />
              <Route path="/customer/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
