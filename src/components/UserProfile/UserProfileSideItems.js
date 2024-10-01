import { IoPersonSharp } from "react-icons/io5";
import UserService from "../../services/Keycloak";

const userData = UserService.getTokenParsed();
const UserProfileSideItems = [
  {
    id: "NameProfile",
    title: "Hồ sơ",
    icon: <IoPersonSharp />,
    link: "userprofile",
  },
];

export default UserProfileSideItems;
