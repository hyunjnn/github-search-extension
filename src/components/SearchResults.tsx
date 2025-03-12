import CommitResultCard from "./CommitResultCard";
import CommentResultCard from "./CommentResultCard";
import styles from "./SearchResults.module.css";

interface SearchResultsProps {
  results: any[];
}

const SearchResults = ({ results }: SearchResultsProps) => {
  return (
    <div className={styles.resultsContainer}>
      {results.length === 0 ? (
        <p className="no-results">NO RESULTS FOUND</p>
      ) : (
        results.map((result, index) =>
          result.type === "commit" ? (
            <CommitResultCard
              key={index}
              author={result.author}
              message={result.message}
              url={result.url}
            />
          ) : (
            <CommentResultCard
              key={index}
              author={result.author}
              message={result.message}
              url={result.url}
            />
          )
        )
      )}
    </div>
  );
};

export default SearchResults;
