import { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { upvoteReport, removeUpvote } from '../../hooks/useReports';
import { useToast } from '../Common/Toast';

export default function EngagementButtons({ report, onViewMap, onToggleComments }) {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const [isUpvoting, setIsUpvoting] = useState(false);

  const hasUpvoted = report.engagement?.upvotedBy?.includes(user?.uid);

  const handleUpvote = async () => {
    if (!user) {
      addToast('Please sign in to upvote', 'warning');
      return;
    }

    if (isUpvoting) return;
    setIsUpvoting(true);

    try {
      if (hasUpvoted) {
        await removeUpvote(report.id, user.uid);
      } else {
        await upvoteReport(report.id, user.uid);
      }
    } catch (error) {
      addToast('Failed to update vote', 'error');
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bantayog Alert - ${report.disaster?.type}`,
          text: report.disaster?.description,
          url: window.location.href
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard', 'success');
    }
  };

  const btnClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors";

  return (
    <div className="px-2 py-2 border-t border-stone-100 flex justify-around">
      <button
        onClick={handleUpvote}
        disabled={isUpvoting}
        className={`${btnClass} ${
          hasUpvoted
            ? 'bg-accent/10 text-accent'
            : 'hover:bg-stone-50 text-textLight'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={hasUpvoted ? '#e63946' : 'none'} stroke={hasUpvoted ? '#e63946' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
        </svg>
        {report.engagement?.upvotes || 0}
      </button>

      <button
        onClick={onToggleComments}
        className={`${btnClass} hover:bg-stone-50 text-textLight`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        {report.engagement?.commentCount || 0}
      </button>

      <button
        onClick={() => onViewMap && onViewMap(report)}
        className={`${btnClass} hover:bg-stone-50 text-textLight`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Map
      </button>

      <button
        onClick={handleShare}
        className={`${btnClass} hover:bg-stone-50 text-textLight`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>
    </div>
  );
}
