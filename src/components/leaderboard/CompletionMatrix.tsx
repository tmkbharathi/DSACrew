import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, MinusCircle, Grid } from 'lucide-react';

export const CompletionMatrix: React.FC = () => {
  const { activeRoom } = useApp();

  if (!activeRoom || activeRoom.dailyProblems.length === 0) return null;

  const problems = activeRoom.dailyProblems.slice(0, 5);

  return (
    <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-4 sm:p-6 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-[#4ade80]" />
          <h3 className="font-bold text-base sm:text-lg text-white font-sans">Daily Problem Completion Grid</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">Track who finished which problem</span>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead>
            <tr className="border-b border-[#3d4a3e] bg-[#101418]/40 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-4 min-w-[130px]">Member</th>
              {problems.map((prob) => (
                <th key={prob.id} className="py-3 px-3 sm:px-4 text-center min-w-[100px]">
                  <div className="font-semibold text-slate-200 truncate max-w-[110px]">{prob.title}</div>
                  <div className="text-[9px] text-slate-500 font-mono font-normal">{prob.date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3d4a3e]/60">
            {activeRoom.members.map((member) => (
              <tr key={member.id} className="hover:bg-[#31353a]/40 transition-colors">
                <td className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-2">
                    <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#3d4a3e]" />
                    <span className="text-xs font-semibold text-slate-200 truncate">{member.name}</span>
                  </div>
                </td>

                {problems.map((prob) => {
                  const isSolved = prob.submissions.some((s) => s.userId === member.id);
                  return (
                    <td key={prob.id} className="py-3 px-3 sm:px-4 text-center">
                      {isSolved ? (
                        <div className="inline-flex items-center justify-center bg-[#4ade80]/10 text-[#4ade80] p-1 rounded-full border border-[#4ade80]/30">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center text-slate-700">
                          <MinusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
