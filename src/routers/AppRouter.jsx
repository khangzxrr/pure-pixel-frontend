import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ForYou from "../components/Dashboard/ForYou/ForYou";
import Following from "../components/Dashboard/Following/Following";
// import Explore from "../components/Dashboard/Explore/Explore";
import HomePage from "./../pages/HomePage/HomePage";
// import Award from "../pages/HomePage/Award";
import Blog from "../pages/HomePage/Blog";
import Discover from "../pages/HomePage/Discover";
import Licensing from "../pages/HomePage/Licensing";
// import Quest from "../pages/HomePage/Quest";
import CustomerLayout from "../layouts/CustomerLayout";
import Album from "../pages/Customer/Album";
import Photo from "../pages/Customer/Photo";
import Booking from "../pages/Customer/Booking";
import Transaction from "../pages/Customer/Transaction";
import PhotoDetailLayout from "../pages/PhotoDetailLayout";
import UploadPhoto from "../pages/Photographer/UploadPhoto";
import MembershipPage from "../pages/HomePage/MembershipPage";
import MyPhoto from "../layouts/MyPhoto";
import MyPhotoContent from "../components/MyPhoto/MyPhotoComponent/MyPhotoContent";
import MyPhotoLicensing from "../components/MyPhoto/MyPhotoLicensing/MyPhotoLicensing";
import MyPhotoStories from "../components/MyPhoto/MyPhotoStories/MyPhotoStories";
import MyPhotoGalleries from "../components/MyPhoto/MyPhotoGalleries/MyPhotoGalleries";
import MyPhotoLikes from "../components/MyPhoto/MyPhotoLikes/MyPhotoLikes";
import MyPhotoStatistics from "../components/MyPhoto/MyPhotoStatistics/MyPhotoStatistics";
import MyPhotoAll from "../components/MyPhoto/MyPhotoAll/MyPhotoAll";
import MyPhotoPrivate from "../components/MyPhoto/MyPhotoPrivate/MyPhotoPrivate";
import UserProfile from "../pages/UserProfile/UserProfile";
import Photos from "../components/UserProfile/Photos";
import Galleries from "../components/UserProfile/Galleries";
import Completed from "../components/UserProfile/Completed";
import Packages from "../components/UserProfile/Packages";
import Upgrade from "../pages/Manager/UpgradeAccount/Upgrade";
// import ProtectedRoute from "../authorize/";
import DetailPhoto from "../pages/DetailPhoto/DetailPhoto";
import InspirationPhoto from "../components/Inspiration/InspirationPhoto/InspirationPhoto";
import HotPhoto from "../components/Hot/HotPhoto";
import DashboardLayoutF from "../layouts/DashboardLayoutF";
import Explore from "./../components/Explore/Explore";
import Upload from "../components/Upload/Upload";
import PublicUpload from "../components/Upload/PublicUpload";


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
            path: "/admin/upgrade",
            element: <Upgrade />,
          },
          {
            path: "/membership",
            element: <MembershipPage />,
          },
          // {
          //   path: "/following",
          //   element: <Following />,
          // },
          // {
          //   path: "/for-you",
          //   element: <ForYou />,
          // },
          // {
          //   path: "/explore",
          //   element: <Explore />,
          // },
        ],
      },
      {
        path: "/profile/:userId",
        element: <UserProfile />,
        children: [
          {
            path: "/profile/:userId/photos",
            element: <Photos />,
          },
          {
            path: "/profile/:userId/galleries",
            element: <Galleries />,
          },
          {
            path: "/profile/:userId/licensing",
            element: <Licensing />,
          },
          { path: "/profile/:userId/completed", element: <Completed /> },
          { path: "/profile/:userId/packages", element: <Packages /> },
        ],
      },

      {
        path: "/photo/:id",
        element: <PhotoDetailLayout />,
      },
      {
        path: "/photos/:id",
        element: <DetailPhoto />,
      },
      // {
      //   path: "/award",
      //   element: <Award />,
      // },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/discover",
        element: <Discover />,
        children: [
          {
            path: "/discover/following",
            element: <Following />,
          },
          {
            path: "/discover/for-you",
            element: <ForYou />,
          },
          // {
          //   path: "/discover/explore",
          //   element: <Explore />,
          // },
        ],
      },
      // {
      //   path: "/licensing",
      //   element: <Licensing />,
      // },
      {
        path: "/membership",
        element: <MembershipPage />,
      },
      // {
      //   path: "/quest",
      //   element: <Quest />,
      // },
      {
        path: "/upload-photo",
        element: <UploadPhoto />,
      },
      {
        path: "/my-photo/",
        element: <MyPhoto />,
        children: [
          {
            path: "/my-photo/photo",
            element: <MyPhotoContent />,
            children: [
              {
                path: "/my-photo/photo",
                element: <Navigate to="/my-photo/photo/all" />,
              },
              {
                path: "/my-photo/photo/all",
                element: <MyPhotoAll />,
              },
              {
                path: "/my-photo/photo/private",
                element: <MyPhotoPrivate />,
              },
            ],
          },
          {
            path: "/my-photo/licensing",
            element: <MyPhotoLicensing />,
          },
          {
            path: "/my-photo/stories",
            element: <MyPhotoStories />,
          },
          {
            path: "/my-photo/galleries",
            element: <MyPhotoGalleries />,
          },
          {
            path: "/my-photo/likes",
            element: <MyPhotoLikes />,
          },
          {
            path: "/my-photo/statistics",
            element: <MyPhotoStatistics />,
          },
        ],
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
        ],
      },
    ],
  },
  {
    path: "/test",
    element: <DashboardLayoutF />,
    children: [
      {
        path: "/test/explorer",
        element: <Explore />,
        children: [
          {
            path: "/test/explorer/inspiration",
            element: <InspirationPhoto />,
          },
          {
            path: "/test/explorer/hot",
            element: <HotPhoto />,
          },
        ],
      },
      {
        path: "/test/upload",
        element: <Upload />,
        children: [
          {
            path: "/test/upload/public",
            element: <PublicUpload />,
          },
        ],
      },
    ],
  },
]);
