import React from "react";
import styles from "./SearchResults.module.css";

interface CommitResultCardProps {
  author?: string;
  message?: string;
  url: string;
}

const CommitResultCard: React.FC<CommitResultCardProps> = ({ author, message, url }) => {
  return (
    <div className={styles.commitCard}>
      <strong className={styles.author}>{author || "Unknown"}</strong>: {message || "No message"}
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
        🔗 Link
      </a>
    </div>
  );
};

export default CommitResultCard;