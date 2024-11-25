import React, { useState } from "react";
import { SlOptions } from "react-icons/sl";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaAngleDown } from "react-icons/fa6";
import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./../LoadingSpinner/LoadingSpinner";
import AdminApi from "../../apis/AdminApi";
import UpdateUserDetail from "./UpdateUserDetail";
const UpdateUserManager = ({ onClose, account }) => {
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const userId = account?.id;

  console.log(userId);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user-detail-manager"],
    queryFn: () => AdminApi.getUserById(userId),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  return <UpdateUserDetail userDetail={data} onClose={onClose} />;
};

export default UpdateUserManager;
