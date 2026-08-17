import React from 'react';
import { useApp } from '../../context/AppContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const { activeRoom } = useApp();

  if (!activeRoom || activeRoom.dailyProblems.length === 0) return null;

  // 1. Difficulty distribution
  const easyCount = activeRoom.dailyProblems.filter((p) => p.difficulty === 'Easy').length;
  const medCount = activeRoom.dailyProblems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = activeRoom.dailyProblems.filter((p) => p.difficulty === 'Hard').length;

  const difficultyData = [
    { name: 'Easy', value: easyCount, color: '#4ade80' },
    { name: 'Medium', value: medCount, color: '#eab308' },
    { name: 'Hard', value: hardCount, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  // 2. Daily completion trends per member
  const memberTrendData = activeRoom.members.map((m) => ({
    name: m.name.split(' ')[0],
    solved: m.solvedCount,
    points: m.points,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Difficulty Breakdown Pie Chart */}
      <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#3d4a3e] pb-3">
          <PieIcon className="w-4 h-4 text-[#4ade80]" />
          <h4 className="font-bold text-sm text-white font-sans">Problem Difficulty Distribution</h4>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#101418', borderColor: '#3d4a3e', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-mono font-semibold">
          <div className="flex items-center gap-1 text-[#4ade80]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" /> Easy ({easyCount})
          </div>
          <div className="flex items-center gap-1 text-[#eab308]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> Medium ({medCount})
          </div>
          <div className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hard ({hardCount})
          </div>
        </div>
      </div>

      {/* Member Activity Bar Chart */}
      <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#3d4a3e] pb-3">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-sm text-white font-sans">Total Solved Problems by Member</h4>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262a2f" />
              <XAxis dataKey="name" stroke="#869486" fontSize={11} />
              <YAxis stroke="#869486" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#101418', borderColor: '#3d4a3e', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="solved" fill="#4ade80" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
