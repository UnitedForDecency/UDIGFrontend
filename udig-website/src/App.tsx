import './styles.css'
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AxiosError } from "axios";

import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";


// Page imports
import Home from "@/page_components/Home";
import Community from "@/page_components/Community";
import Contribute from "@/page_components/Contribute";
import About from "@/page_components/About";
import Contact from "@/page_components/Contact";

import GetInvolved from "@/page_components/GetInvolved";
import Petitions from "@/page_components/Petitions";
import Events from "@/page_components/Events";
import Volunteer from "@/page_components/Volunteer";
import Guides from "@/page_components/Guides";
import GuidePost from "@/page_components/GuidePost";

import Impact from "@/page_components/Impact";
import Programs from "@/page_components/Programs";
import Essays from "@/page_components/Essays";
import VideoPage from "@/page_components/Videopage";
import BookClub from "@/page_components/BookClub";

import Login from "@/page_components/Login";
import AdminDashboard from "@/page_components/Admin/AdminDashboard";
import Signup from './page_components/Signup';
import BooksAdmin from './page_components/Admin/BooksAdmin';
import EssaysAdmin from './page_components/Admin/EssaysAdmin';
import EventsAdmin from './page_components/Admin/EventsAdmin';
import PetitionsAdmin from './page_components/Admin/PetitionsAdmin';
import Leadership from "@/page_components/Leadership.tsx";
import { APIProvider } from '@vis.gl/react-google-maps';
import History from "@/page_components/History.tsx";
import CommunityAdmin from './page_components/Admin/CommunityAdmin';
import ImpactAdmin from './page_components/Admin/ImpactAdmin';
import VolunteerAdmin from './page_components/Admin/VolunteerAdmin';
import Issues from './page_components/Issues';
import IssuesAdmin from './page_components/Admin/IssuesAdmin';
import IssuePost from './page_components/IssuePost';
import IssuesEditAdmin from './page_components/Admin/IssuesEditAdmin';
import EssayPost from './page_components/EssayPost';
import ContestPost from './page_components/ContestPost';
import ImagesAdmin from './page_components/Admin/ImagesAdmin';
import MilestonesAdmin from './page_components/Admin/MilestoneAdmin';
import LeadershipAdmin from './page_components/Admin/LeadershipAdmin';
import GuideEditAdmin from './page_components/Admin/GuideEditAdmin';
import GuidesAdmin from './page_components/Admin/GuidesAdmin';
import ReportsAdmin from './page_components/Admin/ReportsAdmin';
import SocialMedia from './page_components/SocialMedia';
import PressCoverage from './page_components/PressCoverage';
import PressCoverageAdmin from './page_components/Admin/PressCoverageAdmin';

export interface TokenProp {
    token: string | null;
}

interface ApiErrorFormat {
    message: string;
}

export function notifyApiError(err: AxiosError, attemptedAction: string) {
    if (err.response && err.response.data) {
        const responseMessage = (err.response.data as ApiErrorFormat).message
        console.error(`Failed to ${attemptedAction} with status ${err.response.status}: ${responseMessage}`);
        alert(`Failed to ${attemptedAction} with status ${err.response.status}: ${responseMessage}`);
    }
}


