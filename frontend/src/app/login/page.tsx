"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser , forgotPassword } from "@/networks/auth_networks";
import ReactModal from "react-modal";
import toast, { Toaster } from "react-hot-toast";

ReactModal.setAppElement('#main');


export default function login() {
  const [Email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkToken = () => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      router.push("/admin/surveys");
    }
  };
  checkToken();
  },[router]);      


  const handleSubmit = () => {
    loginUser({ email: Email, password:password }).then(  (res) => {
      localStorage.setItem("jwt_token", res.token);
      if (res.success) {
        toast.success(res.message);
        router.push("/admin/surveys");
      } else {
        console.log(res);
        toast.error(res.message);
      }
    });
  };

  const handleForgotPassword = async (email: string) => {
    console.log("Forgot Password for Email:", email);
  
    const res = forgotPassword({ email });
    toast.promise(
      res,
      {
        loading: "Sending email to reset password...",
        success: "Email sent successfully.",
        error: (err) => err.message || "Failed to send email.",
      }
    );
    setIsModalOpen(false);
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Forgot Password"
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl mb-4 text-center font-semibold">
          Forgot Password
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Enter your email</label>
          <input
            type="email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
        </div>
        <div className="flex justify-center">
          <button
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => handleForgotPassword(Email)}
          >
            Submit
          </button>
          <button
            className="py-2 px-4 ml-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </ReactModal>




      <div id="main" className="relative bg-blue-50 rounded-lg shadow-lg p-10 w-full max-w-md">
        <h2 className="text-center text-xl font-semibold text-orange-500 mb-6">
          Survey Login
        </h2>
        <div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="text"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <a
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Login
          </button>
        </div>
        <div className="text-center mt-4">
          <span>Don't have an account? </span>
          <a
            onClick={() => router.push("/signup")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Register Now
          </a>
        </div>
      </div>
    </div>
  );
}
