import React from "react";
import "./UserProfile.css";

interface UserProfileProps {
  userInfo: { login: string; avatar_url: string } | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ userInfo }) => {
  if (!userInfo) return null;

  return (
    <div className="user-info">
      <img
        src={userInfo.avatar_url}
        alt={userInfo.login}
        className="user-avatar"
      />
      <span className="user-name">@{userInfo.login}</span>
    </div>
  );
};

export default UserProfile;
