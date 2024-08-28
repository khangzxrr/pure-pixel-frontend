import { useKeycloak } from "@react-keycloak/web";
import { Link, useNavigate } from "react-router-dom";
import HeaderTabs from "./HeaderTabs";

export default function AuthorizedHeader(props) {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center h-20 bg-gray-200">
      <HeaderTabs />
      <div className="flex">
        <div className="flex mr-5 items-center gap-5">
          <div>
            <button
              onClick={() => navigate("/home/profile")}
              className="text-lg font-bold hover:text-blue-600"
            >
              Hello {props.username}!
            </button>
          </div>
          <div className="flex items-center px-3 py-0.25 outline outline-2 outline-offset-2 rounded-full">
            <button
              className="text-lg font-bold hover:text-blue-600"
              onClick={() => keycloak.logout()}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
