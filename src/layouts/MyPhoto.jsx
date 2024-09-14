import React, { useEffect, useState } from "react";
import MyPhotoNav from "./../components/MyPhoto/MyPhotoNav/MyPhotoNav";
import MyPhotoContent from "../components/MyPhoto/MyPhotoComponent/MyPhotoContent";
import { Outlet } from "react-router-dom";
import UserService from "../services/Keycloak";

const MyPhoto = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const roles = UserService.hasRole(["customer"]);
    setRoles(roles);
    console.log("roles", UserService.getUserRoles());
  }, []);
  console.log("roles", roles);

  return (
    <div className="grid grid-cols-12">
      <MyPhotoNav />
      <Outlet />
    </div>
  );
};

export default MyPhoto;