function App() {
    const [token, setToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const handleLogin = (adminStatus: boolean, jwt: string) => {
        const expiry = Date.now() + 2 * 60 * 60 * 1000; // 2hs in ms
        localStorage.setItem("token", jwt);
        localStorage.setItem("isAdmin", JSON.stringify(adminStatus));
        localStorage.setItem("expiry", expiry.toString());

        setIsLoggedIn(true);
        setIsAdmin(adminStatus);
        setToken(jwt);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("expiry");

        setIsLoggedIn(false);
        setIsAdmin(false);
        setToken(null);
    }

    useEffect(() => {
        const storedToken =  localStorage.getItem("token");
        const storedAdmin = localStorage.getItem("isAdmin") === "true"; // convert string to boolean
        const expiry = localStorage.getItem("expiry");

        if (storedToken && expiry && Date.now() < Number(expiry)) {
            setToken(storedToken);
            setIsAdmin(storedAdmin);
            setIsLoggedIn(true);
        } else {
            setTimeout(() => handleLogout(), 0);
        }
    }, []);

    return (
        <Router>
            <div className="bg-porcelain min-h-screen h-fit flex flex-col">
                <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout}/>
                <APIProvider apiKey={import.meta.env.VITE_GOOGLEMAPS_API_KEY}>
                <div className="grow">
                    <Routes>
                        {/* Public pages */}
                        <Route path="/" element={<Home />} />
                        <Route path="/contribute" element={<Contribute />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/about/leadership" element={<Leadership />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about/history" element={<History />} />
                        <Route path="/about/press-coverage" element={<PressCoverage />} />

                        {/* Get Involved */}
                        <Route path="/get-involved" element={<GetInvolved />} />
                        <Route path="/get-involved/petitions" element={<Petitions token={token} />} />
                        <Route path="/get-involved/events" element={<Events token={token} />} />
                        <Route path="/get-involved/volunteer" element={<Volunteer />} />
                        <Route path="/get-involved/community" element={<Community />} />
                        <Route path="/get-involved/socialmedia" element={<SocialMedia token={token} />} />
                        <Route path="/get-involved/guides" element={<Guides />} />
                        <Route path="/get-involved/guides/:id" element={<GuidePost />} />
                        <Route path="/get-involved/guides/:id/edit" element={localStorage.getItem('isAdmin') === 'true' && localStorage.getItem('token') ? <GuideEditAdmin /> : <Navigate to="/" replace />} />

                        {/* Programs */}
                        <Route path="/impact" element={<Impact />} />
                        <Route path="/programs" element={<Programs />} />
                        <Route path="/programs/essays" element={<Essays />} />
                        <Route path="/programs/essays/:id" element={<EssayPost />} />
                        <Route path="/programs/contests/:id" element={<ContestPost token={token} />} />
                        <Route path="/programs/videos" element={<VideoPage />} />
                        <Route path="/programs/issues" element={<Issues />} />
                        <Route path="/programs/issues/:id" element={<IssuePost />} />
                        <Route path="/programs/issues/:id/edit" element={localStorage.getItem('isAdmin') === 'true' && localStorage.getItem('token') ? <IssuesEditAdmin /> : <Navigate to="/" replace />} />

                        {/* Auth */}
                        <Route path="/login" element={<Login onLogin={handleLogin} />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Protected routes */}
                        <Route path="/programs/bookclub/:initialBookId" element={<BookClub token={token} />} />
                        <Route path="/programs/bookclub" element={<BookClub token={token} />} />

                        {/* Admin routes */}
                        <Route
                            path="/admin/*"
                            element={isAdmin && token ? <AdminDashboard token={token} /> : <Navigate to="/" replace />}
                        >
                            {/* Nested admin pages */}
                            <Route path="books" element={<BooksAdmin token={token} />} />
                            <Route path="essays" element={<EssaysAdmin token={token} />} />
                            <Route path="events" element={<EventsAdmin token={token} />} />
                            <Route path="petitions" element={<PetitionsAdmin token={token} />} />
                            <Route path="impact" element={<ImpactAdmin token={token} />} />
                            <Route path="leaders" element={<CommunityAdmin token={token} />} />
                            <Route path="volunteer" element={<VolunteerAdmin token={token } />} />
                            <Route path="issues" element={<IssuesAdmin token={token} />} />
                            <Route path="images" element={<ImagesAdmin />} />
                            <Route path="milestones" element={<MilestonesAdmin token={token} />} />
                            <Route path="leadership" element={<LeadershipAdmin token={token} />} />
                            <Route path="guides" element={<GuidesAdmin token={token} />} />
                            <Route path="press-coverage" element={<PressCoverageAdmin token={token} />} />
                            <Route path="reports" element={<ReportsAdmin token={token} />} />

                            {/* Redirect /admin → /admin/books */}
                            <Route index element={<Navigate to="books" replace />} />
                        </Route>


                        {/* Fallback */}
                        <Route path="*" element={<Home />} />
                    </Routes>
                </div>
                </APIProvider>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
