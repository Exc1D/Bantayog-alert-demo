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

  return (
    <div className="p-3 border-t border-gray-100 flex justify-around">
      <button
        onClick={handleUpvote}
        disabled={isUpvoting}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          hasUpvoted
            ? 'bg-blue-50 text-blue-600'
            : 'hover:bg-gray-50 text-textLight'
        }`}
      >
        {hasUpvoted ? '\u{1F44D}' : '\u{1F44D}\u{1F3FB}'} {report.engagement?.upvotes || 0}
      </button>

      <button
        onClick={onToggleComments}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 text-textLight"
      >
        {'\u{1F4AC}'} {report.engagement?.commentCount || 0}
      </button>

      <button
        onClick={() => onViewMap && onViewMap(report)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 text-textLight"
      >
        {'\u{1F5FA}\uFE0F'} Map
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 text-textLight"
      >
        {'\u{1F4E4}'} Share
      </button>
    </div>
  );
}
