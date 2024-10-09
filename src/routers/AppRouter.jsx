import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ForYou from "../components/Dashboard/ForYou/ForYou";
import Following from "../components/Dashboard/Following/Following";
// import Explore from "../components/Dashboard/Explore/Explore";
import HomePage from "./../pages/HomePage/HomePage";
// import Award from "../pages/HomePage/Award";
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
import PrivateUpload from "../components/Upload/PrivateUpload";
import User from "../components/UserProfile/User";
import ErrorPage from "../pages/ErrorPage";
import ListPhotographers from "../pages/Photographer/ListPhotographers";
import ScrollingBar from "../components/Photographer/UploadPhoto/ScrollingBar";
import ProfilePage from "../pages/DetailUser/DetailUser";
import BlogList from "../pages/Blog/BlogList";
import DetailedBlog from "./../pages/Blog/DetailedBlog";
import ProfileSettings from "../pages/ProfileSettings/ProfileSettings";
import Blog from "./../components/Blog/Blog";
import DetailedPhotoView from "../pages/DetailPhoto/DetailPhoto";
import MyPhotosPage from "../pages/MyPhoto/MyPhotosP";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <DashboardLayoutF />,
        children: [
          {
            path: "",
            element: <Navigate to="explore" replace={true} />,
          },
          {
            path: "explore",
            element: <Explore />,
            children: [
              {
                path: "",
                element: <Navigate to="inspiration" replace={true} />,
              },
              {
                path: "inspiration",
                element: <InspirationPhoto />,
              },
              {
                path: "hot",
                element: <HotPhoto />,
              },
              {
                path: "photographers",
                element: <ListPhotographers />,
              },
            ],
          },

          {
            path: "upload",
            element: <Upload />,
            children: [
              // {
              //   path: "public",
              //   element: <PublicUpload />,
              // },
              {
                path: "",
                element: <Navigate to="public" replace={true} />,
              },
              {
                path: "public",
                element: <UploadPhoto />,
              },
              {
                path: "private",
                element: <PrivateUpload />,
              },
            ],
          },
          {
            path: "profile",
            element: <User />,
            children: [
              {
                path: "",
                element: <Navigate to="userprofile" replace={true} />,
              },
              {
                path: "userprofile",
                element: <UserProfile />,
              },
              {
                path: "my-photos",
                element: <MyPhotosPage />,
              },
            ],
          },
          {
            path: "test_scroll",
            element: <ScrollingBar />,
          },
          {
            path: "blog",
            // element: <BlogList />,
            element: <Blog />,
            children: [
              {
                path: "",
                element: <Navigate to="list" replace={true} />,
              },
              {
                path: "list",
                element: <BlogList />,
              },
            ],
          },
        ],
      },
      // {
      //   path: "/",
      //   element: <DashboardLayout />,
      //   children: [
      //     {
      //       path: "/",
      //       element: <HomePage />,
      //     },
      //     {
      //       path: "/admin/upgrade",
      //       element: <Upgrade />,
      //     },
      //     {
      //       path: "/membership",
      //       element: <MembershipPage />,
      //     },
      //     {
      //       path: "/blog",
      //       element: <BlogList />,
      //     },
      //     {
      //       path: "/ProfileSettings",
      //       element: <ProfileSettings />,
      //     },
      //     // {
      //     //   path: "/following",
      //     //   element: <Following />,
      //     // },
      //     // {
      //     //   path: "/for-you",
      //     //   element: <ForYou />,
      //     // },
      //     // {
      //     //   path: "/explore",
      //     //   element: <Explore />,
      //     // },
      //   ],
      // },
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
        element: <DetailedPhotoView listImg={[]} />,
      },
      {
        path: "/photos/:id",
        element: <DetailPhoto />,
      },
      {
        path: "/ProfilePage",
        element: <ProfilePage />,
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
        path: "/blog/:id",
        element: <DetailedBlog />,
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
      // {
      //   path: "/my-photo/",
      //   element: <MyPhoto />,
      //   children: [
      //     {
      //       path: "/my-photo/photo",
      //       element: <MyPhotoContent />,
      //       children: [
      //         {
      //           path: "/my-photo/photo",
      //           element: <Navigate to="/my-photo/photo/all" />,
      //         },
      //         {
      //           path: "/my-photo/photo/all",
      //           element: <MyPhotoAll />,
      //         },
      //         {
      //           path: "/my-photo/photo/private",
      //           element: <MyPhotoPrivate />,
      //         },
      //       ],
      //     },
      //     {
      //       path: "/my-photo/licensing",
      //       element: <MyPhotoLicensing />,
      //     },
      //     {
      //       path: "/my-photo/stories",
      //       element: <MyPhotoStories />,
      //     },
      //     {
      //       path: "/my-photo/galleries",
      //       element: <MyPhotoGalleries />,
      //     },
      //     {
      //       path: "/my-photo/likes",
      //       element: <MyPhotoLikes />,
      //     },
      //     {
      //       path: "/my-photo/statistics",
      //       element: <MyPhotoStatistics />,
      //     },
      //   ],
      // },
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
]);
