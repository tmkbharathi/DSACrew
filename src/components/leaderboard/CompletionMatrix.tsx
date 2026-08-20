import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, MinusCircle, Grid } from 'lucide-react';

export const CompletionMatrix: React.FC = () => {
  const { activeRoom, theme } = useApp();
  const isIllustrative = theme === 'illustrative';

  if (!activeRoom || activeRoom.dailyProblems.length === 0) return null;

  const problems = [...activeRoom.dailyProblems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className={`rounded-2xl p-4 sm:p-6 space-y-4 shadow-md border ${
      isIllustrative ? 'bg-white border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Grid className={`w-4 h-4 sm:w-5 sm:h-5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
          <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
            Daily Problem Completion Grid
          </h3>
        </div>
        <span className={`text-xs font-sans hidden sm:inline ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
          Track who finished which problem
        </span>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead>
            <tr className={`border-b text-xs font-medium uppercase tracking-wider ${
              isIllustrative
                ? 'border-[#ede4d4] bg-[#fbf7ee] text-[#5c6b63]'
                : 'border-[#30363d] bg-[#0d1117] text-slate-400'
            }`}>
              <th className="py-3 px-3 sm:px-4 min-w-[130px]">Member</th>
              {problems.map((prob) => (
                <th key={prob.id} className="py-3 px-3 sm:px-4 text-center min-w-[100px]">
                  <div className={`font-semibold truncate max-w-[110px] font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>
                    {prob.title}
                  </div>
                  <div className={`text-[10px] font-mono font-normal ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`}>
                    {prob.date}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y font-sans ${isIllustrative ? 'divide-[#ede4d4]' : 'divide-[#30363d]/60'}`}>
            {activeRoom.members.map((member) => (
              <tr key={member.id} className={`transition-colors ${isIllustrative ? 'hover:bg-[#fbf7ee]' : 'hover:bg-[#21262d]/40'}`}>
                <td className="py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-2">
                    <img src={member.avatar} alt="" className={`w-6 h-6 rounded-full object-cover shrink-0 border ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`} />
                    <span className={`text-xs font-semibold truncate ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>{member.name}</span>
                  </div>
                </td>

                {problems.map((prob) => {
                  const isSolved = prob.submissions.some((s) => s.userId === member.id && s.status === 'Accepted');
                  return (
                    <td key={prob.id} className="py-3 px-3 sm:px-4 text-center">
                      {isSolved ? (
                        <div className={`inline-flex items-center justify-center p-1 rounded-full border ${
                          isIllustrative
                            ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                            : 'bg-[#2ea043]/15 text-[#3fb950] border-[#2ea043]/30'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      ) : (
                        <div className={`inline-flex items-center justify-center ${isIllustrative ? 'text-slate-300' : 'text-slate-600'}`}>
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
