import { createBrowserRouter } from "react-router-dom";
import AuthorizedLayout from "../layouts/AuthorizedLayout";
import MainLayout from "../layouts/MainLayout";
import ProfilePage from "../pages/Profile/Profile";
import Dashboard from "../components/Dashboard/Dashboard";
import ForYou from "../components/Dashboard/ForYou/ForYou";
import Following from "../components/Dashboard/Following/Following";
import Explore from "../components/Dashboard/Explore/Explore";
import HomePage from "./../pages/HomePage/HomePage";
import MembershipPage from "../pages/Membership/MembershipPage";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      {
        path: "/",
        element: <Dashboard />,
        children: [
          {
            path: "/HomePage",
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
    ],
  },
  {
    path: "/home",
    element: <AuthorizedLayout />,
    children: [
      {
        path: "/home/profile",
        element: <ProfilePage />,
      },
    ],
  },
]);
