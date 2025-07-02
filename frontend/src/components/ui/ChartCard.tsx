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

type Props = {
  data: any[];
  xName: string;
  yName: string;
  title: string;
  className?: string;
  colors?: string[];
};

function ChartCard({ data, xName, yName, title, className, colors }: Props) {
  const categories = [...new Set(data.map((item) => item[xName]))];

  return (
    <div
      className={twMerge(
        `h-[450px] w-full flex flex-col rounded-lg border-2 gap-4 bg-white px-4 pt-4 pb-2`,
        className
      )}
    >
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex-1">
        <ResponsiveContainer width="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: -10, bottom:0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              height={70}
              dataKey={xName}
              axisLine={false}
              tick={{ fontSize: 12, textAnchor: "middle", dy: 10 }}
              angle={0}
              interval={0}
              tickFormatter={(value) =>
                value && value.length > 16 ? value.slice(0, 16) + "..." : value
              }
            />
            <YAxis axisLine={false} tick={{ fontSize: 12 }} />
            <Tooltip cursor={false} />
            <Legend verticalAlign="middle" align="right" layout="vertical" />
            {categories.map((category, index) => {
              const color =
                colors && colors.length > index ? colors[index] : "#FF8437";
              return (
                <Bar
                  key={category}
                  dataKey={(entry: any) =>
                    entry[xName] === category ? entry[yName] : 0
                  }
                  name={category}
                  fill={color}
                  barSize={30}
                  isAnimationActive={false}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartCard;
