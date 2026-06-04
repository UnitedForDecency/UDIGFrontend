import './styles.css';
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

// Pages
import Home from "@/page_components/Home";
import Community from "@/page_components/Community";
import Contribute from "@/page_components/Contribute";
import About from "@/page_components/About";
import Contact from "@/page_components/Contact";

import GetInvolved from "@/page_components/GetInvolved";
import Events from "@/page_components/Events";
import Volunteer from "@/page_components/Volunteer";
import Guides from "@/page_components/Guides";
import GuidePost from "@/page_components/GuidePost";

import Impact from "@/page_components/Impact";
import Programs from "@/page_components/Programs";
import Essays from "@/page_components/Essays";
import Contests from "@/page_components/Contests";
import VideoPage from "@/page_components/Videopage";
import BookClub from "@/page_components/BookClub";

import Login from "@/page_components/Login";
import Signup from "./page_components/Signup";

import AdminDashboard from "@/page_components/Admin/AdminDashboard";

// Admin pages
import BooksAdmin from "./page_components/Admin/BooksAdmin";
import EssaysAdmin from "./page_components/Admin/EssaysAdmin";
import EventsAdmin from "./page_components/Admin/EventsAdmin";
import ImpactAdmin from "./page_components/Admin/ImpactAdmin";
import VolunteerAdmin from "./page_components/Admin/VolunteerAdmin";
import IssuesAdmin from "./page_components/Admin/IssuesAdmin";
import ImagesAdmin from "./page_components/Admin/ImagesAdmin";
import MilestonesAdmin from "./page_components/Admin/MilestoneAdmin";
import CommunityAdmin from "./page_components/Admin/CommunityAdmin";
import GuidesAdmin from "./page_components/Admin/GuidesAdmin";
import ReportsAdmin from "./page_components/Admin/ReportsAdmin";
import PressCoverageAdmin from "./page_components/Admin/UdigCoverageAdmin";
import OfficeAdmin from './page_components/Admin/OfficeAdmin';


// Other pages
import Supporter from "@/page_components/Supporters";
import History from "@/page_components/History.tsx";
import Issues from "./page_components/Issues";
import IssuePost from "./page_components/IssuePost";
import EssayPost from "./page_components/EssayPost";
import ContestPost from "./page_components/ContestPost";
import ContestsAdmin from './page_components/Admin/ContestsAdmin';
import SocialMedia from "./page_components/SocialMedia";
import PressCoverage from "./page_components/UdigCoverage";
import PetitionSubmissionPage from './page_components/PetitionSubmission';
import PledgeSubmissionPage from './page_components/PledgeSubmission';
import Certification from './page_components/Certification';
import PetitionsAndPledgeSubmissionsAdmin from './page_components/Admin/PetitionsAndPledgeSubmissionsAdmin';
import WhyDecency from './page_components/Whydecency';
import Publications from './page_components/Publications';
import VideoAdmin from './page_components/Admin/VideosAdmin';
import { APIProvider } from "@vis.gl/react-google-maps";
import OfficeInfo from './page_components/OfficeInfo';
import PublicationsAdmin from './page_components/Admin/PublicationsAdmin';

export interface TokenProp {
    token: string | null;
}

export function notifyApiError(err: AxiosError, attemptedAction: string) {
    if (err.response?.data) {
        console.error(`Failed to ${attemptedAction}`, err.response.data);
        alert(`Failed to ${attemptedAction}`);
    }
}

type Image = {
    id: string;
    imageData: string;
    type: string;
    section: string;
};

