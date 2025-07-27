import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import Sidebar from "../educator/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const { navigate, isEducator, backendUrl, setIsEducator, getToken } = useContext(AppContext);
  const isCourseListPage = location.pathname.includes("/course-list");
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);

  const becomeEducator = async ()=>{
    try {
      if(isEducator){
        navigate('/educator')
        return;
      }
      const token = await getToken();
      const {data} = await axios.get(backendUrl + '/api/educator/update-role', {
        headers: { Authorization: `Bearer ${token}` }})
      
      if(data.success){
        setIsEducator(true);
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? "bg-white" : "bg-cyan-100/70"
      }`}
    >
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-3 hover:drop-shadow-lg"
      />

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        {user && (
          <>
            <button
            className="cursor-pointer hover:font-light"
              onClick={becomeEducator}
            >
              {isEducator ? "Educator Dashboard" : "Become Educator"}
            </button>
            <Link to="/my-enrollments" className="hover:font-light">My Enrollments</Link>
          </>
        )}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:font-light"
          >
            Create Account
          </button>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden flex items-center gap-4">
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="User Icon" />
          </button>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <img
            src={assets.menu_icon}
            alt="Menu"
            className="w-6 h-6 cursor-pointer"
          />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col items-start gap-4 px-6 py-4 md:hidden">
          {user && (
            <>
              <button
                onClick={becomeEducator}
                className="cursor-pointer text-gray-600 "
              >
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </button>
              <Link
                to="/my-enrollments"
                onClick={() => setMenuOpen(false)}
                className="text-gray-600 hover:font-light"
              >
                My Enrollments
              </Link>
            </>
          )}
          {!user && (
            <button
              onClick={() => {
                openSignIn();
                setMenuOpen(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md w-full"
            >
              Create Account
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
