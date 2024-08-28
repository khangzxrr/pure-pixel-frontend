import { useKeycloak } from "@react-keycloak/web";
import HeaderTabs from "./HeaderTabs";

export default function UnauthorizedHeader() {
  const { keycloak } = useKeycloak();
  return (
    <div className="flex">
      <div className="flex mr-5 items-center gap-5">
        <HeaderTabs />
        <div>
          <button
            onClick={() => keycloak.login()}
            className="text-lg font-bold hover:text-blue-600"
          >
            Log in
          </button>
        </div>
        <div className="flex items-center px-3 py-0.25 outline outline-2 outline-offset-2 rounded-full">
          <button
            onClick={() => keycloak.login()}
            className="text-lg font-bold hover:text-blue-600"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
