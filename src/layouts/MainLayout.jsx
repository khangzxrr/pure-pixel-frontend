import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const MainLayout = () => {
  return (
    <>
      <Header />
      <div className="bg-[#f7f8fa]">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
