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
    { name: 'Easy', value: easyCount, color: '#3fb950' },
    { name: 'Medium', value: medCount, color: '#d29922' },
    { name: 'Hard', value: hardCount, color: '#f85149' },
  ].filter((d) => d.value > 0);

  // 2. Daily completion trends per member
  const memberTrendData = activeRoom.members.map((m) => ({
    name: m.name.split(' ')[0],
    solved: m.roomSolvedCount ?? m.solvedCount ?? 0,
    points: m.points,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Difficulty Breakdown Pie Chart */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#30363d] pb-3">
          <PieIcon className="w-4 h-4 text-[#3fb950]" />
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
                contentStyle={{ backgroundColor: '#0d1117', borderColor: '#30363d', borderRadius: '8px', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-mono font-semibold">
          <div className="flex items-center gap-1 text-[#3fb950]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" /> Easy ({easyCount})
          </div>
          <div className="flex items-center gap-1 text-[#d29922]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]" /> Medium ({medCount})
          </div>
          <div className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hard ({hardCount})
          </div>
        </div>
      </div>

      {/* Member Activity Bar Chart */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 border-b border-[#30363d] pb-3">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-sm text-white font-sans">Total Solved Problems by Member</h4>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="name" stroke="#8b949e" fontSize={11} />
              <YAxis stroke="#8b949e" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1117', borderColor: '#30363d', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="solved" fill="#2ea043" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
