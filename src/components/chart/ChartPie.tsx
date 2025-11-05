"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = ["#EB75D9", "#EB8175", "#EB7593", "#CE75EB", "#DA91ED", "#525B57", "#DF5ADA", "#D95F7E"];  

export enum TypeTR {
    courier = "Kurye",
    restaurant = "Restoran",
    admin = "Admin",
    dealer = "Bayi",
}

export default function ChartPie( { name }: { name:  string[] } ){
    const chart_data = Object.entries(
    name.reduce((acc: any, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return(
    <div className="w-full max-w-[500px] h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chart_data}
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${TypeTR[name] ?? name} - ${value}`}
          >
            {chart_data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}