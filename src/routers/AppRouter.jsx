import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthorizedLayout from "../layouts/AuthorizedLayout";
import MainLayout from "../layouts/MainLayout";
import ProfilePage from "../pages/Profile/Profile";
import Dashboard from "../components/Dashboard/Dashboard";
import ForYou from "../components/Dashboard/ForYou/ForYou";
import Following from "../components/Dashboard/Following/Following";
import Explore from "../components/Dashboard/Explore/Explore";
import Award from "../pages/HomePage/Award";
import Blog from "../pages/HomePage/Blog";
import Discover from "../pages/HomePage/Discover";
import Licensing from "../pages/HomePage/Licensing";
import Membership from "../pages/HomePage/Membership";
import Quest from "../pages/HomePage/Quest";
import CustomerLayout from "../layouts/CustomerLayout";
import Album from "../pages/Customer/Album";
import Photo from "../pages/Customer/Photo";
import Booking from "../pages/Customer/Booking";
import Transaction from "../pages/Customer/Transaction";
import Profile from "../pages/Customer/Profile";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
        children: [
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
        element: <Membership />,
      },
      {
        path: "/quest",
        element: <Quest />,
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
  {
    path: "/auth",
    element: <AuthorizedLayout />,
    children: [
      {
        path: "/auth/customer",
        element: <CustomerLayout />,
        children: [
          {
            path: "/auth/customer",
            element: <Navigate to="/customer/profile" />,
          },
          {
            path: "/auth/customer/album",
            element: <Album />,
          },
          {
            path: "/auth/customer/photo",
            element: <Photo />,
          },
          {
            path: "/auth/customer/booking",
            element: <Booking />,
          },
          {
            path: "/auth/customer/transaction",
            element: <Transaction />,
          },
          {
            path: "/auth/customer/profile",
            element: <Profile />,
          },
        ],
      },
    ],
  },
]);
