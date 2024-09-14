"use client"
import { useRouter } from "next/navigation"
import ButtonBordered from "./buttons/ButtonBordered"
import { useEffect, useState } from "react"
import { checkToken } from "@/utils/common_functions"


interface UserData {
  id:string;
  email: string;
  role: string;
}

function Navbar() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  useEffect(() => {
    const payload = checkToken();
    console.log(payload);
    if(payload){
    setUserData(checkToken());
    }else{
      router.push("/login");
    }

  }, [router])
  return (
    <nav className="z-50 relative flex justify-between px-8 py-[18px] shadow-md">
        <h1 onClick={()=>router.push("/")} className="font-bold text-primary-300 text-2xl cursor-pointer">SURVEY LOGO</h1>
        <div className="flex gap-9 justify-center items-center">
            <ButtonBordered className="text-[14px] font-semibold">Notifications</ButtonBordered>
            <ButtonBordered onClick={()=>{
              localStorage.removeItem('jwt_token');
              router.push("/login");
            }} className="text-[14px] font-semibold text-red-500">Logout</ButtonBordered>
            {userData && (
              <h3 className="text-primary-300 text-[12px]">Welcome <span className="font-semibold text-[16px]">{userData.email}</span></h3>
            )}
        </div>
    </nav>
  )
}

export default Navbar