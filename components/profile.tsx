"use client";
import { useUser } from "@/store/userContext"; // Import your context and hook

const Profile = () => {
  // Get user data from context using useUser hook
  const { user } = useUser();
  console.log("user", user);

  return (
    <div>
      {user && user.name ? (
        <div>
          <h1>Welcome, {user.name}!</h1>
          <h2>{user.email}</h2>
          <img src={user.picture || "/default-avatar.png"} alt="Profile" />
        </div>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default Profile;
