import React from "react";

interface RepoAlertProps {
  currentRepoOwner: string;
  currentRepoName: string;
  repoOwner: string;
  repoName: string;
  onSwitchRepo: () => void;
}

const RepoAlert: React.FC<RepoAlertProps> = ({
  currentRepoOwner,
  currentRepoName,
  repoOwner,
  repoName,
  onSwitchRepo,
}) => {
  if (!currentRepoOwner || !currentRepoName) return null;
  if (repoOwner === currentRepoOwner && repoName === currentRepoName)
    return null;

  return (
    <div className="repo-alert">
      <span className="repo-name">
        {currentRepoOwner}/{currentRepoName}
      </span>
      <button
        className="switch-repo-btn"
        title="Switch Repository"
        onClick={onSwitchRepo}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
        >
          <path d="M12 4V1L8 5l4 4V6a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8zm0 16v3l4-4-4-4v3a6 6 0 0 1-6-6H4a8 8 0 0 0 8 8z" />
        </svg>
      </button>
    </div>
  );
};

export default RepoAlert;
