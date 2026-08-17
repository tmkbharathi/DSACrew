import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, MinusCircle, Grid } from 'lucide-react';

export const CompletionMatrix: React.FC = () => {
  const { activeRoom } = useApp();

  if (!activeRoom || activeRoom.dailyProblems.length === 0) return null;

  const problems = activeRoom.dailyProblems.slice(0, 5); // Show latest 5 problems

  return (
    <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-lg text-white">Daily Problem Completion Grid</h3>
        </div>
        <span className="text-xs text-slate-400">Track who finished which problem</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 min-w-[150px]">Member</th>
              {problems.map((prob) => (
                <th key={prob.id} className="py-3 px-3 text-center min-w-[120px]">
                  <div className="font-semibold text-slate-200 truncate max-w-[120px]">{prob.title}</div>
                  <div className="text-[9px] text-slate-500 font-normal">{prob.date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {activeRoom.members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-slate-200">{member.name}</span>
                  </div>
                </td>

                {problems.map((prob) => {
                  const isSolved = prob.submissions.some((s) => s.userId === member.id);
                  return (
                    <td key={prob.id} className="py-3 px-3 text-center">
                      {isSolved ? (
                        <div className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 p-1 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center text-slate-700">
                          <MinusCircle className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
