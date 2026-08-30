import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { sound } from '../../utils/sound';

interface BullsCowsKeyboardProps {
  onKeyPress: (char: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  letterStatuses: Map<string, 'BULL' | 'COW' | 'ABSENT'>;
  disabled?: boolean;
}

const ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

export const BullsCowsKeyboard: React.FC<BullsCowsKeyboardProps> = ({
  onKeyPress,
  onEnter,
  onBackspace,
  letterStatuses,
  disabled = false
}) => {
  const getKeyStyle = (char: string) => {
    const status = letterStatuses.get(char);

    if (status === 'BULL') {
      return 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30';
    }
    if (status === 'COW') {
      return 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30';
    }
    if (status === 'ABSENT') {
      return 'bg-slate-900/60 text-slate-500 border-slate-800 opacity-60';
    }
    return 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 active:scale-95';
  };

  const getStatusBadge = (char: string) => {
    const status = letterStatuses.get(char);
    if (status === 'BULL') return <span className="text-[9px] block leading-none font-bold">🐂</span>;
    if (status === 'COW') return <span className="text-[9px] block leading-none font-bold">🐄</span>;
    if (status === 'ABSENT') return <span className="text-[9px] block leading-none font-bold text-slate-500">✕</span>;
    return null;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-1.5 p-2 select-none">
      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {ROW_1.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => {
              sound.playCardClick();
              onKeyPress(char);
            }}
            className={`flex-1 min-w-[28px] max-w-[46px] h-12 sm:h-14 rounded-xl border flex flex-col items-center justify-center font-bold text-sm sm:text-base transition-all ${getKeyStyle(
              char
            )}`}
          >
            <span>{char}</span>
            {getStatusBadge(char)}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 px-3 sm:px-4">
        {ROW_2.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => {
              sound.playCardClick();
              onKeyPress(char);
            }}
            className={`flex-1 min-w-[28px] max-w-[46px] h-12 sm:h-14 rounded-xl border flex flex-col items-center justify-center font-bold text-sm sm:text-base transition-all ${getKeyStyle(
              char
            )}`}
          >
            <span>{char}</span>
            {getStatusBadge(char)}
          </button>
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {/* Enter Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            sound.playClick();
            onEnter();
          }}
          className="px-2.5 sm:px-4 h-12 sm:h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm border border-emerald-300 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-1 transition-all"
        >
          <CornerDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">GUESS</span>
        </button>

        {ROW_3.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => {
              sound.playCardClick();
              onKeyPress(char);
            }}
            className={`flex-1 min-w-[28px] max-w-[46px] h-12 sm:h-14 rounded-xl border flex flex-col items-center justify-center font-bold text-sm sm:text-base transition-all ${getKeyStyle(
              char
            )}`}
          >
            <span>{char}</span>
            {getStatusBadge(char)}
          </button>
        ))}

        {/* Backspace Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            sound.playCardClick();
            onBackspace();
          }}
          className="px-2.5 sm:px-4 h-12 sm:h-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 flex items-center justify-center transition-all"
        >
          <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
