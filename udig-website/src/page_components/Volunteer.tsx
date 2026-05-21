import { useEffect, useState } from "react";
import axios from "axios";

type VolunteerRole = {
    id: string;
    role: string;
};

type User = {
    id: string;
    volunteerRole?: string[];
    role: string;
};

export default function Volunteer() {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [volunteerRoles, setVolunteerRoles] = useState<VolunteerRole[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<
        "idle" | "success" | "error"
    >("idle");
    const [showConfirm, setShowConfirm] = useState(false);

    const API_BASE =
        import.meta.env.VITE_MONGO_CONTROLLER_URL || "http://localhost:3001";

    const VOLUNTEER_ROLE_BASE = `${API_BASE}/volunteer`;
    const ACCOUNT_BASE = `${API_BASE}/accounts`;

    const token = localStorage.getItem("token") || "";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roleRes = await axios.get<VolunteerRole[]>(
                    VOLUNTEER_ROLE_BASE
                );

                setVolunteerRoles(
                    Array.isArray(roleRes.data) ? roleRes.data : []
                );
            } catch (err) {
                console.error("Failed to fetch volunteer roles:", err);
            }
        };

        fetchData();
    }, [VOLUNTEER_ROLE_BASE]);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );

        setSelectedRoles(values);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedRoles.length === 0) {
            alert("Please choose at least one role.");
            return;
        }

        setSubmitStatus("idle");
        setShowConfirm(true);
    };

    const confirmVolunteer = async () => {
        if (!token) {
            alert("You must be logged in.");
            return;
        }

        setSubmitting(true);
        setSubmitStatus("idle");

        try {
            // get current logged in user
            const meRes = await axios.get<User>(
                `${ACCOUNT_BASE}/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const user = meRes.data;

            const currentRoles = user.volunteerRole || [];

            // remove duplicates
            const updatedRoles = Array.from(
                new Set([...currentRoles, ...selectedRoles])
            );

            let userRole = user.role
            if(user.role != "ADMIN" && user.role != "LEADER")
                userRole = "VOLUNTEER"

            // update user
            await axios.patch(
                `${ACCOUNT_BASE}/${user.id}`,
                {
                    volunteerRole: updatedRoles,
                    role: userRole
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSubmitStatus("success");
            setSelectedRoles([]);
            setShowConfirm(false);
        } catch (err) {
            console.error("Failed to submit volunteer form:", err);
            setSubmitStatus("error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-parchment text-graphite">
            <div>
                <div className="relative max-w-5xl mx-auto px-4 py-20 text-center text-graphite">
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">
                        Volunteer With UDIG
                    </h1>

                    <div className="w-24 h-1 bg-brick-ember mx-auto mb-6 rounded-full"></div>

                    <p className="text-lg max-w-2xl mx-auto leading-relaxed">
                        Democracy works best when people show up.
                        Whether you have an hour a week or want
                        to dive in deeply, there&apos;s a place
                        for you here.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="bg-porcelain p-8 rounded-2xl border border-antique-brass shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 text-yale-blue">
                        Get Involved
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                What are you interested in?{" "}
                                <span className="text-sm font-normal text-graphite/70">
                                    (hold Ctrl / Cmd to choose multiple)
                                </span>
                            </label>

                            <select
                                multiple
                                value={selectedRoles}
                                onChange={handleRoleChange}
                                required={selectedRoles.length === 0}
                                className="w-full min-h-40 border border-stone-taupe rounded-md p-3 bg-white focus:outline-none focus:ring-2 focus:ring-yale-blue"
                            >
                                {volunteerRoles.map((role) => (
                                    <option
                                        key={role.id}
                                        value={role.role}
                                    >
                                        {role.role}
                                    </option>
                                ))}
                            </select>

                            {selectedRoles.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedRoles.map((role) => (
                                        <span
                                            key={role}
                                            className="inline-flex items-center rounded-full border border-stone-taupe bg-alice-blue px-3 py-1 text-sm text-yale-blue"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {submitStatus === "success" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-medium">
                                    Successfully volunteered for selected roles.
                                </p>
                            </div>
                        )}

                        {submitStatus === "error" && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800 font-medium">
                                    Something went wrong. Please try again.
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || selectedRoles.length === 0}
                            className="bg-brick-ember text-porcelain px-8 py-3 rounded-md hover:bg-burnt-crimson transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Submitting..." : "Volunteer"}
                        </button>
                    </form>
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-porcelain p-6 shadow-xl border border-stone-taupe">
                        <h3 className="text-2xl font-semibold text-yale-blue mb-3">
                            Confirm Volunteer Signup
                        </h3>

                        <p className="text-graphite leading-relaxed mb-6">
                            Are you sure you want to volunteer
                            for these roles?
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 rounded-md border border-stone-taupe bg-white hover:bg-alice-blue transition"
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmVolunteer}
                                disabled={submitting}
                                className="px-4 py-2 rounded-md bg-brick-ember text-porcelain hover:bg-burnt-crimson transition disabled:opacity-50"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Yes, volunteer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}