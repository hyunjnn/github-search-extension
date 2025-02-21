import React from "react";
import CommitResultCard from "./CommitResultCard";
import CommentResultCard from "./CommentResultCard";
import styles from "./SearchResults.module.css";

interface SearchResultsProps {
  results: any[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  return (
    <div className={styles.resultsContainer}>
      {results.map((result, index) =>
        result.type === "commit" ? (
          <CommitResultCard key={index} author={result.author} message={result.message} url={result.url} />
        ) : (
          <CommentResultCard key={index} author={result.author} message={result.message} url={result.url} />
        )
      )}
    </div>
  );
};

export default SearchResults;
