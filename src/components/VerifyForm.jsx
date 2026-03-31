// src/components/VerifyForm.jsx
import React, { useState } from "react";

export default function VerifyForm({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    idType: "Drivers License",
    idNumber: "",
    lastName: user?.lastName || user?.fullName?.split(" ").slice(-1).join(""),
    firstName: user?.firstName || user?.fullName?.split(" ").slice(0, 1).join(""),
    middleName: "",
    address: "",
    phone: "",
    email: user?.email || "",
  });
  const [idImage, setIdImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const idOptions = ["Drivers License", "PhilID", "PhilHealth", "TIN ID"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdImage(file);
    }
  };

  const validate = () => {
    if (!form.idNumber.trim()) return "ID number is required";
    if (!idImage) return "ID image is required for upload";
    if (!form.lastName.trim() || !form.firstName.trim()) return "Full name is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.phone.trim()) return "Phone number is required";
    if (!form.email.trim()) return "Email is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });
    formData.append("userId", user?.id || user?.uid);
    formData.append("idImage", idImage);

    try {
      const res = await fetch("http://localhost/verify.php", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: null }));
        throw new Error(errorData.message || "Verification failed (Server error)");
      }

      const responseData = await res.json();
      if (!responseData.success) {
        throw new Error(responseData.message || "Verification failed.");
      }

      setMessage({ type: "success", text: responseData.message || "Verification submitted." });
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setLoading(false);
        if (onClose) onClose();
      }, 1200);
    } catch (error) {
      setLoading(false);
      setMessage({ type: "error", text: error.message || "Network error" });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-pink-600 border-b border-pink-100 pb-2">Account Verification</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-pink-600 block mb-1">Type of ID</label>
            <select
              name="idType"
              value={form.idType}
              onChange={handleChange}
              className="w-full rounded px-3 py-2 bg-gray-50 text-gray-800 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {idOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-pink-600 block mb-1">Upload ID Image</label>
            <label className="block w-full text-center rounded px-3 py-2 bg-pink-50 text-pink-600 border border-pink-200 cursor-pointer hover:bg-pink-100 transition shadow-sm">
              <span className="truncate block w-full">{idImage ? idImage.name : "Choose File"}</span>
              <input type="file" name="idImage" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {idImage ? (
                <p className="text-xs text-green-600 mt-1 font-medium italic">✓ {idImage.name}</p>
            ) : (
                <p className="text-xs text-red-500 mt-1">* Required</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-pink-600 block mb-1">ID Number</label>
          <input name="idNumber" value={form.idNumber} onChange={handleChange} className="w-full rounded px-3 py-2 bg-gray-50 text-gray-800 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-semibold text-pink-600 block mb-1">Last name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full rounded px-3 py-2 bg-gray-50 text-gray-800 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
          <div>
            <label className="text-sm font-semibold text-pink-600 block mb-1">First name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full rounded px-3 py-2 bg-gray-50 text-gray-800 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
          <div>
            <label className="text-sm font-semibold text-pink-600 block mb-1">Middle name</label>
            <input name="middleName" value={form.middleName} onChange={handleChange} className="w-full rounded px-3 py-2 bg-gray-50 text-gray-800 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-pink-600 block mb-1">Address</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full rounded px-3 py-2 bg-gray-50 text-gray-800 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-pink-600 block mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded px-3 py-2 bg-gray-50 text-gray-800 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
          <div>
            <label className="text-sm font-semibold text-pink-600 block mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full rounded px-3 py-2 bg-gray-50 text-gray-800 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400" />
          </div>
        </div>

        {message && (
          <div className={`text-sm font-bold ${message.type === "error" ? "text-red-600" : "text-green-600"} mt-2`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="flex-1 bg-pink-600 text-white font-bold rounded-lg px-4 py-3 hover:bg-pink-700 transition shadow-lg disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Verification"}
          </button>
          <button type="button" onClick={onClose} className="bg-white border-2 border-pink-600 text-pink-600 font-bold rounded-lg px-6 py-3 hover:bg-pink-50 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}