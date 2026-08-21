import React from 'react';
import { useApp } from '../../context/AppContext';
import { Info, Key, Camera } from 'lucide-react';
import type { Room } from '../../types';

interface CurrentRoomCardProps {
  room: Room;
  onOpenRoomInfo: () => void;
  onOpenJoinCode: () => void;
  onEditLogo?: () => void;
}

export const CurrentRoomCard: React.FC<CurrentRoomCardProps> = ({
  room,
  onOpenRoomInfo,
  onOpenJoinCode,
  onEditLogo,
}) => {
  const { theme, currentUser } = useApp();
  const isIllustrative = theme === 'illustrative';

  // Compute room member solves and streak
  const members = room.members || [];
  const totalMembers = members.length;
  const solvedMembersCount = members.filter((m) => {
    if (m.id === currentUser.id) return currentUser.solvedToday;
    return m.solvedToday;
  }).length;

  // Compute room highest or average streak
  const maxStreak = Math.max(1, ...members.map((m) => m.streak || 0));
  const streakDisplay = `${maxStreak} ${maxStreak === 1 ? 'day' : 'days'}`;

  const isImageLogo =
    room.logoUrl &&
    (room.logoUrl.startsWith('http') ||
      room.logoUrl.startsWith('data:image') ||
      room.logoUrl.startsWith('/'));

  return (
    <div
      className={`w-full rounded-[13px] p-2.5 sm:p-3 border shadow-xs transition-all duration-200 select-none flex flex-col justify-between ${
        isIllustrative
          ? 'bg-white border-[#E8E3D8] text-[#1F2933]'
          : 'bg-[#181D23] border-[#2A3037] text-[#F2F4F1]'
      }`}
      style={{ minHeight: '108px', maxHeight: '118px' }}
    >
      {/* Top Section: Two-Column (Thumbnail + Room Details) */}
      <div className="flex items-center gap-2">
        {/* Left — Room Thumbnail (48x48px, rounded 9px) */}
        <div
          onClick={onEditLogo}
          className="group relative w-[48px] h-[48px] rounded-[9px] shrink-0 overflow-hidden cursor-pointer shadow-xs border transition-transform hover:scale-[1.03]"
          style={{
            borderColor: isIllustrative ? '#E8E3D8' : '#2A3037',
          }}
          title="Click to customize room thumbnail"
        >
          {isImageLogo ? (
            <img
              src={room.logoUrl}
              alt={room.name}
              className="w-full h-full object-cover rounded-[8px]"
            />
          ) : (
            <svg
              viewBox="0 0 48 48"
              className="w-full h-full object-cover"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sky Background */}
              <rect
                width="48"
                height="48"
                fill={isIllustrative ? '#F4EFE6' : '#1F262E'}
              />
              {/* Soft Sun */}
              <circle
                cx="36"
                cy="13"
                r="6.5"
                fill={isIllustrative ? '#FDE68A' : '#2E473B'}
                opacity="0.85"
              />
              {/* Rolling Hills */}
              <path
                d="M-3 48 C 10 32, 26 33, 51 48 Z"
                fill={isIllustrative ? '#CBE7D2' : '#243A2C'}
              />
              <path
                d="M-2 48 C 14 36, 32 37, 50 48 Z"
                fill={isIllustrative ? '#9FD4AD' : '#2E4C39'}
              />
              {/* Pine Trees */}
              <path
                d="M12 25 L8 34 L16 34 Z"
                fill={isIllustrative ? '#3E7652' : '#3F7D55'}
              />
              <path
                d="M12 20 L9 27 L15 27 Z"
                fill={isIllustrative ? '#4E8F65' : '#4E9969'}
              />
              <rect
                x="11.2"
                y="34"
                width="1.6"
                height="3.5"
                fill={isIllustrative ? '#8C6D53' : '#403328'}
              />

              <path
                d="M21 28 L18 35 L24 35 Z"
                fill={isIllustrative ? '#3E7652' : '#3F7D55'}
              />
              <path
                d="M21 24 L19 30 L23 30 Z"
                fill={isIllustrative ? '#569E70' : '#5C9F70'}
              />

              {/* Study Cabin / Camp */}
              <polygon
                points="34,26 27,37 41,37"
                fill={isIllustrative ? '#E07A5F' : '#A85D48'}
              />
              <polygon
                points="34,26 31,37 37,37"
                fill={isIllustrative ? '#FDFBF7' : '#2B2625'}
              />
              <rect
                x="33.2"
                y="32"
                width="1.6"
                height="5"
                fill={isIllustrative ? '#3D405B' : '#181D23'}
              />
            </svg>
          )}

          {/* Hover overlay with camera icon */}
          {onEditLogo && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Right — Room Details */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          {/* Label: CURRENT ROOM */}
          <span
            className={`text-[8.5px] font-semibold tracking-wider uppercase leading-none ${
              isIllustrative ? 'text-[#68736D]' : 'text-[#8E9892]'
            }`}
          >
            CURRENT ROOM
          </span>

          {/* Room Name: Geluvu Namade */}
          <h2
            className={`text-[13px] font-bold truncate leading-tight mt-1 ${
              isIllustrative ? 'text-[#1F2933]' : 'text-[#F2F4F1]'
            }`}
            title={room.name}
          >
            {room.name}
          </h2>

          {/* Room Meta: ● 3 / 3 · 1 day */}
          <div
            className={`text-[9.5px] flex items-center gap-1.5 mt-1 leading-none ${
              isIllustrative ? 'text-[#68736D]' : 'text-[#8E9892]'
            }`}
          >
            <span
              className={`text-[7px] ${
                isIllustrative ? 'text-[#3E7652]' : 'text-[#5C9F70]'
              }`}
            >
              ●
            </span>
            <span>
              {solvedMembersCount} / {totalMembers}
            </span>
            <span>·</span>
            <span>{streakDisplay}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Row: [ Room Info ] [ Join Code ] */}
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {/* Room Info Button (Secondary) */}
        <button
          type="button"
          onClick={onOpenRoomInfo}
          className={`h-[26px] rounded-[7px] px-2 flex items-center justify-center gap-1 text-[9px] font-medium border transition-colors cursor-pointer ${
            isIllustrative
              ? 'bg-[#F8F5EE] hover:bg-[#EFE9DC] text-[#1F2933] border-[#E8E3D8]'
              : 'bg-[#21272E] hover:bg-[#282F37] text-[#F2F4F1] border-[#2A3037]'
          }`}
          title="View Room Overview & Info"
        >
          <Info
            className={`w-3 h-3 shrink-0 ${
              isIllustrative ? 'text-[#68736D]' : 'text-[#8E9892]'
            }`}
          />
          <span className="truncate">Room Info</span>
        </button>

        {/* Join Code Button (Primary) */}
        <button
          type="button"
          onClick={onOpenJoinCode}
          className={`h-[26px] rounded-[7px] px-2 flex items-center justify-center gap-1 text-[9px] font-semibold text-white transition-colors cursor-pointer shadow-xs ${
            isIllustrative
              ? 'bg-[#3E7652] hover:bg-[#346344]'
              : 'bg-[#3F7D55] hover:bg-[#4E9969]'
          }`}
          title="View & Share Room Join Code"
        >
          <Key className="w-3 h-3 shrink-0 text-white" />
          <span className="truncate">Join Code</span>
        </button>
      </div>
    </div>
  );
};
