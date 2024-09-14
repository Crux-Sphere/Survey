"use client"

import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import Navbar from "@/components/ui/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  return (
    <main className="flex flex-col w-screen h-screen justify-center items-center bg-gradient-to-r from-black to-primary-300">
      {/* <ButtonFilled className="m-2" onClick={()=>router.push("/admin/surveys")}>Go to admin</ButtonFilled> */}
      <ButtonFilled className="m-2 bg-yellow-500 text-black" onClick={()=>router.push("/login")}>Login Screen</ButtonFilled>
    </main>
  );
}
