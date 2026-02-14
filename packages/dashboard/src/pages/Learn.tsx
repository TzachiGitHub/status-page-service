import { useState } from 'react';
import { learnTopics, type LearnTopic } from '../data/learnContent';
import { Tooltip } from '../components/Tooltip';

function wrapTooltipTerms(text: string): React.ReactNode[] {
  const termsToWrap = [
    'SLA', 'SLO', 'SLI', 'MTTR', 'MTTD', 'MTBF', 'DNS', 'SSL', 'TLS',
    'TCP', 'UDP', 'ICMP', 'SSE', 'WebSocket', 'webhook', 'uptime', 'downtime',
    'postmortem', 'runbook', 'on-call', 'circuit breaker', 'rate limiting',
    'P50', 'P95', 'P99', 'latency', 'throughput',
  ];

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let earliestTerm = '';

    for (const term of termsToWrap) {
      const idx = remaining.toLowerCase().indexOf(term.toLowerCase());
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        earliestTerm = term;
      }
    }

    if (earliest === -1) {
      parts.push(remaining);
      break;
    }

    if (earliest > 0) {
      parts.push(remaining.slice(0, earliest));
    }

    const matched = remaining.slice(earliest, earliest + earliestTerm.length);
    parts.push(
      <Tooltip key={key++} term={earliestTerm.toLowerCase()}>
        {matched}
      </Tooltip>
    );

    remaining = remaining.slice(earliest + earliestTerm.length);
  }

  return parts;
}

function TopicCard({
  topic,
  isExpanded,
  onToggle,
}: {
  topic: LearnTopic;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-5 flex items-start gap-4 hover:bg-gray-50 transition-colors"
      >
        <span className="text-3xl flex-shrink-0 mt-0.5">{topic.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{topic.summary}</p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="mt-5 space-y-6">
            {topic.sections.map((section, i) => (
              <div key={i}>
                <h4 className="text-base font-semibold text-gray-800 mb-2">{section.heading}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {wrapTooltipTerms(section.content)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Key Takeaways
            </h4>
            <ul className="space-y-1.5">
              {topic.keyTakeaways.map((takeaway, i) => (
                <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                  <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
                  <span>{wrapTooltipTerms(takeaway)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function Learn() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Learn</h1>
        <p className="text-gray-500 mt-2">
          Everything you need to know about status pages, uptime monitoring, and incident
          management. Hover over highlighted terms for quick definitions.
        </p>
      </div>

      <div className="space-y-3">
        {learnTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isExpanded={expandedId === topic.id}
            onToggle={() => setExpandedId(expandedId === topic.id ? null : topic.id)}
          />
        ))}
      </div>
    </div>
  );
}
