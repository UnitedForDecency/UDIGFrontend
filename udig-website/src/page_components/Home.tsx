import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button.tsx";
import { X } from 'lucide-react';
import { useState } from "react";
import DualCarousel from "@/components/ui/DualCarousel.tsx";

export default function Home() {
    const [showPopup, setShowPopup] = useState(true);

    const handleDismiss = () => {
        setShowPopup(false);
    };

    return (
        <div>
            {/* UDIG intro section */}
            <section className="relative w-full h-[600px] flex items-center justify-center border-b border-stone-taupe overflow-hidden">            
                {/* Carousel as background */}
                
                <DualCarousel page="home" />
                <div className="absolute inset-0 bg-yale-blue opacity-40" />
                <div className="absolute inset-0 bg-black/20" />

                {/* Header content */}
                <div className="absolute relative z-20 text-center py-12 bg-white/75 backdrop-blur-xl rounded-2xl shadow-2xl px-6">
                    <h1 className="text-yale-blue text-4xl font-bold mb-4">
                        Stand United for Decency.
                    </h1>
                    <p className="text-black max-w-2xl mx-auto mb-6">
                        As American citizens, it is our right and duty to demand the highest standards of decency and ethics in our
                        government officials. United for Decency in Government is a nonpartisan movement striving to secure a safe, healthy, and peaceful future
                        by fostering decency and accountability in our nation.
                    </p>
                    <div>
                        <Button 
                            className="rounded-full mx-3 p-6 bg-yale-blue cursor-pointer transition hover:bg-deep-harbor"
                            onClick={() => { window.location.href = "/get-involved"; }}
                        >
                            Join the Movement
                        </Button>
                        <Button
                            className="rounded-full mx-3 p-6 bg-brick-ember text-white cursor-pointer transition hover:bg-oxblood-shadow"
                            onClick={() => { window.location.href = "/about"; }}
                        >
                            Our Story
                        </Button>
                    </div>
                </div>
            </section>

            {/* Overviews & Statistics */}
            <section className="bg-misty-linen py-20">
                {/* Impact blurbs */}
                <div className="w-full flex flex-col items-center mb-20">
                    <h2 className="text-yale-blue text-3xl font-bold mb-12">People Powering Decency</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Card className="w-65 sm:w-[60vw] md:w-[20vw] bg-alice-blue rounded-2xl shadow-xl p-6 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                            <CardHeader>
                                <CardTitle className="font-bold text-yale-blue text-xl mb-2">Stories That Matter</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-700">
                                    From classrooms to city halls, discover how everyday people are choosing decency—and
                                    changing their communities for the better.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="w-65 sm:w-[60vw] md:w-[20vw] bg-alice-blue rounded-2xl shadow-xl p-6 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                            <CardHeader>
                                <CardTitle className="font-bold text-yale-blue text-xl mb-2">Decency Champions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-700">
                                    Meet the individuals and groups leading with courage, respect, and
                                    integrity in public life.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="w-65 sm:w-[60vw] md:w-[20vw] bg-alice-blue rounded-2xl shadow-xl p-6 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                            <CardHeader>
                                <CardTitle className="font-bold text-yale-blue text-xl mb-2">UDIG in Action</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-700">
                                    See how our programs, campaigns, and events turn shared values into
                                    meaningful action.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Statistics */}
                <div className="w-full flex flex-col items-center mb-20">
                    <h2 className="text-yale-blue text-3xl font-bold mb-12">Our Wins, Shared</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Card className="w-65 sm:w-[60vw] md:w-[20vw] bg-porcelain rounded-2xl shadow-xl py-10 px-6 border-t-4 border-t-brick-ember transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                            <CardHeader>
                                <CardTitle className="font-bold text-3xl text-yale-blue mb-2">120+</CardTitle>
                                <CardDescription className="text-gray-700">Community Events Hosted</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="w-65 sm:w-[60vw] md:w-[20vw] bg-porcelain rounded-2xl shadow-xl py-10 px-6 border-t-4 border-t-brick-ember transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                            <CardHeader>
                                <CardTitle className="font-bold text-3xl text-yale-blue mb-2">45</CardTitle>
                                <CardDescription className="text-gray-700">Essay Contest Winners</CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="w-65 sm:w-[60vw] md:w-[20vw] bg-porcelain rounded-2xl shadow-xl py-10 px-6 border-t-4 border-t-brick-ember transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                            <CardHeader>
                                <CardTitle className="font-bold text-3xl text-yale-blue mb-2">30k</CardTitle>
                                <CardDescription className="text-gray-700">Engaged Supporters Nationwide</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* Call to action pop-up */}
                {showPopup && (
                    <Card className="fixed lg:w-1/4 sm:w-2/4 border-2 border-golden-bronze bg-brick-ember bottom-4 left-4 p-4 text-center rounded-2xl shadow-2xl animate-fadeIn">
                        <CardHeader>
                            <div className="flex -mr-5 justify-end">
                                <X onClick={handleDismiss} className="cursor-pointer hover:text-gray-300 transition-colors"/>
                            </div>
                            <h3 className="text-white text-xl">Your voice matters here.</h3>
                        </CardHeader>
                        <CardDescription>
                            <p className="text-white">
                                Whether you volunteer, advocate, or support our work, your involvement helps build a more
                                respectful and accountable future
                            </p>
                            <Button className="m-2 bg-yale-blue cursor-pointer transition hover:bg-deep-harbor" onClick={() => (window.location.href = "/get-involved/")}>
                                Take Action
                            </Button>
                        </CardDescription>
                    </Card>
                )}
            </section>
        </div>
    )
}