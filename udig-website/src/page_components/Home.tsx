import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ImageType {
    id: string;
    imageData: string;
    url: string;
    type: string;
    section: string;
    order?: number;
    mimetype?: string;
}

const formatImages = (data: any[]): ImageType[] =>
    data
        .map((img) => ({
            ...img,
            url: `data:${img.mimetype || "image/png"};base64,${img.imageData}`,
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

function useSectionImages(section: string) {
    const [images, setImages] = useState<ImageType[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/section/${section}`
                );
                const data = await res.json();
                setImages(formatImages(data));
            } catch (err) {
                console.error(`Failed to fetch images for section "${section}":`, err);
            }
        };
        fetchImages();
    }, [section]);

    return images;
}

export default function Home() {

    const mainImages           = useSectionImages("MainImage");
    const callForDecencyImages = useSectionImages("CallForDecency");
    const roadTripImages       = useSectionImages("RoadTrip");
    const billboardImages      = useSectionImages("Billboard");
    const contestImages        = useSectionImages("Contests");
    const engagementImages     = useSectionImages("Engagement");
    const petitionImages       = useSectionImages("Petition");
    const pledgeImages         = useSectionImages("Pledge Challenges");
    const certImages           = useSectionImages("Decency Certification");

    return (
        <div>
            {/* Hero Section */}
            <section className="relative w-full flex flex-col items-center justify-center border-b border-stone-200 overflow-hidden bg-[#dfe3e9] py-12 px-6">
                {mainImages[0] && (
                    <div className="w-full max-w-4xl mb-6">
                        <img
                            src={mainImages[0].url}
                            alt="UDIG Bus"
                            className="w-full object-cover rounded-xl shadow-lg"
                        />
                    </div>
                )}

                <h1 className="text-yale-blue text-4xl font-bold text-center mb-4">
                    Demand Decency From Our Leaders
                </h1>

                <p className="text-black text-lg text-center max-w-2xl mb-8">
                    We are building a nationwide, nonpartisan movement to hold elected officials
                    to standards of respect, integrity, and accountability.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <Button
                        className="rounded-full px-8 py-5 bg-brick-ember text-white cursor-pointer transition hover:bg-oxblood-shadow text-base"
                        onClick={() => { window.location.href = "/petition-pledge/petition"; }}
                    >
                        Sign the Petition
                    </Button>
                    <Button
                        className="rounded-full px-8 py-5 bg-yale-blue text-white cursor-pointer transition hover:bg-deep-harbor text-base"
                        onClick={() => { window.location.href = "/petition-pledge/pledge"; }}
                    >
                        View the Pledge
                    </Button>
                    <Button
                        className="rounded-full px-8 py-5 bg-brick-ember text-white cursor-pointer transition hover:bg-oxblood-shadow text-base"
                        onClick={() => { window.location.href = "/contribute"; }}
                    >
                        Contribute
                    </Button>
                </div>
            </section>

            {/* A Call For Decency */}
            <section className="bg-[#dfe3e9] py-16 px-6 flex flex-col items-center">
                <h2 className="text-yale-blue text-3xl font-bold text-center mb-8">
                    A Call For Decency
                </h2>
                {callForDecencyImages[0] && (
                    <img
                        src={callForDecencyImages[0].url}
                        alt="A Call For Decency"
                        className="w-full max-w-3xl rounded-xl shadow-lg"
                    />
                )}
            </section>

            {/* Taking This Across America */}
            <section className="bg-white py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-yale-blue text-3xl font-bold text-center mb-4">
                        Taking This Across America
                    </h2>
                    <p className="text-black text-lg mb-10">
                        We are bringing this campaign directly into communities across the United States through
                        powerful, effective public engagement, nationwide outreach, and highly visible civic
                        accountability efforts.
                    </p>

                    <div className="flex flex-col gap-8 divide-y divide-gray-200">
                        {/* Bus Road Trip */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                            {roadTripImages[0] && (
                                <img
                                    src={roadTripImages[0].url}
                                    alt="Nation-Wide Bus Road Trip"
                                    className="w-48 h-auto object-contain flex-shrink-0"
                                />
                            )}
                            <p className="text-black text-lg">
                                Nation-Wide Bus Road Trip, With Youth-Involved Events in 100 Communities,
                                Including Local Collaborating Organizations.
                            </p>
                        </div>

                        {/* Billboard Campaign */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                            {billboardImages[0] && (
                                <img
                                    src={billboardImages[0].url}
                                    alt="Nationwide Billboard Campaign"
                                    className="w-48 h-auto object-contain flex-shrink-0"
                                />
                            )}
                            <p className="text-black text-lg">
                                Nationwide Billboard Campaign
                            </p>
                        </div>

                        {/* Essay Contests */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                            {contestImages[0] && (
                                <img
                                    src={contestImages[0].url}
                                    alt="National Decency Essay Contests"
                                    className="w-48 h-auto object-contain flex-shrink-0"
                                />
                            )}
                            <p className="text-black text-lg">
                                National Decency Essay Contests
                            </p>
                        </div>

                        {/* Engagement */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                            {engagementImages[0] && (
                                <img
                                    src={engagementImages[0].url}
                                    alt="Engagement of People of All Ages"
                                    className="w-48 h-auto object-contain flex-shrink-0"
                                />
                            )}
                            <p className="text-black text-lg">
                                Engagement of People of All Ages and All Political Stripes
                            </p>
                        </div>

                        {/* Decency Petition */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                            {petitionImages[0] && (
                                <img
                                    src={petitionImages[0].url}
                                    alt="Decency Petition"
                                    className="w-48 h-auto object-contain flex-shrink-0"
                                />
                            )}
                            <p className="text-black text-lg">
                                <a href="/petition-pledge/petition" className="text-blue-700 hover:underline">
                                    Decency Petition
                                </a>{" "}
                                — People join together to demand higher standards in public office.
                            </p>
                        </div>

                        {/* Pledge Challenges */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                            {pledgeImages[0] && (
                                <img
                                    src={pledgeImages[0].url}
                                    alt="Pledge Challenges"
                                    className="w-48 h-auto object-contain flex-shrink-0"
                                />
                            )}
                            <p className="text-black text-lg">
                                <a href="/petition-pledge/pledge" className="text-blue-700 hover:underline">
                                    Pledge Challenges
                                </a>{" "}
                                — Candidates and elected officials are challenged to commit in writing
                                to the decency pledge.
                            </p>
                        </div>

                        {/* Decency Certifications */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                            {certImages[0] && (
                                <img
                                    src={certImages[0].url}
                                    alt="Decency Certifications"
                                    className="w-48 h-auto object-contain flex-shrink-0"
                                />
                            )}
                            <p className="text-black text-lg">
                                <a href="/petition-pledge/certification" className="text-blue-700 hover:underline">
                                    Decency Certifications
                                </a>{" "}
                                — We track and publicize who signs and who refuses the decency pledge
                                and post decency ratings of candidates and elected officials.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Certified For Decency */}
            <section className="bg-[#dfe3e9] py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-yale-blue text-3xl font-bold text-center mb-6">
                        Certified For Decency
                    </h2>
                    <p className="text-black text-lg mb-8">
                        Candidates and elected officials will be publicly categorized based on their participation
                        in the pledge process and their demonstrated commitment to standards of integrity,
                        accountability, and respectful public conduct.
                    </p>

                    <div className="flex flex-col gap-4 text-lg text-black">
                        <p>🟢 <strong>Certified for Decency:</strong> Signed pledge + no verified violations</p>
                        <p>🟡 <strong>Provisionally Certified:</strong> Signed pledge + concerns under review</p>
                        <p>🔴 <strong>Not Certified:</strong> Refused to sign or serious concerns identified</p>
                        <p>⚫ <strong>Decertified:</strong> Signed pledge but later violated standards</p>
                    </div>

                    <p className="text-black text-lg mt-8">
                        Voters deserve transparency regarding the conduct and commitments of those who seek public office.
                    </p>
                </div>
            </section>

            {/* Join the Movement */}
            <section className="bg-[#102e50] py-20 px-6 flex flex-col items-center text-center">
                <h2 className="text-white text-4xl font-bold mb-6">Join The Movement</h2>
                <p className="text-white text-lg max-w-2xl mb-8">
                    Help us bring this message across America through a national road trip, presentations
                    in 100 cities, a billboard campaign, petitions, decency pledge challenges, and
                    accountability for commitments to decency.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button
                        className="rounded-full px-8 py-5 bg-white text-[#102e50] font-semibold cursor-pointer transition hover:bg-gray-100 text-base"
                        onClick={() => { window.location.href = "/petition-pledge/petition"; }}
                    >
                        Sign The Petition
                    </Button>
                    <Button
                        className="rounded-full px-8 py-5 bg-brick-ember text-white font-semibold cursor-pointer transition hover:bg-oxblood-shadow text-base"
                        onClick={() => { window.location.href = "/contribute"; }}
                    >
                        Donate to the Movement
                    </Button>
                </div>
            </section>
        </div>
    );
}