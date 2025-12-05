import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";

interface MyProfileProps {
  user: User;
}

//const MyProfile = () => {
const MyProfile: React.FC<MyProfileProps> = ({ user }) => {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 py-5">
      
      <div className="bg-white shadow-xl rounded-2xl w-full p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
            My Profile
          </h1>
        <div className="flex flex-col items-center text-center">
          <img
            className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
            src="/avatar.png"
            alt="Profile"
          />
          <h2 className="text-2xl font-semibold mt-4">{user.emp_name}</h2>
          <p className="text-gray-600">{user.emp_role}</p>
          <p className="text-sm text-gray-500 mt-1">{user.emp_email}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">About</h3>
          <p className="text-gray-700 text-sm">This is test description....</p>
        </div>

        <div className="mt-6">
          <Button onClick={()=> navigate("/mysettings")}>
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
