import styles from "./UserProfile.module.css";
import { useUser } from "../context/UserContext";

const UserProfile = () => {
  const { userInfo } = useUser();

  if (!userInfo) return null;

  return (
    <div className={styles.userInfo}>
      <img
        className={styles.userAvatar}
        src={userInfo.avatar_url}
        alt={userInfo.login}
      />
      <span className={styles.userName}>@{userInfo.login}</span>
    </div>
  );
};

export default UserProfile;
