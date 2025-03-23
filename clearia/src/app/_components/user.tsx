"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

// Types based on your Zod schema
type RouterOutputs = inferRouterOutputs<AppRouter>;

type User = RouterOutputs["user"]["getLatest"];
type UserRole = "NURSE" | "DOCTOR" | "ADMIN";

type UserFormData = {
  name: string;
  email: string;
  role: UserRole;
};

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
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreateUserForm() {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "NURSE",
  });
  const [error, setError] = useState<string | null>(null);

  const createUser = api.user.createUser.useMutation({
    onSuccess: () => {
      // Reset form
      setFormData({
        name: "",
        email: "",
        role: "NURSE",
      });
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(formData);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-xl font-bold">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="NURSE">Nurse</option>
            <option value="DOCTOR">Doctor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          disabled={createUser.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          {createUser.isPending ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}

export function UpdateUserForm({ user }: { user?: User }) {
  const [formData, setFormData] = useState<Partial<User>>({
    id: user?.id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
  });
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const updateUser = api.user.updateUser.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) {
      console.error("Form data is null or undefined.");
      return;
    }

    updateUser.mutate(formData);
  };

  if (!isEditing) {
    return (
      <div className="w-full max-w-md rounded-lg border p-4">
        <h3 className="mb-2 text-lg font-semibold">{user?.name}</h3>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Edit User
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-semibold">Update User</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="update-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="update-name"
            name="name"
            value={formData?.name}
            onChange={handleChange}
            required
            minLength={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="update-email"
            name="email"
            value={formData?.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-role" className="block text-sm font-medium">
            Role
          </label>
          <select
            id="update-role"
            name="role"
            value={formData?.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="NURSE">Nurse</option>
            <option value="DOCTOR">Doctor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={updateUser.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            {updateUser.isPending ? "Updating..." : "Update User"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function DeleteUserButton({ userId }: { userId?: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = api.user.deleteUser.useMutation({
    onSuccess: () => {
      setIsConfirming(false);
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleDelete = () => {
    if (!userId) {
      setError("User ID is missing.");
      return;
    }
    deleteUser.mutate({ id: userId });
  };

  if (isConfirming) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-red-600">
          Are you sure you want to delete this user?
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
          >
            {deleteUser.isPending ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={() => setIsConfirming(false)}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Delete User
    </button>
  );
}

export function UsersManager() {
  const [users] = api.user.getAll.useSuspenseQuery();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="w-full">
      <div className="mb-8">
        <CreateUserForm />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Manage Users</h2>
        {users && users.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border p-4">
                <h3 className="mb-2 text-lg font-semibold">{user.name}</h3>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Edit
                  </button>
                  <DeleteUserButton userId={user.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No users found.</p>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Edit User</h2>
            <UpdateUserForm user={selectedUser} />
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
