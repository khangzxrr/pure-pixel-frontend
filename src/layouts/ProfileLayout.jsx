import React from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";

export default function ProfileLayout() {
  const { userId } = useParams(); // Get userId from the URL parameters

  return (
    <div className="flex">
      <div className="mx-auto">
        <ul className="flex space-x-4">
          <li>
            <NavLink
              to={`/profile/${userId}/photos`}
              className={({ isActive }) =>
                isActive ? "font-bold text-blue-500" : "text-gray-700"
              }
            >
              Photos
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/profile/${userId}/galleries`}
              className={({ isActive }) =>
                isActive ? "font-bold text-blue-500" : "text-gray-700"
              }
            >
              Galleries
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/profile/${userId}/licensing`}
              className={({ isActive }) =>
                isActive ? "font-bold text-blue-500" : "text-gray-700"
              }
            >
              Licensing
            </NavLink>
          </li>
        </ul>
      </div>

      <Outlet />
    </div>
  );
}
