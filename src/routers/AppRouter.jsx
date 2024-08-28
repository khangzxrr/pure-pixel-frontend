import { createBrowserRouter } from "react-router-dom";
import AuthorizedLayout from "../layouts/AuthorizedLayout";
import MainLayout from "../layouts/MainLayout";
import ProfilePage from "../pages/Profile/Profile";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
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
