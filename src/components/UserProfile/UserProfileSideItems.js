import { IoPersonSharp } from "react-icons/io5";
import { IoMdPhotos } from "react-icons/io";
import UserService from "../../services/Keycloak";

const userData = UserService.getTokenParsed();
const UserProfileSideItems = [
  {
    id: "NameProfile",
    title: "Hồ sơ",
    icon: <IoPersonSharp />,
    link: "/profile/userprofile",
  },
  {
    id: "MyPhotos",
    title: "Ảnh của tôi",
    icon: <IoMdPhotos />,
    link: "/profile/my-photos",
  },
];

export default UserProfileSideItems;
