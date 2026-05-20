import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button.tsx";
import { ArrowUpRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ImageType {
    _id: string;
    url: string;
    page: string;
    section: string;
    order: number;
}

export default function About() {
    const [visionImages, setVisionImages] = useState<ImageType[]>([]);
    const [missionImages, setMissionImages] = useState<ImageType[]>([]);
    const [storyImages, setStoryImages] = useState<ImageType[]>([]);

    /* ---------------- Fetch About Images ---------------- */
    const fetchImages = async () => {
        try {
        // Vision
        const visionRes = await fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images?page=about&section=visionImages`);
        const visionData = await visionRes.json();
        setVisionImages(visionData.sort((a: ImageType, b: ImageType) => a.order - b.order));

        // Mission
        const missionRes = await fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images?page=about&section=missionImages`);
        const missionData = await missionRes.json();
        setMissionImages(missionData.sort((a: ImageType, b: ImageType) => a.order - b.order));

        // Our Story
        const storyRes = await fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images?page=about&section=storyImages`);
        const storyData = await storyRes.json();
        setStoryImages(storyData.sort((a: ImageType, b: ImageType) => a.order - b.order));

        } catch (err) {
        console.error("Failed to fetch About images:", err);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <section>
        {/* ================= Vision Section ================= */}
        <div className="bg-porcelain py-16 px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-4xl text-yale-blue font-bold mb-6 underline decoration-golden-bronze decoration-4">
                Our Vision
                </h2>
                <p className="text-2xl text-yale-blue">
                Our vision is a nation where government officials exercise decency and accountability,
                fostering a government that secures a safe, healthy, and peaceful future for our nation and the world.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
                {visionImages.length ? visionImages.map(img => (
                <img key={img._id} src={img.url} alt="Vision" className="rounded-2xl border-4 border-golden-bronze shadow-lg max-w-full" />
                )) : <p className="text-gray-500">No vision images uploaded yet.</p>}
            </div>
            </div>
        </div>

        {/* ================= Mission Section (FLIPPED) ================= */}
        <div className="bg-porcelain py-16 px-8 border-b border-stone-taupe">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-wrap justify-center gap-4 md:order-1 order-2">
                {missionImages.length ? missionImages.map(img => (
                <img key={img._id} src={img.url} alt="Mission" className="rounded-2xl border-4 border-golden-bronze shadow-lg max-w-full" />
                )) : <p className="text-gray-500">No mission images uploaded yet.</p>}
            </div>
            <div className="md:order-2 order-1">
                <h2 className="text-4xl text-yale-blue font-bold mb-6 underline decoration-golden-bronze decoration-4">
                Our Mission
                </h2>
                <p className="text-2xl text-yale-blue">
                Our mission is to empower people to demand and achieve the highest standards of decency
                and ethics in government through education, advocacy, and grassroots engagement.
                </p>
            </div>
            </div>
        </div>

        {/* ================= Core Values Grid ================= */}
        <div className="bg-misty-linen py-16 px-8 border-b border-stone-taupe">
            <h2 className="font-bold text-4xl text-yale-blue text-center mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-warm-parchment border-2 border-golden-bronze shadow-lg p-4">
                    <CardHeader className="text-center font-bold text-2xl text-graphite">Integrity</CardHeader>
                    <CardContent className="text-center">
                        We uphold the highest ethical standards, ensuring honesty and transparency in all our actions to build public trust.
                    </CardContent>
                    </Card>

                    <Card className="bg-warm-parchment border-2 border-golden-bronze shadow-lg p-4">
                    <CardHeader className="text-center font-bold text-2xl text-graphite">Accountability</CardHeader>
                    <CardContent className="text-center">
                        We take responsibility for our actions and decisions and work to ensure all public officials and governmental employees are held to the same standard.
                    </CardContent>
                    </Card>

                    <Card className="bg-warm-parchment border-2 border-golden-bronze shadow-lg p-4">
                    <CardHeader className="text-center font-bold text-2xl text-graphite">Non-partisanship</CardHeader>
                    <CardContent className="text-center">
                        We focus on principles of fair governance rather than party politics to find common ground and unity.
                    </CardContent>
                    </Card>

                    <Card className="bg-warm-parchment border-2 border-golden-bronze shadow-lg p-4">
                    <CardHeader className="text-center font-bold text-2xl text-graphite">Respect</CardHeader>
                    <CardContent className="text-center">
                        We treat everyone with dignity, respect, and professionalism, encouraging civil debate and seeking common values even amidst disagreement.
                    </CardContent>
                    </Card>

                    <Card className="bg-warm-parchment border-2 border-golden-bronze shadow-lg p-4">
                    <CardHeader className="text-center font-bold text-2xl text-graphite">Decency and Fairness</CardHeader>
                    <CardContent className="text-center">
                        We believe in treating everyone with the common decency they deserve, ensuring all our efforts are guided by principles of fairness and equity.
                    </CardContent>
                    </Card>

                    <Card className="bg-warm-parchment border-2 border-golden-bronze shadow-lg p-4">
                    <CardHeader className="text-center font-bold text-2xl text-graphite">Democracy</CardHeader>
                    <CardContent className="text-center">
                        We are dedicated to strengthening and safeguarding our Constitution and democratic institutions, norms, and values for a better quality of life for all.
                    </CardContent>
                    </Card>

                    <Card className="bg-warm-parchment border-2 border-golden-bronze shadow-lg p-4">
                    <CardHeader className="text-center font-bold text-2xl text-graphite">Collaboration</CardHeader>
                    <CardContent className="text-center">
                        We work with diverse groups and individuals, leveraging the strengths of each to create lasting change.
                    </CardContent>
                    </Card>

                    <Card className="bg-warm-parchment border-2 border-golden-bronze shadow-lg p-4">
                    <CardHeader className="text-center font-bold text-2xl text-graphite">Courage</CardHeader>
                    <CardContent className="text-center">
                        We stand firm against political pressure and advocate for what is right, even when it is personally, professionally, or politically difficult.
                    </CardContent>
                    </Card>
            </div>
        </div>

        {/* ================= Our Story Section ================= */}
        <div className="bg-alice-blue py-16 px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-4xl text-graphite font-bold mb-4">Our Story</h2>
                <p className="text-xl text-graphite">
                United for Decency in Government was founded in 2026 and has since been leading the charge in
                holding the government accountable.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
                {storyImages.length ? storyImages.map(img => (
                <img key={img._id} src={img.url} alt="Our Story" className="rounded-2xl border-4 border-golden-bronze max-w-full" />
                )) : <p className="text-gray-500">No story images uploaded yet.</p>}
            </div>
            </div>
        </div>

        {/* ================= Call to Action ================= */}
        <div className="bg-alice-blue py-16 px-8 text-center">
            <Card className="border-0 drop-shadow-2xl lg:max-w-2/4 md:max-w-[70vw] m-auto p-8">
            <CardHeader>
                <CardTitle className="text-yale-blue text-3xl font-bold mb-4">Want to get involved?</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg mb-8">
                Ready to take the initiative to bring back decency to the government and hold your public officials accountable? 
                Check out our Impact page to see how you can join us in making a difference.
                </p>
                <Button
                className="bg-brick-ember hover:bg-oxblood-shadow text-white font-bold rounded-full py-5 px-10 flex items-center justify-center gap-2 m-auto cursor-pointer transition"
                onClick={() => {window.location.href="/impact"}}
                >
                Join Us
                <ArrowUpRightIcon />
                </Button>
            </CardContent>
            </Card>
        </div>
        </section>
    );
}