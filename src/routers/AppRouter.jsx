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
import MyPhotoshootPackageDetail from "../pages/UserProfile/MyPhotoshootPackageDetail";
import PhotoManager2 from "../pages/Manager/PhotoManager2/PhotoManager2";
import ServicePackageManager from "./../pages/Manager/ServicePackage/ServicePackageManager";
import CameraManager from "../pages/Manager/Camera/CameraManager";
import TransactionWithdrawalManager from "../pages/Manager/TransactionWithdrawalManager/TransactionWithdrawalManager";
import StatiticsPage from "../pages/Admin/StatiticsPage";
import AccountManagerPage from "../pages/Admin/AccountManagerPage";
import PrivateExceptionPage from "../layouts/PrivateExceptionPage";
import SellPhoto from "../pages/Photographer/SellPhoto";
import ECommerce from "./../pages/Admin/ECommerce";
import ComTotalUsers from "../components/ComECommerce/ComTotalUsers";
import PhotographerDetailStats from "../components/ComECommerce/PhotographerDetailStats";
import LoadingPage from "../pages/LoadingPage";
import PolicyPage from "./../pages/PolicyPage/PolicyPage";
import ChangeLogPage from "../pages/ChangeLog/ChangeLogPage";
import ChangeLogManager from "../pages/Manager/ChangeLog/ChangeLogManager";
import FeatureRoute from "../components/FeatureGate/FeatureRoute";

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
          { path: "policy", element: <PolicyPage /> },
          { path: "changelog", element: <ChangeLogPage /> },
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
                path: "blog",
                element: <BlogList />,
              },
              {
                path: "blog/:blogId",
                element: <DetailedBlog />,
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
                element: (
                  <FeatureRoute flag="booking">
                    <PhotoshootPackageList />
                  </FeatureRoute>
                ),
              },
              {
                path: "booking-package/:photoshootPackageId",
                element: (
                  <FeatureRoute flag="booking">
                    <PhotoshootPackageDetail />
                  </FeatureRoute>
                ),
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
              <ProtectRoute checkRoles={["photographer"]}>
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
                element: <SellPhoto />,
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
                    element: (
                      <FeatureRoute flag="booking">
                        <PackagesUser />
                      </FeatureRoute>
                    ),
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
                element: (
                  <FeatureRoute flag="booking">
                    <PhotoshootPackageDetail />
                  </FeatureRoute>
                ),
              },
            ],
          },
          {
            path: "profile",
            element: (
              <ProtectRoute
                checkRoles={["customer", "photographer", "manager"]}
              >
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
                  <FeatureRoute flag="booking">
                    <ProtectRoute checkRoles={["photographer"]}>
                      <PhotoshootPackageManagementV2 />
                    </ProtectRoute>
                  </FeatureRoute>
                ),
              },
              {
                path: "photoshoot-package/:photoshootPackageId",
                element: (
                  <FeatureRoute flag="booking">
                    <ProtectRoute checkRoles={["photographer"]}>
                      {/* <PhotoshootPackageDetail /> */}
                      <MyPhotoshootPackageDetail />
                    </ProtectRoute>
                  </FeatureRoute>
                ),
              },
              {
                path: "booking-request",
                element: (
                  <FeatureRoute flag="booking">
                    <ProtectRoute checkRoles={["photographer"]}>
                      <BookingRequestList />
                    </ProtectRoute>
                  </FeatureRoute>
                ),
              },
              {
                path: "booking-request/:bookingId",
                element: (
                  <FeatureRoute flag="booking">
                    <ProtectRoute checkRoles={["photographer"]}>
                      <BookingDetail />
                    </ProtectRoute>
                  </FeatureRoute>
                ),
              },
              {
                path: "customer-booking",
                element: (
                  <FeatureRoute flag="booking">
                    <CustomerBooking />
                  </FeatureRoute>
                ),
              },
              {
                path: "customer-booking/:bookingId",
                element: (
                  <FeatureRoute flag="booking">
                    <CustomerBookingDetail />
                  </FeatureRoute>
                ),
              },

              {
                path: "photo-selling",
                element: (
                  <ProtectRoute checkRoles={["photographer", "customer"]}>
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
                element: (
                  <FeatureRoute flag="booking">
                    <CreateBookingPackage />
                  </FeatureRoute>
                ),
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
                element: <Navigate to="list" replace={true} />,
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
              <ProtectRoute
                checkRoles={["customer", "photographer", "manager"]}
              >
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
          <ProtectRoute checkRoles={["manager", "purepixel-admin"]}>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </ProtectRoute>
        ),
        children: [
          {
            path: "",
            element: <Navigate to="/admin/Dashboard" replace={true} />,
          },
          {
            path: "/admin/Dashboard",
            element: <ECommerce />,
          },
          {
            path: "/admin/Dashboard/total-users",
            element: <ComTotalUsers />,
          },
          {
            path: "/admin/Dashboard/ptgDetail/:photographerId",
            element: <PhotographerDetailStats />,
          },
          {
            path: "/admin/upgrade",
            element: <Upgrade />,
          },
          {
            path: "/admin/photo",
            element: <PhotoManager2 />,
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
          {
            path: "/admin/changelog",
            element: <ChangeLogManager />,
          },
          {
            path: "/admin/service-package",
            element: (
              <FeatureRoute flag="booking">
                <ServicePackageManager />
              </FeatureRoute>
            ),
          },
          {
            path: "/admin/camera",
            element: <CameraManager />,
          },
          {
            path: "/admin/withdrawal-processing",
            element: <TransactionWithdrawalManager />,
          },
          {
            path: "/admin/account",
            element: <AccountManagerPage />,
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
  {
    path: "/loading-page",
    element: <LoadingPage />,
  },
  {
    path: "/private-exception",
    element: <PrivateExceptionPage />,
  },
]);