export default function App() {
    const controllerUrl: string = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const [token, setToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    const fetchLogoImage = async (): Promise<void> => {
        try {
            return axios.get<Image[]>(
                `${controllerUrl}/images/type/navbar`
            ).then(res => {
                const images: Image[] = res.data;

                if(images.length !== 0) {
                    for(const image of images) {
                        if(image.section === "logo") {
                            const logoLink = document.getElementById("udig-website-icon-head-link");

                            if(logoLink === null) {
                                console.error("Failed to find the logo link element");
                                return;
                            }

                            (logoLink as HTMLLinkElement).href = `data:image/png;base64,${image.imageData}`;
                            return;
                        }
                    }
                }
            }, (err: AxiosError) => {
                if(err.response?.data) {
                    console.error(err.response.data);
                } else {
                    console.error(`Unexpected error occured when fetching logo image: ${err}`);
                }
            });
        } catch(err) {
            console.error(`Failed to load logo image: ${err}`);
        }
    };

    const checkAdmin = async (jwt: string) => {
        try {
            const res = await fetch(
                `${controllerUrl}/accounts/admin/test`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );
            setIsAdmin(res.ok);
        } catch (err) {
            setIsAdmin(false);
        }
    };

    const handleLogin = (jwt: string) => {
        localStorage.setItem("token", jwt);
        setToken(jwt);
        setIsLoggedIn(true);
        checkAdmin(jwt);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
    };

    useEffect(() => {
        fetchLogoImage();

        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
            setToken(null);
            setIsLoggedIn(false);
            setIsAdmin(false);
            return;
        }

        setToken(storedToken);
        setIsLoggedIn(true);
        setIsAdmin(null);

        checkAdmin(storedToken);
    }, []);

    return (
        <Router>
            <div className="bg-porcelain min-h-screen flex flex-col">
                <Navbar
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin === true}
                    onLogout={handleLogout}
                />

                <APIProvider apiKey={import.meta.env.VITE_GOOGLEMAPS_API_KEY}>
                    <div className="grow">
                        <Routes>
                            {/* Home */}
                            <Route path="/" element={<Home />} />

                            {/* UDIG */}
                            <Route path="/about" element={<About />} />
                            <Route path="/impact" element={<Impact />} />
                            <Route path="/about/supporters" element={<Supporter />} />
                            <Route path="/about/office-registry" element={<OfficeInfo token={token} />} />
                            <Route path="/about/history" element={<History />} />
                            <Route path="/about/udig-coverage" element={<PressCoverage />} />
                            <Route path="/about/publications" element={<Publications />} />

                            {/* Why Decency? */}
                            <Route path="/why-decency" element={<WhyDecency />} />

                            {/* Programs */}
                            <Route path="/programs" element={<Programs />} />
                            <Route path="/programs/essays" element={<Essays />} />
                            <Route path="/programs/essays/:id" element={<EssayPost />} />
                            <Route path="/programs/contests" element={<Contests />} />
                            <Route path="/programs/contests/:id" element={<ContestPost />} />
                            <Route path="/programs/videos" element={<VideoPage />} />
                            <Route path="/programs/bookclub" element={<BookClub token={token} />} />
                            <Route path="/programs/bookclub/:initialBookId" element={<BookClub token={token} />} />
                            <Route path="/programs/issues" element={<Issues />} />
                            <Route path="/programs/issues/:id" element={<IssuePost />} />

                            {/* Get Involved */}
                            <Route path="/get-involved" element={<GetInvolved />} />
                            <Route path="/get-involved/volunteer" element={<Volunteer />} />
                            <Route path="/get-involved/events" element={<Events/>} />
                            <Route path="/get-involved/community" element={<Community />} />
                            <Route path="/get-involved/socialmedia" element={<SocialMedia token={token} />} />
                            <Route path="/get-involved/guides" element={<Guides />} />
                            <Route path="/get-involved/guides/:id" element={<GuidePost />} />

                            {/* Petitions & Pledges */}
                            <Route path="/petition-pledge/petition" element={<PetitionSubmissionPage token={token} />} />
                            <Route path="/petition-pledge/pledge" element={<PledgeSubmissionPage token={token} />} />
                            <Route path="/petition-pledge/certification" element={<Certification />} />

                            {/* Contact */}
                            <Route path="/contact" element={<Contact />} />

                            {/* Contribute */}
                            <Route path="/contribute" element={<Contribute />} />

                            {/* Auth */}
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/login" element={<Login onLogin={handleLogin} />} />

                            {/* Admin routes */}
                            <Route
                                path="/admin/*"
                                element={
                                    isAdmin === null ? (
                                        <div>Checking admin access...</div>
                                    ) : token && isAdmin === true ? (
                                        <AdminDashboard token={token} />
                                    ) : (
                                        <Navigate to="/" replace />
                                    )
                                }
                            >
                                {/* Nested admin pages */}
                                <Route path="books" element={<BooksAdmin token={token} />} />
                                <Route path="essays" element={<EssaysAdmin token={token} />} />
                                <Route path="contests" element={<ContestsAdmin token={token} />}/>
                                <Route path="events" element={<EventsAdmin token={token} />} />
                                <Route path="petitions-and-pledges" element={<PetitionsAndPledgeSubmissionsAdmin token={token} />} />
                                <Route path="impact" element={<ImpactAdmin token={token} />} />
                                <Route path="community" element={<CommunityAdmin token={token} />} />
                                <Route path="elected-officials/candidates" element={<OfficeAdmin token={token} />} />
                                <Route path="volunteer" element={<VolunteerAdmin token={token} />} />
                                <Route path="issues" element={<IssuesAdmin token={token} />} />
                                <Route path="images" element={<ImagesAdmin token={token} />} />
                                <Route path="videos" element={<VideoAdmin />} />
                                <Route path="milestones" element={<MilestonesAdmin token={token} />} />
                                <Route path="guides" element={<GuidesAdmin token={token} />} />
                                <Route path="udig-coverage" element={<PressCoverageAdmin token={token} />} />
                                <Route path="publications" element={<PublicationsAdmin token={token} />} />
                                <Route path="reports" element={<ReportsAdmin token={token} />} />
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </APIProvider>

                <Footer />
            </div>
        </Router>
    );
}
