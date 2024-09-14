import { useRouter } from "next/navigation";

export function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    const months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Extract day, month, and year
    const day: string = String(date.getDate()).padStart(2, '0'); 
    const month: string = months[date.getMonth()];
    const year: number = date.getFullYear();
    return `${day}-${month}-${year}`;
}




export function checkToken (){
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      return null;
    }
    else {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
    }   
}