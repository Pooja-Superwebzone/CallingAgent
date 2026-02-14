import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import service from "../../api/axios";

export default function ChannelPartnerForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    applicationForm: null,
    agreement: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!email) {
      toast.error("Email is required in URL parameter");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [email, navigate]);

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type (should be .docx, .doc, or .pdf)
      const validExtensions = [".docx", ".doc", ".pdf"];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
      if (!validExtensions.includes(fileExtension)) {
        toast.error("Please upload a Word document (.docx, .doc) or PDF (.pdf)");
        return;
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setUploadedFiles((prev) => ({ ...prev, [fileType]: file }));
    }
  };

  const downloadFile = async (fileName) => {
    try {
      // Files are in public folder, accessible directly
      const fileUrl = `/${fileName}`;
      
      // Fetch the file
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloading ${fileName}...`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(`Failed to download ${fileName}. Please try again.`);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!email) {
      errs.email = "Email is required";
    }
    if (!uploadedFiles.applicationForm) {
      errs.applicationForm = "Please upload Application Form";
    }
    if (!uploadedFiles.agreement) {
      errs.agreement = "Please upload Agreement";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please upload both files");
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add email
      submitData.append("email", email);

      // Add files
      if (uploadedFiles.applicationForm) {
        submitData.append("application_form", uploadedFiles.applicationForm);
      }
      if (uploadedFiles.agreement) {
        submitData.append("agreement", uploadedFiles.agreement);
      }

      // Submit to API
      const response = await service.post("channel-partner", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Channel Partner form submitted successfully!");
      setUploadedFiles({
        applicationForm: null,
        agreement: null,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 max-w-md">
            <p className="font-semibold mb-2">Email Required</p>
            <p className="text-sm">Please provide an email parameter in the URL (?email=your@email.com)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Become Channel Partner</h1>
          <p className="text-gray-600">Registration Form</p>
        </div>

        {/* Download Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Download Agreement Forms</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Instructions:</p>
                <p className="text-sm text-blue-600">
                  Please download both forms below. Fill them out completely with all required information, 
                  sign them, and then upload the filled forms in the upload section below. You can upload 
                  the forms as Word documents (.doc, .docx) or PDF files (.pdf).
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Application Form */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Application Form for Franchisee
                </h3>
                <button
                  onClick={() => downloadFile("Application Form for Franchisee.docx")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Agreement Form */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Franchisee Agreement
                </h3>
                <button
                  onClick={() => downloadFile("Franchisee Agreement.docx")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Filled Forms</h2>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Note:</p>
                <p className="text-sm text-green-600">
                  After filling out both forms, please upload them here. You can upload files in Word format 
                  (.doc, .docx) or PDF format (.pdf). Maximum file size is 10MB per file. Both files are required 
                  to submit the form.
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Form <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".doc,.docx,.pdf"
                      onChange={(e) => handleFileChange(e, "applicationForm")}
                      className="hidden"
                      id="applicationForm"
                    />
                    <label
                      htmlFor="applicationForm"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      {uploadedFiles.applicationForm ? (
                        <div className="text-center">
                          <svg
                            className="w-12 h-12 text-green-500 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm text-gray-700 font-medium">
                            {uploadedFiles.applicationForm.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">.doc, .docx or .pdf files</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.applicationForm && (
                    <p className="text-red-500 text-xs mt-1">{errors.applicationForm}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agreement <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".doc,.docx,.pdf"
                      onChange={(e) => handleFileChange(e, "agreement")}
                      className="hidden"
                      id="agreement"
                    />
                    <label
                      htmlFor="agreement"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      {uploadedFiles.agreement ? (
                        <div className="text-center">
                          <svg
                            className="w-12 h-12 text-green-500 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm text-gray-700 font-medium">
                            {uploadedFiles.agreement.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">.doc, .docx or .pdf files</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.agreement && <p className="text-red-500 text-xs mt-1">{errors.agreement}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Form"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
