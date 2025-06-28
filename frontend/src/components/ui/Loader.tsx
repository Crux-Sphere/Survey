import { PropagateLoader} from "react-spinners"
import { twMerge } from "tailwind-merge"

interface props{
    className?:string
}
function Loader({className}:props) {
  return (
    <div className={twMerge(`fixed top-0 left-0 bg-black/60 h-screen w-screen flex justify-center items-center overflow-hidden z-50`,className)}>
      <div className="flex flex-col items-center gap-10">
        <PropagateLoader speedMultiplier={1.25} color="#FF8437"/>
        <h3 className="text-white font-semibold">Loading, please wait...</h3>
      </div>
    </div>
  )
}

export default Loader