"use client";

import * as React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  XAxis,
  YAxis,
  Line,
} from "recharts";

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

export function ChartPie({ data, title }) {
  const chart_data = Object.entries(data)
    .filter(([name]) => name !== "total")
    .map(([name, value]) => ({
      name,
      value,
    }));

  return (
    <div className="w-full max-w-[500px] h-[300px] bg-white rounded-md shadow">
      <div className="flex justify-between">
        <span className=" p-1">{title}</span>
        <span className="bg-gray-100 p-1 rounded">
          Toplam: {data.total}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chart_data}
            dataKey="value"
            nameKey="name"
            label={true}
            innerRadius="50%"
          >
            {chart_data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              value,
              TypeTR[name as keyof typeof TypeTR] ?? name,
            ]}
          />
          <Legend formatter={(name) => TypeTR[name] ?? name}></Legend>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function getDays(s, e) {
  const arr = [];
  let d = new Date(s);
  while (d <= new Date(e)) {
    arr.push(d.toISOString().substring(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return arr;
}

export function ChartLine({ startDate, endDate, option, data }) {
  let chart_data;

  if (option === "daily") {
    chart_data = data.orders.slice().reverse().map((o) => ({
      name: o.created_at.slice(11, 19),
      value: parseFloat(o.amount) || 0,
    }));
  } else{
    const incomeByDay = data.orders.reduce((acc, o) => {
      const day = o.created_at.slice(0, 10);
      const amt = parseFloat(o.amount) || 0;
      acc[day] = (acc[day] || 0) + amt;
      return acc;
    }, {});

    chart_data = getDays(startDate, endDate).map((date) => ({
      name: date,
      value: incomeByDay[date] ?? 0,
    }));
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chart_data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={2}
          dot={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
