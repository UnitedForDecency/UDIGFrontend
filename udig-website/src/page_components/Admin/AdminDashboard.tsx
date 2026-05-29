import { type TokenProp } from "@/App";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";


const Sections = [
    "books",
    "essays",
    "contests",
    "events",
    "petitions-and-pledges",
    "impact",
    "users",
    "elected-officials/candidates",
    "volunteer",
    "issues",
    "images",
    "milestones",
    "guides",
    "udig-coverage",
    "publications",
    "reports"
] as const;

export default function AdminDashboard({ token }: TokenProp) {
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveSection = () => {
        // Determine active section from URL
        const path = location.pathname.replace(/\/$/, ""); // remove trailing slash
        for(const section of Sections) {
            if(path.endsWith(`/admin/${section}`)) {
                return section;
            }
        }

        return null;
    }

    const activeSection: any = getActiveSection();
    

    const checkAdminStatus = async () => {
        if (!token) {
            navigate("/home");
            return;
        }

        try {
            const userDataRes = await axios.get(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/accounts/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (userDataRes.data.role !== "ADMIN") {
                navigate("/home");
            }
        } catch (err) {
            console.error("AUTH ERROR:", err);
            navigate("/home");
        }
    };

    useEffect(() => {
        checkAdminStatus();
    }, [token]);

    const handleTabClick = (section: string) => {
        navigate(`/admin/${section}`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 flex-wrap justify-center">
                {Sections.map((section) => (
                    <button
                        key={section}
                        onClick={() => handleTabClick(section)}
                        className={`px-4 py-2 rounded transition-colors duration-200
                            ${activeSection === section ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}
                        `}
                    >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                ))}
            </div>

            {/* Outlet renders nested route content */}
            <Outlet />
        </div>
    );
}
