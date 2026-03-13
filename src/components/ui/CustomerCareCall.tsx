import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function CustomerCareCall() {
  const [showInput, setShowInput] = useState(false);
  const [phone, setPhone] = useState("");

  const handleSend = () => {
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    console.log("Call request for:", phone);

    // Success message
    toast.success("Richa AI will call you in a few minutes");

    setPhone("");
    setShowInput(false);
  };

  return (
    <div className="mb-3 text-center px-4">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Contact Customer Care
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-3 rounded-lg w-full"
          />

          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Call Me
          </button>
        </div>
      )}
    </div>
  );
}