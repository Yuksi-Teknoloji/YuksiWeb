"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip,
  LineChart,
  XAxis,
  YAxis,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

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
    chart_data =
      data.orders.length == 0
        ? [{ name: "00:00", value: 0 }]
        : data.orders
            .slice()
            .reverse()
            .map((o) => ({
              name: o.created_at.slice(11, 19) || "null",
              value: parseFloat(o.amount) || 0,
            }));
  } else {
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
        <Tooltip formatter={(value, name) => [value + " tl", name]} />
        <CartesianGrid />
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

export function ChartPie({ data, title }) {
  const orderByStatus = data.reduce((acc, o) => {
      const status = o.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  
  const chart_data = Object.entries(orderByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="w-full max-w-[500px] h-[300px] bg-white rounded-md shadow">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chart_data}
            dataKey="value"
            nameKey="name"
            label={true}
            innerRadius="50%"
          >
          </Pie>
          <Tooltip
          />
          <Legend></Legend>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
