const months: string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);

  // Extract day, month, and year
  const day: string = String(date.getDate()).padStart(2, "0");
  const month: string = months[date.getMonth()];
  const year: number = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  } else {
    return text;
  }
}

export function getDateAndMonth(timestamp: string): string {
  const date = new Date(timestamp);

  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

export function checkToken() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("jwt");
    if (!token) {
      return null;
    } else {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    }
  }
}


export const formatTime = (timestamp:any) => {
  const dateObj = new Date(timestamp);

  // Format time as HH:MM AM/PM (e.g., 07:19 AM)
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);

  return formattedTime
};

export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}