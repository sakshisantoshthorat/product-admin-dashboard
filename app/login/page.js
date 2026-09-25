"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/authApi";

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        // Prevent multiple API requests
        if (loading) {
            return;
        }

        setError("");

        // Basic validation
        if (!username.trim() || !password.trim()) {
            setError("Username and password are required.");
            return;
        }

        try {
            setLoading(true);

            const data = await loginUser(username, password);

            // Save authentication token
            localStorage.setItem("token", data.accessToken);

            // Save basic user information
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.id,
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                })
            );

            // Go to product dashboard
            router.push("/products");
        } catch (error) {
            if (error.response?.status === 400) {
                setError("Invalid username or password.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-gray-900">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    Product Admin Dashboard
                </h1>

                <p className="mb-6 text-sm text-gray-500">
                    Login to manage products
                </p>

                {error && (
                    <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-900">
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="Enter username"
                            className="w-full rounded-md border px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-900">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter password"
                            className="w-full rounded-md border px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                    <p>Demo username: emilys</p>
                    <p>Demo password: emilyspass</p>
                </div>
            </div>
        </main>
    );
}