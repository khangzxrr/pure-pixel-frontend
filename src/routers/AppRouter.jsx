import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Following from "../components/Dashboard/Following/Following";
import UploadPhoto from "../pages/Photographer/UploadPhoto";
import UserProfile from "../pages/UserProfile/UserProfile";
import Upgrade from "../pages/Manager/UpgradeAccount/Upgrade";
import DetailPhoto from "../pages/DetailPhoto/DetailPhoto";
import InspirationPhoto from "../components/Inspiration/InspirationPhoto/InspirationPhoto";
import HotPhoto from "../components/Hot/HotPhoto";
import DashboardLayoutF from "../layouts/DashboardLayoutF";
import Explore from "./../components/Explore/Explore";
import Upload from "../components/Upload/Upload";
import PrivateUpload from "../components/Upload/PrivateUpload";
import User from "../components/UserProfile/User";
import ErrorPage from "../pages/ErrorPage";
import ListPhotographers from "../pages/Photographer/ListPhotographers";
import ProfilePage from "../pages/DetailUser/DetailUser";
import BlogList from "../pages/Blog/BlogList";
import DetailedBlog from "./../pages/Blog/DetailedBlog";
import Wallet from "../pages/UserProfile/Wallet";
import Blog from "./../components/Blog/Blog";
import DetailedPhotoView from "../pages/DetailPhoto/DetailPhoto";
import MyPhotosPage from "../pages/MyPhoto/MyPhotosP";
import AdminLayout from "../layouts/AdminLayout";
import PhotoSellingPage from "../pages/PhotoSelling/PhotoSellingPage";
import Report from "../pages/Manager/Report/Report";
import BlogManager from "../pages/Manager/Blog/BlogManager";
import ChatPage from "../pages/Message/ChatPage";
import PhotoMap from "../pages/PhotoMap/PhotoMap";
import CameraPage from "../pages/Camera/CameraPage";
import CameraList from "../components/ComCamera/CameraList";
import CameraDetail from "../components/ComCamera/CameraDetail";
import CameraByBrand from "../components/ComCamera/CameraByBrand";
import SellerProfile from "../pages/SellerProfile/SellerProfile";
import ProductPhotoDetail from "../pages/ProductPhotoDetail/ProductPhotoDetail";
import SellUpload from "../components/Upload/SellUpload";
import NewfeedPage from "../pages/NewFeed/NewfeedPage";
import UserProfileV2 from "../pages/UserProfile/UserProfileV2";
import UserOther from "../components/UserOther/UserOther";
import PhotosUser from "../components/UserOther/PhotosUser";
import PackagesUser from "../components/UserOther/PackagesUser";
import SellingUser from "../components/UserOther/SellingUser";
import PhotosBought from "../components/PhotoBought/PhotosBought";
import PhotoBoughtDetail from "../components/PhotoBought/PhotoBoughtDetail";
import CreateBookingPackage from "../components/ComCreateBooking/CreateBookingPackage";
import PhotoshootPackageList from "../components/Booking/PhotoshootPackageList";
import PhotoshootPackageDetail from "../components/Booking/PhotoshootPackageDetail";
import BookingRequestList from "../components/Booking/BookingRequestList";
import BookingDetail from "../components/Booking/BookingDetail/BookingDetail";
import CustomerBooking from "../pages/UserProfile/CustomerBooking";
import CustomerBookingDetail from "../pages/UserProfile/CustomerBookingDetail";
import PhotoshootPackageManagementV2 from "../pages/UserProfile/PhotoshootPackageManagementV2";
import ProtectRoute from "./ProtectRoute";
import UpgradeToPtgPage from "../pages/UpgradeToPtg/UpgradeToPtgPage";
import BookmarkLayout from "../layouts/BookmarkLayout";
import PhotoManager from "../pages/Manager/PhotoManager/PhotoManager";
import TransactionManager from "../pages/Manager/TransactionManager/TransactionManager";

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
            path: "upgrade",
            element: <UpgradeToPtgPage />,
          },
          {
            path: "following",
            element: <Following />,
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
                path: "shop-profile/:id",
                element: <SellerProfile />,
              },

              {
                path: "hot",
                element: <HotPhoto />,
              },
              {
                path: "photographers",
                element: <ListPhotographers />,
              },
              {
                path: "selling",
                element: <PhotoSellingPage />,
              },
              {
                path: "photo-map",
                element: <PhotoMap />,
              },
              {
                path: "booking-package",
                element: <PhotoshootPackageList />,
              },
              {
                path: "booking-package/:photoshootPackageId",
                element: <PhotoshootPackageDetail />,
              },
              {
                path: "product-photo/:id",
                element: <ProductPhotoDetail />,
              },
              {
                path: "camera",
                element: <CameraList />,
              },
              {
                path: "camera-brand/:cameraId",
                element: <CameraByBrand />,
              },
              {
                path: "camera-model/:cameraId",
                element: <CameraDetail />,
              },
            ],
          },
          {
            path: "camera",
            element: <CameraPage />,
            children: [
              {
                path: "",
                element: <Navigate to="all" replace={true} />,
              },
              {
                path: "all",
                element: <CameraList />,
              },
              {
                path: ":cameraId",
                element: <CameraDetail />,
              },
              { path: "brand/:cameraId", element: <CameraByBrand /> },
              {
                path: "product-photo/:id",
                element: <ProductPhotoDetail />,
              },
            ],
          },

          {
            path: "upload",
            element: (
              <ProtectRoute checkRole={"photographer"}>
                <Upload />
              </ProtectRoute>
            ),
            children: [
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
              {
                path: "sell",
                element: <SellUpload />,
              },
            ],
          },

          {
            path: "user",
            element: <UserOther />,
            children: [
              {
                path: ":userId",
                element: <UserProfileV2 />,
                children: [
                  {
                    path: "",
                    element: <Navigate to="photos" replace={true} />,
                  },
                  {
                    path: "photos",
                    element: <PhotosUser />,
                  },
                  {
                    path: "packages",
                    element: <PackagesUser />,
                  },
                  {
                    path: "selling",
                    element: <SellingUser />,
                  },
                ],
              },
              {
                path: "product-photo/:id",
                element: <ProductPhotoDetail />,
              },
              {
                path: "booking-package/:photoshootPackageId",
                element: <PhotoshootPackageDetail />,
              },
            ],
          },
          {
            path: "profile",
            element: (
              <ProtectRoute checkRole={"customer"}>
                <User />
              </ProtectRoute>
            ),
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
                path: "bookmark",
                element: <BookmarkLayout />,
              },
              {
                path: "my-photos",
                element: <MyPhotosPage />,
              },
              {
                path: "wallet",
                element: <Wallet />,
              },
              {
                path: "photoshoot-package",
                element: (
                  <ProtectRoute checkRole={"photographer"}>
                    <PhotoshootPackageManagementV2 />
                  </ProtectRoute>
                ),
              },
              {
                path: "photoshoot-package/:photoshootPackageId",
                element: (
                  <ProtectRoute checkRole={"photographer"}>
                    <PhotoshootPackageDetail />
                  </ProtectRoute>
                ),
              },
              {
                path: "booking-request",
                element: (
                  <ProtectRoute checkRole={"photographer"}>
                    <BookingRequestList />
                  </ProtectRoute>
                ),
              },
              {
                path: "customer-booking",
                element: <CustomerBooking />,
              },
              {
                path: "customer-booking/:bookingId",
                element: <CustomerBookingDetail />,
              },
              {
                path: "booking/:bookingId",
                element: (
                  <ProtectRoute checkRole={"photographer"}>
                    <BookingDetail />
                  </ProtectRoute>
                ),
              },
              {
                path: "photo-selling",
                element: (
                  <ProtectRoute checkRole={"photographer"}>
                    <SellerProfile />
                  </ProtectRoute>
                ),
              },
              {
                path: "photos-bought",
                element: <PhotosBought />,
              },
              {
                path: "photo-bought/:boughtId",
                element: <PhotoBoughtDetail />,
              },
              {
                path: "product-photo/:id",
                element: <ProductPhotoDetail />,
              },
              {
                path: "create-booking-package",
                element: <CreateBookingPackage />,
              },
            ],
          },
          {
            path: "home",
            // element: <BlogList />,
            element: <Blog />,
            children: [
              {
                path: "",
                element: <Navigate to="newfeed" replace={true} />,
              },
              {
                path: "newfeed",
                element: <NewfeedPage />,
              },
              {
                path: "list",
                element: <BlogList />,
              },
            ],
          },
          {
            path: "message",
            element: (
              <ProtectRoute checkRole={"customer"}>
                <ChatPage />
              </ProtectRoute>
            ),
          },
        ],
      },

      {
        path: "/blog",
        element: <BlogList />,
      },

      {
        path: "/admin",
        element: (
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        ),
        children: [
          {
            path: "/admin/*",
            element: <p className="w-screen">12312312321</p>,
          },
          {
            path: "/admin/upgrade",
            element: <Upgrade />,
          },
          {
            path: "/admin/photo",
            element: <PhotoManager />,
          },
          {
            path: "/admin/transaction",
            element: <TransactionManager />,
          },
          {
            path: "/admin/report",
            element: <Report />,
          },
          {
            path: "/admin/blog",
            element: <BlogManager />,
          },
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
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/blog/:id",
        element: <DetailedBlog />,
      },
    ],
  },
]);
