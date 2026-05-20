import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Contribute() {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <section className="flex flex-col items-center bg-alice-blue w-full">

            {/* INTRO */}
            <div className="w-full py-20 px-6 flex justify-center">
                <div className="max-w-4xl text-center space-y-6">
                    <h1 className="text-4xl font-bold underline underline-offset-4 decoration-brick-ember">
                        Want to make a difference?
                    </h1>
                    <p className="text-lg leading-relaxed">
                        We are all fed up with abuses of power by government officials of all political stripes,
                        with <span className="font-bold">partisanship and self-interest taking priority over principle and the public interest.</span>
                        Oftentimes it even seems that meanness, spite, and retribution are the sole motivations for much that is done by government officials.
                    </p>

                    {/* CONTRIBUTE Dialog (Intro) */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="mt-4 rounded-2xl text-lg px-10 py-6 bg-yale-blue hover:bg-yale-blue/90 shadow-xl transition">
                                CONTRIBUTE
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl p-8">
                            <DialogHeader className="space-y-4 text-center">
                                <DialogTitle className="text-2xl font-bold">Make a Contribution</DialogTitle>
                                <DialogDescription asChild>
                                    <div className="space-y-6">
                                        <p className="text-base text-graphite">
                                            Thank you for supporting decency, accountability, and principled leadership.
                                            Every contribution strengthens our collective voice.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <Button
                                                onClick={() => window.location.href = "https://www.convergepay.com/hosted-payments?ssl_txn_auth_token=gx5dzPhNSYKkdyCgBupkOgAAAZu0zKXp"}
                                                className="h-14 text-lg font-semibold bg-porcelain border-2 border-yale-blue text-yale-blue hover:bg-alice-blue transition"
                                            >
                                                $5
                                            </Button>
                                            <Button
                                                onClick={() => window.location.href = "https://www.convergepay.com/hosted-payments?ssl_txn_auth_token=RZPwPY0ySBOVallVXMcM5AAAAZu0zy2G"}
                                                className="h-14 text-lg font-semibold bg-porcelain border-2 border-yale-blue text-yale-blue hover:bg-alice-blue transition"
                                            >
                                                $25
                                            </Button>
                                            <Button
                                                onClick={() => window.location.href = "https://www.convergepay.com/hosted-payments?ssl_txn_auth_token=pFCvbs%2FZQnerwUVx8L6%2BkAAAAZu00SwX"}
                                                className="h-14 text-lg font-semibold bg-porcelain border-2 border-yale-blue text-yale-blue hover:bg-alice-blue transition"
                                            >
                                                $50
                                            </Button>
                                            <Button
                                                onClick={() => window.location.href = "https://www.convergepay.com/hosted-payments?ssl_txn_auth_token=ru5VdHqtQ86dzDb%2Fhid9DAAAAZu00nZl"}
                                                className="h-14 text-lg font-semibold bg-porcelain border-2 border-yale-blue text-yale-blue hover:bg-alice-blue transition"
                                            >
                                                $100
                                            </Button>
                                        </div>
                                        <div className="pt-4">
                                            <Button
                                                onClick={() => window.location.href = "https://www.convergepay.com/hosted-payments?ssl_txn_auth_token=Ue1E8EBeQueN1HmsCT1K6QAAAZrl7WHA"}
                                                className="w-full h-14 text-lg font-semibold bg-yale-blue text-white hover:bg-yale-blue/90 transition"
                                            >
                                                OTHER AMOUNT
                                            </Button>
                                        </div>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* COLLAPSIBLE CONTENT AREA */}
            <div className="w-full py-20 px-6 flex justify-center">
                <div className="max-w-4xl w-full space-y-6">

                    {/* HELP UDIG */}
                    <div className="border border-yale-blue rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
                        <button
                            onClick={() => toggleSection("help")}
                            className="w-full flex justify-between items-center px-6 py-5 bg-porcelain transition font-bold text-2xl"
                        >
                            Please help UDIG
                            <span className={`transition-transform duration-300 ${openSection === "help" ? "rotate-180" : "rotate-0"}`}>▼</span>
                        </button>
                        {openSection !== "help" && (
                            <p className="px-6 py-2 text-sm text-graphite italic bg-porcelain">
                                Learn how you can expose indecency and organize for real change.
                            </p>
                        )}
                        {openSection === "help" && (
                            <div className="px-6 py-6 space-y-8 bg-white">
                                <ul className="list-disc list-inside space-y-3 text-lg">
                                    <li>Expose indecency by government officials in local, state, and federal governments.</li>
                                    <li>Raise awareness among the public about what can be done to restore decency and reduce unnecessary divisiveness.</li>
                                    <li>Organize people throughout the nation to effectively demand far greater decency, including accountability, on the part of government officials.</li>
                                </ul>
                                <p className="text-lg leading-relaxed">
                                    United for Decency in Government (UDIG) was recently founded to help people of various political
                                    stripes organize in a <span className="font-bold">non-partisan fashion</span> to make a real difference.
                                    <span className="font-bold"> We will amplify your individual voice into a loud collective roar for real change.</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* WE NEED YOU */}
                    <div className="border border-yale-blue rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
                        <button
                            onClick={() => toggleSection("need")}
                            className="w-full flex justify-between items-center px-6 py-5 bg-porcelain transition font-bold text-2xl"
                        >
                            We need you
                            <span className={`transition-transform duration-300 ${openSection === "need" ? "rotate-180" : "rotate-0"}`}>▼</span>
                        </button>
                        {openSection !== "need" && (
                            <p className="px-6 py-2 text-sm text-graphite italic bg-porcelain">
                                Find out how you can join others in demanding accountability.
                            </p>
                        )}
                        {openSection === "need" && (
                            <div className="px-6 py-6 space-y-6 bg-white">
                                <p className="text-lg leading-relaxed">
                                    Do you agree that decency is in too short a supply in our government?
                                    <span className="font-bold"> Do you want to join your voice with others throughout the nation to demand far better of our elected officials?</span>
                                </p>
                                <p className="text-lg leading-relaxed">
                                    Are you frustrated and even angry about the divisiveness in our nation and the
                                    <span className="font-bold"> frequent dishonesty, corruption, undermining of the public interest, and lack of accountability by local, state, and federal government officials?</span>
                                </p>
                                <p className="text-lg leading-relaxed">
                                    Elected representatives, from both major parties, too often serve only their own interests or those of their major funders.
                                    <span className="font-bold"> Do you want to join with others in calling for their accountability?</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* FINAL MESSAGE */}
                    <div className="border border-yale-blue rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
                        <button
                            onClick={() => toggleSection("final")}
                            className="w-full flex justify-between items-center px-6 py-5 bg-porcelain transition font-bold text-2xl"
                        >
                            Please contribute today
                            <span className={`transition-transform duration-300 ${openSection === "final" ? "rotate-180" : "rotate-0"}`}>▼</span>
                        </button>
                        {openSection !== "final" && (
                            <p className="px-6 py-2 text-sm text-graphite italic bg-porcelain">
                                See how collective action can make a real difference.
                            </p>
                        )}
                        {openSection === "final" && (
                            <div className="px-6 py-6 space-y-6 bg-white text-center">
                                <p className="text-2xl font-bold">Please contribute today!</p>
                                <p className="text-lg">Only if we each do our part can we achieve the changes we so badly need.</p>
                                <p className="text-xl font-bold">We CAN do this — together!</p>
                                <p className="text-lg leading-relaxed">
                                    We-the-people — organizing, working, and advocating together, regardless of our partisan
                                    differences — can demand and achieve
                                    <span className="font-bold"> a more honest, accountable, compassionate government that truly serves the interests of the public,</span> not just the interests of politicians and the demands of wealthy contributors.
                                </p>
                                <p className="text-lg leading-relaxed">
                                    Please join UDIG, a non-partisan organization, in raising awareness about what we can all
                                    do, as we organize and act together,
                                    <span className="font-bold"> to transform each of our lone voices into a collective roar for real change.</span>
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </section>
    );
}