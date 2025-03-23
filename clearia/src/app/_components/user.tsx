"use client";
import { api } from "~/trpc/react";

export function LatestUser() {
  const [latestUser] = api.user.getLatest.useSuspenseQuery();

  return (
    <div className="w-full max-w-xs">
      {latestUser ? (
        <p className="truncate">Your most recent user: {latestUser.name}</p>
      ) : (
        <p>You have no users yet.</p>
      )}
    </div>
  );
}

export function AllUsers() {
  const [users] = api.user.getAll.useSuspenseQuery();

  if (!users || users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <div className="w-full max-w-lg">
      <h2 className="mb-4 text-xl font-bold">All Users</h2>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="max-w-md rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">{user.name}</h3>

            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

