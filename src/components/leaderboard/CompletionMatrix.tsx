import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, MinusCircle, Grid } from 'lucide-react';

export const CompletionMatrix: React.FC = () => {
  const { activeRoom } = useApp();

  if (!activeRoom || activeRoom.dailyProblems.length === 0) return null;

  const problems = [...activeRoom.dailyProblems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-6 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-[#3fb950]" />
          <h3 className="font-bold text-base sm:text-lg text-white font-sans">Daily Problem Completion Grid</h3>
        </div>
        <span className="text-xs text-slate-400 font-sans hidden sm:inline">Track who finished which problem</span>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead>
            <tr className="border-b border-[#30363d] bg-[#0d1117] text-xs font-medium text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-4 min-w-[130px]">Member</th>
              {problems.map((prob) => (
                <th key={prob.id} className="py-3 px-3 sm:px-4 text-center min-w-[100px]">
                  <div className="font-semibold text-slate-200 truncate max-w-[110px] font-sans">{prob.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono font-normal">{prob.date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]/60 font-sans">
            {activeRoom.members.map((member) => (
              <tr key={member.id} className="hover:bg-[#21262d]/40 transition-colors">
                <td className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-2">
                    <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#30363d]" />
                    <span className="text-xs font-semibold text-slate-200 truncate">{member.name}</span>
                  </div>
                </td>

                {problems.map((prob) => {
                  const isSolved = prob.submissions.some((s) => s.userId === member.id);
                  return (
                    <td key={prob.id} className="py-3 px-3 sm:px-4 text-center">
                      {isSolved ? (
                        <div className="inline-flex items-center justify-center bg-[#2ea043]/15 text-[#3fb950] p-1 rounded-full border border-[#2ea043]/30">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center text-slate-600">
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
