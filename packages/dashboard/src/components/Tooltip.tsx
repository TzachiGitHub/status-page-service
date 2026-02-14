import { useState, useRef, useEffect, type ReactNode } from 'react';
import { tooltipDefinitions } from '../data/tooltips';

interface TooltipProps {
  term: string;
  children: ReactNode;
}

export function Tooltip({ term, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [above, setAbove] = useState(true);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const definition = tooltipDefinitions[term.toLowerCase()];

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      setAbove(spaceAbove > 120);
    }
  }, [visible]);

  if (!definition) {
    return <>{children}</>;
  }

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="border-b border-dotted border-gray-400 cursor-help">{children}</span>
      {visible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-72 px-3 py-2 text-sm text-gray-100 bg-gray-900 rounded-lg shadow-xl ${
            above ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="font-semibold text-white mb-1">{definition.term}</div>
          <div className="text-gray-300 leading-relaxed">{definition.definition}</div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 ${
              above ? 'top-full' : 'bottom-full'
            }`}
            style={
              above
                ? {
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #111827',
                  }
                : {
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '6px solid #111827',
                  }
            }
          />
        </div>
      )}
    </span>
  );
}
