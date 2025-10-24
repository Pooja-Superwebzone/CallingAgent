import { useState } from "react";
import React from "react";
import { FiX, FiPhone, FiMail, FiUser } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { createChannelPartner } from "../../hooks/useAuth"; 

function ContactFormModal({ showContactForm, setShowContactForm, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone_no: formData.phone.trim(),
    };

    try {
      setLoading(true);
      const res = await createChannelPartner(payload); 
      toast.success("Form submitted successfully!");
      console.log("✅ Created:", res);

      setFormData({ name: "", email: "", phone: "" });
      setShowContactForm(false);

      if (onSuccess) onSuccess(); 
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    showContactForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-2 sm:px-4">
        <div className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl min-h-[400px] p-6 sm:p-10 md:p-12 rounded-3xl shadow-2xl bg-gradient-to-br from-blue-100 via-white to-blue-200 text-center animate-fadeIn overflow-hidden">
          <button
            onClick={() => setShowContactForm(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl sm:text-3xl font-bold"
          >
            <FiX />
          </button>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mb-6">
            Contact Channel Partner
          </h2>

          <form className="space-y-4 text-left" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <div className="flex items-center gap-3 border rounded-xl px-4 py-2 bg-white">
                <FiUser className="text-blue-700" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full outline-none text-sm sm:text-base"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-3 border rounded-xl px-4 py-2 bg-white">
                <FiMail className="text-blue-700" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full outline-none text-sm sm:text-base"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center gap-3 border rounded-xl px-4 py-2 bg-white">
                <FiPhone className="text-blue-700" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full outline-none text-sm sm:text-base"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}

export default ContactFormModal;
