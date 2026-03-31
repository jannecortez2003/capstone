import React, { useState } from "react";

const AdminLogin = ({ onAdminLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/adminlogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      if (data.success) {
        onAdminLogin && onAdminLogin(data.admin);

        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        localStorage.setItem("isAdmin", "true");

        window.location.href = "/admin-dashboard";
      } else {
        setError(data.message || "Invalid admin credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-4 bg-white rounded shadow mt-16"
    >
      <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
      {error && <div className="mb-2 text-red-600 text-center">{error}</div>}

      <label
        htmlFor="username"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Username:
      </label>
      <input
        type="text"
        id="username"
        placeholder="Username"
        className="block w-full mb-2 p-2 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={loading}
      />

      <label
        htmlFor="password"
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Password:
      </label>
      <input
        type="password"
        id="password"
        placeholder="Password"
        className="block w-full mb-4 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />

      <button
        type="submit"
        className="bg-pink-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login as Admin"}
      </button>
    </form>
  );
};

export default AdminLogin;
