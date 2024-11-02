import React from "react";

import NewfeedCard from "./../components/ComNewfeed/NewfeedCard";
import ProfileUpload from "../components/ComNewfeed/ProfileUpload";

const NewfeedLayout = () => {
  return (
    <div className="flex flex-col gap-3 py-2 items-center w-full ">
      <ProfileUpload />
      <NewfeedCard />
      <NewfeedCard />
    </div>
  );
};

export default NewfeedLayout;
