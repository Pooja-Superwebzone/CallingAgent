import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const Unauthorized = () => {

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 page-unauth">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6">🚫 You are not authorized to view this page.</h1>        
        <h2 className="text-3xl font-bold text-gray-600 mb-6">Please contact your manager/admin.</h2>    
        <Button type="button" className=""><a href="/" className="">Back to Home</a></Button>
      </div>
    </div>
  );
};
