import { useState, useEffect } from "react";
import axios from "axios";

type VolunteerOrg = {
    _id: string;
    name: string;
    description: string;
    link: string;
    category: string;
};

const interestsList = [
    "Event Support",
    "Voter Education",
    "Research & Policy",
    "Community Outreach",
    "Writing & Editing",
    "Social Media",
];

export default function Volunteer() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [orgsByCategory, setOrgsByCategory] = useState<Record<string, VolunteerOrg[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL || "http://localhost:3001";

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const res = await axios.get<VolunteerOrg[]>(`${API_BASE}/api/volunteer`);
                const grouped: Record<string, VolunteerOrg[]> = {};
                res.data.forEach((org) => {
                    if (!grouped[org.category]) grouped[org.category] = [];
                    grouped[org.category].push(org);
                });
                setOrgsByCategory(grouped);
            } catch (err) {
                console.error("Failed to fetch volunteer orgs:", err);
            }
        };
        fetchOrgs();
    }, []);

    const toggleInterest = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus("idle");

        try {
            // Save signup to MongoDB
            await axios.post(`${API_BASE}/api/volunteer/signup`, {
                name,
                email,
                interests: selectedInterests,
            });

            // Send notification email via email service
            // await axios.post(`${EMAIL_SERVICE_URL}/sendVolunteerEmail`, {
            //     name,
            //     email,
            //     interests: selectedInterests,
            // });

            setSubmitStatus("success");
            setName("");
            setEmail("");
            setSelectedInterests([]);
        } catch (err) {
            console.error("Failed to submit volunteer form:", err);
            setSubmitStatus("error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-parchment text-graphite">

            {/* ---------- HERO ---------- */}
            <div>
                <div className="relative max-w-5xl mx-auto px-4 py-20 text-center text-graphite">
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">
                        Volunteer With UDIG
                    </h1>
                    <div className="w-24 h-1 bg-brick-ember mx-auto mb-6 rounded-full"></div>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed">
                        Democracy works best when people show up. Whether you have an hour
                        a week or want to dive in deeply, there's a place for you here.
                    </p>
                </div>
            </div>

            {/* ---------- FORM SECTION ---------- */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="bg-porcelain p-8 rounded-2xl border border-antique-brass shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 text-yale-blue">
                        Get Involved
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full border border-stone-taupe rounded-md p-3 bg-white focus:outline-none focus:ring-2 focus:ring-yale-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full border border-stone-taupe rounded-md p-3 bg-white focus:outline-none focus:ring-2 focus:ring-yale-blue"
                            />
                        </div>

                        <div>
                            <p className="block text-sm font-medium mb-4">
                                What are you interested in?
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {interestsList.map((interest) => (
                                    <label
                                        key={interest}
                                        className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition
                                        ${selectedInterests.includes(interest)
                                            ? "bg-deep-harbor text-porcelain border-deep-harbor"
                                            : "bg-misty-linen border-stone-taupe hover:bg-alice-blue"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedInterests.includes(interest)}
                                            onChange={() => toggleInterest(interest)}
                                            className="accent-brick-ember"
                                        />
                                        <span>{interest}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {submitStatus === "success" && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-medium">
                                    Thanks for stepping up 💙 We'll be in touch soon.
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
                            disabled={submitting}
                            className="bg-brick-ember text-porcelain px-8 py-3 rounded-md hover:bg-burnt-crimson transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    </form>
                </div>
            </div>

            {/* ---------- ORGANIZATIONS ---------- */}
            <div className="bg-alice-blue/50 py-16 px-6 border-t border-stone-taupe">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-10 text-yale-blue">
                        Collaborating Organizations
                    </h2>
                    <div className="space-y-12">
                        {Object.entries(orgsByCategory).map(([category, orgs]) => (
                            <div key={category}>
                                <h3 className="text-lg font-semibold mb-5 text-yale-blue border-l-4 border-golden-bronze pl-3">
                                    {category}
                                </h3>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {orgs.map((org) => (
                                        <a
                                            key={org._id}
                                            href={org.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block bg-porcelain p-6 rounded-xl border border-stone-taupe transition hover:border-yale-blue hover:shadow-md hover:-translate-y-1"
                                        >
                                            <p className="font-semibold text-yale-blue mb-2 group-hover:text-brick-ember transition">
                                                {org.name}
                                            </p>
                                            <p className="text-sm text-graphite leading-relaxed">
                                                {org.description}
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
