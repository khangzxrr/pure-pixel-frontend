import React from "react";
import TablePhotographersList from "./TablePhotographersList";

const Table = ({ dataTopSeller }) => {
  return (
    <div className="flex flex-col gap-8 px-5 ">
      <TablePhotographersList dataTopSeller={dataTopSeller} />
    </div>
  );
};

export default Table;
