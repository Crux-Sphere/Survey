import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend,
} from "recharts";
import { twMerge } from "tailwind-merge";

function ChartCard({
  data,
  xName,
  yName,
  className,
  title
}: {
  data: any;
  xName: string;
  yName: string;
  title:String;
  className?: string;
}) {
  return (
    <div className={twMerge(`h-[450px] w-full flex flex-col rounded-lg border-2  gap-8 bg-white px-4 pt-4`,className)}>
      <h1 className="text-xl font-bold">{title}</h1>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -10, bottom: 60 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            height={70}
            dataKey={xName}
            axisLine={false}
            tick={{ fontSize: 12, textAnchor: "middle", dy: 10 }}
            angle={0}
            interval={0}
            tickFormatter={value => value && value.length > 16 ? value.slice(0, 16) + '...' : value}
          />
          <YAxis axisLine={false} tick={{ fontSize: 12 }} />
          <Tooltip cursor={false} />
          <Bar dataKey={yName} fill="#FF8437" barSize={30} name={yName} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartCard;
