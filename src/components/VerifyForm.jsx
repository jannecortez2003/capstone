import React, { useState } from "react";

export default function VerifyForm({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    idType: "Drivers License",
    idNumber: "",
    lastName: user?.lastName || user?.fullName?.split(" ").slice(-1).join("") || "",
    firstName: user?.firstName || user?.fullName?.split(" ").slice(0, 1).join("") || "",
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

    // FIXED: Added phone and email back to the payload to satisfy the database!
    const formData = new FormData();
    formData.append("userId", user?.id);
    formData.append("idType", form.idType);
    formData.append("idNumber", form.idNumber);
    formData.append("lastName", form.lastName);
    formData.append("firstName", form.firstName);
    formData.append("address", form.address);
    formData.append("phone", form.phone); // MUST BE HERE
    formData.append("email", form.email); // MUST BE HERE
    formData.append("idImage", idImage); 

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/verify`, {
        method: "POST",
        body: formData, 
      });

      const responseData = await res.json();
      
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.message || "Verification failed.");
      }

      setMessage({ type: "success", text: responseData.message || "Verification submitted!" });
      
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        setLoading(false);
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setLoading(false);
      setMessage({ type: "error", text: error.message || "Failed to connect to server" });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md border-t-4 border-pink-500">
      <h3 className="text-2xl font-bold mb-4 text-pink-600 border-b border-pink-100 pb-2">Account Verification</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Type of ID</label>
            <select
              name="idType"
              value={form.idType}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-400 outline-none"
            >
              {idOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Upload ID Image</label>
            <label className="block w-full text-center rounded-lg px-3 py-2 bg-pink-50 text-pink-600 border border-pink-200 border-dashed cursor-pointer hover:bg-pink-100 transition">
              <span className="truncate block text-sm">{idImage ? idImage.name : "Click to select file"}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">ID Number</label>
          <input name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="Enter your ID number" className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-400 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-400 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-400 outline-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Full Home Address</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Street, Barangay, City" className="w-full rounded-lg px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-400 outline-none" />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-bold text-center ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 bg-pink-600 text-white font-bold rounded-full py-3 hover:bg-pink-700 transition shadow-md disabled:opacity-50">
            {loading ? "Processing..." : "Submit for Approval"}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}