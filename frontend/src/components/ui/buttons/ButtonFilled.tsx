import React from 'react'
import { PropagateLoader,PuffLoader } from 'react-spinners';
import { twMerge } from 'tailwind-merge'

interface LayoutProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className? : string;
  loading? : boolean;
  view? : String
}

function ButtonFilled({children, className,onClick,loading, view,...props} : LayoutProps) {
  return (
    <button {...props} onClick={onClick} className={twMerge(`${view}`,className)}>
      {loading ? <PuffLoader speedMultiplier={1.25} color="#FFFFFF" size={26}/> : children}
    </button>
  )
}

export default ButtonFilled