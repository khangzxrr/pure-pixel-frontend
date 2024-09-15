import React from "react";
import CustomerNav from "../components/Customer/Navigation/CustomerNav";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import BookingFilter from "../components/Customer/Filter/BookingFilter";
import { useKeycloak } from "@react-keycloak/web";

export default function CustomerLayout() {
  const location = useLocation().pathname;
  const currentRoute = location.split("/").filter(Boolean).pop();
  const { keycloak } = useKeycloak();

  const renderContent = () => {
    switch (currentRoute) {
      case "album":
        return <div>Album</div>;
      case "photo":
        return <div>Photo</div>;
      case "booking":
        return <BookingFilter />;
      case "transaction":
        return <div>Transaction</div>;
      case "profile":
        return <div>Profile</div>;
      default:
        return <div>Album</div>;
    }
  };
  if (keycloak.authenticated) {
    return (
      <>
        <div className="flex flex-col w-full lg:w-5/6 lg:pt-5 mx-auto">
          {/* <div className="flex w-full pb-3">
            <div className="h-fit lg:w-1/4 invisible lg:visible">
              <CustomerNav />
            </div>
            <div className=" flex flex-col lg:w-full lg:text-3xl py-0 bg-red-300">
              <div className="w-full h-3/5">
                <p className="text-center">My Account</p>
              </div>
              <div className="w-11/12 my-3 mx-auto h-2/5 p-3 bg-white rounded-lg">
                {renderContent()}
              </div>
            </div>
          </div> */}

        {/* <div className="visible lg:invisible lg:w-0">
          <UserNavMobi />
        </div> */}

        <Outlet />
      </div>
    </>
  );
}
