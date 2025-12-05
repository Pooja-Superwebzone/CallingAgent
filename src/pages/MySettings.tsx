import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { User } from "@/types";

interface MySettingsProps {
  user: User;
}

//const MySettings = () => {
const MySettings: React.FC<MySettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState(user);

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings saved!");
  };

  return (
    <div className={`min-h-screen px-4 py-5 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className=" mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            My Settings
          </h1>
          <div>
            <button
              className="flex items-center space-x-1 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span className="text-sm">{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-6">
          {["profile", "password", "preferences"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 text-sm font-medium ${
                activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Profile Section */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <img
                    className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
                    src="/avatar.png"
                    alt="Profile"
                />
            </div>
            <Input label="Profile Picture URL" name="profilePic" value={formData.profile_image || ""} onChange={handleProfileChange} />
            <Input label="Name" name="name" value={formData.emp_name || ""} onChange={handleProfileChange} />
            <Input label="Email Address" name="email" value={formData.emp_email || ""} onChange={handleProfileChange} />
            <Input label="Role" name="role" value={formData.emp_role || ""} onChange={handleProfileChange} />
            <Textarea label="Description" name="description" value={formData.emp_email || ""} onChange={handleProfileChange} />

            <div className="text-right">
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* Password Section */}
        {activeTab === "password" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              name="current"
              type="password"
              value={passwordData.current}
              onChange={handlePasswordChange}
            />
            <Input
              label="New Password"
              name="new"
              type="password"
              value={passwordData.new}
              onChange={handlePasswordChange}
            />
            <Input
              label="Confirm New Password"
              name="confirm"
              type="password"
              value={passwordData.confirm}
              onChange={handlePasswordChange}
            />

            <div className="text-right">
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
                Update Password
              </button>
            </div>
          </form>
        )}

        {/* Preferences Section */}
        {activeTab === "preferences" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="telugu">Telugu</option>
                <option value="kannada">Kannada</option>
                <option value="tamil">Tamil</option>
                <option value="malayalam">Malayalam</option>
                <option value="bengali">Bengali</option>
              </select>
            </div>

            <div className="text-right">
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
                Save Preferences
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Reusable Components
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
    />
  </div>
);

const Textarea = ({ label, name, value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600"
    />
  </div>
);

export default MySettings;
