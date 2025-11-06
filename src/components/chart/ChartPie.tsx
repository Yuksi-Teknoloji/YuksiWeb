"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#EB75D9",
  "#EB8175",
  "#EB7593",
  "#CE75EB",
  "#DA91ED",
  "#525B57",
  "#DF5ADA",
  "#D95F7E",
];

export enum TypeTR {
  couriers = "Kurye",
  restaurants = "Restoran",
  admins = "Admin",
  dealers = "Bayi",
}

export default function ChartPie({ data, title }) {
  const chart_data = Object.entries(data)
    .filter(([name]) => name !== "total")
    .map(([name, value]) => ({
      name,
      value,
    }));

  console.log(data);

  return (
    <div className="w-full max-w-[500px] h-[300px] bg-white rounded-md shadow p-10">
      <div className="flex justify-between">
        <span className="text-black">{title}</span>
        <span className="text-black bg-gray-100 p-1 rounded">Toplam: {data.total}</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chart_data}
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${TypeTR[name] ?? name} - ${value}`}
            innerRadius="50%"
          >
            {chart_data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
