import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLouyt = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default MainLouyt;
