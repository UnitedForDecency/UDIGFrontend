import {useEffect} from "react";
import {useParams, useNavigate, Outlet, Navigate} from "react-router-dom";
import axios from "axios";
import {type TokenProp} from "@/App";

type Section = Readonly<{
    url: string;
    displayName?: string;
}>;

const Sections: readonly Section[] = [
    {url: "books"},
    {url: "essays"},
    {url: "contests"},
    {url: "events"},
    {url: "petitions-and-pledges", displayName: "Petitions & Pledges"},
    {url: "impact"},
    {url: "community"},
    {url: "elected-officials/candidates", displayName: "Elected Officials/Candidates"},
    {url: "volunteer"},
    {url: "issues"},
    {url: "images"},
    {url: "videos"},
    {url: "milestones"},
    {url: "guides"},
    {url: "udig-coverage", displayName: "UDIG Coverage"},
    {url: "publications"},
    {url: "reports"}
];

export default function AdminDashboard({token}: TokenProp) {
    const {"*": activeSection} = useParams();
    const navigate = useNavigate();

    const checkAdminStatus = async (): Promise<void> => {
        if(token === null) {
            navigate("/");
            return;
        }

        try {
            const userDataRes = await axios.get(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/accounts/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if(userDataRes.data.role !== "ADMIN") {
                navigate("/");
            }
        } catch(err) {
            console.error("AUTH ERROR: ", err);
            navigate("/");
        }
    };

    useEffect(() => {
        checkAdminStatus();
    }, [token]);

    if(
        activeSection === undefined ||
        activeSection === "" ||
        Sections.find(section => section.url === activeSection) === undefined
    ) {
        return <Navigate to={`/admin/${Sections[0].url}`} replace />
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 flex-wrap justify-center">
                {Sections.map(section => (
                    <button
                        key={section.url}
                        onClick={() => navigate(`/admin/${section.url}`)}
                        className={`px-4 py-2 rounded transition-colors duration-200 ${
                            activeSection === section.url ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    >
                        {section.displayName !== undefined ? (
                            section.displayName
                        ) : (
                            section.url.charAt(0).toUpperCase() + section.url.slice(1)
                        )}
                    </button>
                ))}
            </div>

            {/* Outlet renders nested route content */}
            <Outlet />
        </div>
    );
}
