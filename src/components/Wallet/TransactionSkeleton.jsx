import React from "react";
import { Skeleton } from "antd"; // Make sure to import Skeleton from the appropriate library

export default function TransactionSkeleton() {
  const renderSkeleton = () => (
    <tr>
      <td className="px-4 py-2 text-center">
        <Skeleton.Input style={{ width: 100 }} active={true} />
      </td>
      <td className="px-4 py-2 text-center">
        <Skeleton.Input style={{ width: 100 }} active={true} />
      </td>
      <td className="px-4 py-2 text-center">
        <Skeleton.Input style={{ width: 120 }} active={true} />
      </td>
      <td className="px-4 py-2 text-center">
        <Skeleton.Input style={{ width: 100 }} active={true} />
      </td>
      <td className="px-4 py-2 text-center">
        <Skeleton.Input style={{ width: 150 }} active={true} />
      </td>
    </tr>
  );

  return (
    <tbody className="bg-[#36393f]">
      {Array.from({ length: 8 }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </tbody>
  );
}
