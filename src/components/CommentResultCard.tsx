import React from "react";
import styles from "./SearchResults.module.css";

interface CommentResultCardProps {
  author?: string;
  message?: string;
  url: string;
}

const CommentResultCard: React.FC<CommentResultCardProps> = ({ author, message, url }) => {
  return (
    <div className={styles.commentCard}>
      <strong className={styles.author}>{author || "Unknown"}</strong>: {message || "No message"}
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
        🔗 Link
      </a>
    </div>
  );
};

export default CommentResultCard;