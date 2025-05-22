import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { twMerge } from "tailwind-merge";

const COLORS = [
  "#FF8437", "#00C49F", "#FFBB28", "#0088FE", "#FF6666", "#AA00FF", "#00BFFF",
];

function PieCard({
  data,
  dataKey,
  nameKey,
  className,
  title,
}: {
  data: any[];
  dataKey: string;
  nameKey: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={twMerge(`h-[450px] w-full flex flex-col rounded-lg border-2  gap-8 bg-white px-4 pt-4`, className)}>
      <h1 className="text-xl font-bold">{title}</h1>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#FF8437"
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieCard;
