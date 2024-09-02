import { Link } from "react-router-dom";

export const HeaderTab = [
  {
    id: 1,
    name: "Discover",
    link: "/discover",
  },
  {
    id: 2,
    name: "Licensing",
    link: "/licensing",
  },
  {
    id: 3,
    name: "Membership",
    link: "/membership",
  },
  {
    id: 4,
    name: "Quest",
    link: "/quest",
  },
  {
    id: 5,
    name: "Blog",
    link: "/blog",
  },
  {
    id: 6,
    name: "Award Winners",
    link: "/award",
  },
];

export default function HeaderTabs() {
  return (
    <div className="flex items-center">
      <div className="ml-16 mr-8">
        <Link to="/">
          <img className="w-28" src="/assets/logo.png" alt="Logo" />
        </Link>
      </div>
      {HeaderTab.map((tab) => (
        <div
          key={tab.id}
          className="text-lg  mx-6 hover:text-blue-600 hover:cursor-pointer"
        >
          <Link to={tab.link} className="">
            {tab.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
