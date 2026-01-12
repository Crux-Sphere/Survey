"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loginUser,
  forgotPassword,
  loginAdmin,
} from "@/networks/auth_networks";
import ReactModal from "react-modal";
import toast, { Toaster } from "react-hot-toast";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import { checkToken } from "@/utils/common_functions";

ReactModal.setAppElement("#main");

export default function login() {
  const [Email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading,setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [see, setSee] = useState<boolean>(false);

  useEffect(() => {
    const token = checkToken();
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = () => {
    setLoading(true);
    loginAdmin({ email: Email, password: password })
      .then((res) => {
        if (res.success) {
          toast.success(res.message);
          localStorage.setItem("token", res.token);
          router.push("/admin");
          console.log(res)
        } else {
          console.log("res ----->", res);   
          if (res.error) {
            toast.error(res.error.message);
          } else {
            toast.error("Invalid credentials or unauthorized user");
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false)
        toast.error("Failed to Login as Admin");
      });
  };

  const handleForgotPassword = async (email: string) => {
    console.log("Forgot Password for Email:", email);

    const res = forgotPassword({ email });
    toast.promise(res, {
      loading: "Sending email to reset password...",
      success: "Email sent successfully.",
      error: (err) => err.message || "Failed to send email.",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex items-center justify-between min-h-screen bg-primary-50">
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
            className="py-2 px-4 bg-primary-300 text-white rounded-md hover:bg-blue-600"
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
      <div className="relative h-screen flex flex-col items-center justify-center bg-[url('/images/semi-circle.png')] bg-cover bg-center w-[55%]">
        <img src="/images/map.png" className="h-[450px] " />
        <h1 className="absolute bottom-8 left-4 w-[200px] text-[30px] text-white font-bold">
          BHARAT DEMOGRAPHIC RESEARCH
        </h1>
      </div>

      <div
        id="main"
        className="relative bg-white flex flex-col justify-center items-center border rounded-[20px] shadow-lg p-12 min-h-[600px] w-full max-w-[450px] mr-16"
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-center text-[25px] font-semibold">
            WELCOME BACK
          </h2>
          <h2 className="text-center text-xl font-semibold mb-6">Login</h2>
        </div>
        <div className="w-full">
          <div className="mb-4">
            <input
              type="text"
              value={Email}
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[13px] px-6 py-4 mt-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus:outline-none focus:ring focus:ring-primary-50"
              required
            />
          </div>
          <div className="mb-4 flex pr-2 gap-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white rounded-[13px] overflow-hidden focus:ring focus:ring-primary-50">
            <input
              type={see ? "text" : "password"}
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 h-full focus:outline-none"
              required
            />
            <img
              onClick={() => setSee(!see)}
              src="/images/eye.png"
              className="w-[25px]  object-contain cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <a
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer text-sm hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <ButtonFilled
            loading={loading} 
            onClick={handleSubmit}
            className="w-full py-2 bg-orange-500 text-white  hover:bg-orange-600"
          >
            Login
          </ButtonFilled>
        </div>
      </div>
    </div>
  );
}
