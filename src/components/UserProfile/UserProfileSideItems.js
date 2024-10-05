import { IoPersonSharp } from "react-icons/io5";
import UserService from "../../services/Keycloak";
import { FaMoneyBillTransfer } from "react-icons/fa6";

const userData = UserService.getTokenParsed();
const UserProfileSideItems = [
  {
    id: "NameProfile",
    title: "Hồ sơ",
    icon: <IoPersonSharp />,
    link: "userprofile",
  },
  {
    id: "transaction",
    link: "wallet",
    title: "Ví",
    icon: <FaMoneyBillTransfer className="text-3xl" />,
  },
];

export default UserProfileSideItems;
