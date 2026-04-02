import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaIdCard, FaUserClock } from "react-icons/fa";
import Modal, { SuccessModal } from '../../components/Modal';

const VerificationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_verification`);
            const data = await res.json();
            if (data.success) setRequests(data.requests);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleVerify = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this user?`)) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_verify_user`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId: id, status })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage(`User ${status} successfully.`);
                setShowSuccess(true);
                setSelectedRequest(null);
                fetchRequests();
            }
        } catch (err) { console.error(err); }
    };

    const pendingCount = requests.length;

    return (
        <div className="p-6 fade-in transition-colors duration-300">
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">ID Verification</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Review user submitted documents.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-yellow-300 transition-colors duration-300">
                    <div className="bg-yellow-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaUserClock className="text-yellow-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{pendingCount}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Pending Approvals</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                <div className="p-4 border-b dark:border-gray-700 transition-colors duration-300">
                    <h2 className="font-bold text-gray-700 dark:text-white transition-colors duration-300">Request Queue</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
                            <tr>
                                <th className="p-4 text-left">User</th>
                                <th className="p-4 text-left">ID Type</th>
                                <th className="p-4 text-left">Date Submitted</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 dark:text-white transition-colors duration-300">{req.first_name} {req.last_name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{req.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-800 dark:text-gray-200 transition-colors duration-300">{req.id_type}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 transition-colors duration-300">{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => setSelectedRequest(req)} className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors duration-300">
                                            Review ID
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400 dark:text-gray-500 transition-colors duration-300">No pending verifications.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRequest && (
                <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Review Document">
                    <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex justify-center border dark:border-gray-600 transition-colors duration-300">
                            <img src={`${import.meta.env.VITE_API_URL}/${selectedRequest.id_image_path}`} alt="ID" className="max-h-64 object-contain rounded shadow" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300">
                            <p><strong>Name:</strong> {selectedRequest.first_name} {selectedRequest.last_name}</p>
                            <p><strong>ID No:</strong> {selectedRequest.id_number}</p>
                            <p className="col-span-2"><strong>Address:</strong> {selectedRequest.address}</p>
                        </div>
                        <div className="flex gap-4 pt-4 border-t dark:border-gray-700 mt-4">
                            <button onClick={() => handleVerify(selectedRequest.id, 'Rejected')} className="flex-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 py-2 rounded-lg font-bold hover:bg-red-200 transition flex justify-center items-center gap-2">
                                <FaTimes /> Reject
                            </button>
                            <button onClick={() => handleVerify(selectedRequest.id, 'Verified')} className="flex-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 py-2 rounded-lg font-bold hover:bg-green-200 transition flex justify-center items-center gap-2">
                                <FaCheck /> Approve
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            
            <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message={successMessage} />
        </div>
    );
};
export default VerificationRequests;