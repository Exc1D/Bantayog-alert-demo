import { useState, useCallback, memo } from 'react';
import { getDisasterType } from '../../data/disasterTypes';

const ShareButton = memo(function ShareButton({ report, className = '' }) {
  const [sharing, setSharing] = useState(false);

  const handleShare = useCallback(async () => {
    const disasterType = getDisasterType(report.disaster?.type);
    const severity = report.disaster?.severity || 'minor';
    const status = report.verification?.status || 'pending';
    const municipality = report.location?.municipality || 'Unknown';
    const barangay = report.location?.barangay ? `, ${report.location.barangay}` : '';

    const text = `🚨 Bantayog Alert Report
${disasterType.icon} ${disasterType.label.toUpperCase()} (${severity.toUpperCase()})
📍 ${municipality}${barangay}
📊 Status: ${status.toUpperCase()}
${report.disaster?.description ? `\n${report.disaster.description.slice(0, 200)}` : ''}
${report.disaster?.waterLevel ? `\n💧 Water Level: ${report.disaster.waterLevel}cm` : ''}
${report.disaster?.windSpeed ? `\n💨 Wind Speed: ${report.disaster.windSpeed} kph` : ''}

View on Bantayog Alert`;

    if (navigator.share) {
      setSharing(true);
      try {
        await navigator.share({
          title: `Bantayog Alert - ${disasterType.label}`,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(text);
        }
      } finally {
        setSharing(false);
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, [report]);

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className={`flex items-center gap-1.5 text-textLight dark:text-dark-textLight hover:text-accent dark:hover:text-accent transition-colors text-xs font-medium ${className}`}
      aria-label="Share report"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={sharing ? 'animate-pulse' : ''}
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      <span>Share</span>
    </button>
  );
});

export default ShareButton;
