import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 page-notfound">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <h2 className="text-3xl text-gray-600 mb-6">Sorry! the page you requested was not found.</h2>
        
        <Button type="button" className=""><a href="/" className="">Back to Home</a></Button>
      </div>
    </div>
  );
};
