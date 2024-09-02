import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ForYou from "../components/Dashboard/ForYou/ForYou";
import Following from "../components/Dashboard/Following/Following";
import Explore from "../components/Dashboard/Explore/Explore";
import HomePage from "./../pages/HomePage/HomePage";
import Award from "../pages/HomePage/Award";
import Blog from "../pages/HomePage/Blog";
import Discover from "../pages/HomePage/Discover";
import Licensing from "../pages/HomePage/Licensing";
import Quest from "../pages/HomePage/Quest";
import CustomerLayout from "../layouts/CustomerLayout";
import Album from "../pages/Customer/Album";
import Photo from "../pages/Customer/Photo";
import Booking from "../pages/Customer/Booking";
import Transaction from "../pages/Customer/Transaction";
import Profile from "../pages/Customer/Profile";
import PhotoDetailLayout from "../layouts/PhotoDetailLayout";
import UploadPhoto from "../pages/Photographer/UploadPhoto";
import MembershipPage from "../pages/HomePage/MembershipPage";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/membership",
            element: <MembershipPage />,
          },
          {
            path: "/following",
            element: <Following />,
          },
          {
            path: "/for-you",
            element: <ForYou />,
          },
          {
            path: "/explore",
            element: <Explore />,
          },
        ],
      },
      {
        path: "/for-you/:id",
        element: <PhotoDetailLayout />,
      },
      {
        path: "/award",
        element: <Award />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/discover",
        element: <Discover />,
      },
      {
        path: "/licensing",
        element: <Licensing />,
      },
      {
        path: "/membership",
        element: <MembershipPage />,
      },
      {
        path: "/quest",
        element: <Quest />,
      },
      {
        path: "/upload-photo",
        element: <UploadPhoto />,
      },
      {
        path: "/customer",
        element: <CustomerLayout />,
        children: [
          {
            path: "/customer",
            element: <Navigate to="/customer/profile" />,
          },
          {
            path: "/customer/album",
            element: <Album />,
          },
          {
            path: "/customer/photo",
            element: <Photo />,
          },
          {
            path: "/customer/booking",
            element: <Booking />,
          },
          {
            path: "/customer/transaction",
            element: <Transaction />,
          },
          {
            path: "/customer/profile",
            element: <Profile />,
          },
        ],
      },
    ],
  },
]);
