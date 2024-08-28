import { HeaderTab } from "./Header";
//import logo from "../../../public/assets/logo.png";

export default function HeaderTabs() {
  return (
    <div className="flex items-center">
      <div className="ml-16 mr-8 pointer-events-none">
        <img className="w-28" src="/assets/logo.png" alt="Logo" />
      </div>
      {HeaderTab.map((tab) => (
        <div
          key={tab.id}
          className="text-lg  mx-6 hover:text-blue-600 hover:cursor-pointer"
        >
          <a href={tab.link} className="">
            {tab.name}
          </a>
        </div>
      ))}
    </div>
  );
}
