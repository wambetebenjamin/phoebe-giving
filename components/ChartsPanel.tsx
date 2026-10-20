"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GREEN = "#18a577";
const BLUE = "#4c7bcb";
const TEAL = "#20c997";
const CYAN = "#17a2b8";
const INK = "#1f2a37";

type Monthly = { month: string; total: number };
type FundBar = { fund: string; total: number };
type PieSlice = { name: string; value: number };
type Weekly = { week: string; total: number };

export default function ChartsPanel({
  monthly,
  byFund,
  pie,
  weekly,
}: {
  monthly: Monthly[];
  byFund: FundBar[];
  pie: PieSlice[];
  weekly: Weekly[];
}) {
  return (
    <div className="row">
      <div className="col-lg-6 mb-4">
        <div className="panel">
          <h3 className="h5">Monthly giving, 12 months</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid stroke="#e9eef5" />
                <XAxis dataKey="month" stroke={INK} />
                <YAxis stroke={INK} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total (KES)" stroke={BLUE} strokeWidth={2} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="col-lg-6 mb-4">
        <div className="panel">
          <h3 className="h5">Giving by fund</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byFund}>
                <CartesianGrid stroke="#e9eef5" />
                <XAxis dataKey="fund" stroke={INK} interval={0} tick={{ fontSize: 11 }} />
                <YAxis stroke={INK} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total (KES)" fill={GREEN} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="col-lg-5 mb-4">
        <div className="panel">
          <h3 className="h5">One time and recurring givers</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" outerRadius={90} isAnimationActive>
                  {pie.map((entry, index) => (
                    <Cell key={entry.name} fill={index === 0 ? CYAN : TEAL} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="col-lg-7 mb-4">
        <div className="panel">
          <h3 className="h5">Weekly giving trend, current quarter</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly}>
                <CartesianGrid stroke="#e9eef5" />
                <XAxis dataKey="week" stroke={INK} />
                <YAxis stroke={INK} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" name="Total (KES)" stroke={GREEN} fill={GREEN} fillOpacity={0.2} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
