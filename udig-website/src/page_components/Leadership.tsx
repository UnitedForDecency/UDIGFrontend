import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { type Leader, type Partner, getLeaders, getPartners } from "./Admin/LeaderAPI";

export default function Leadership() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leadersData, partnersData] = await Promise.all([
                    getLeaders(),
                    getPartners(),
                ]);
                setLeaders(Array.isArray(leadersData) ? leadersData : []);
                setPartners(Array.isArray(partnersData) ? partnersData : []);
            } catch (err) {
                console.error("Failed to fetch leadership data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <section className="bg-alice-blue">

            {/* Header */}
            <div className="text-center py-20">
                <h1 className="text-5xl font-bold text-yale-blue underline decoration-brick-ember underline-offset-4">
                    Our Leadership
                </h1>
                <p className="text-xl text-graphite max-w-2xl mx-auto mt-4">
                    Meet the people guiding our mission and empowering communities nationwide.
                </p>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-24">
                    <div className="w-10 h-10 border-4 border-golden-bronze border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Leaders Section */}
            {!loading && (
                <div className="max-w-6xl mx-auto px-4 pb-20">
                    {leaders.length === 0 && (
                        <p className="text-center text-graphite text-lg py-12">No leaders yet.</p>
                    )}
                    {leaders.map((leader, idx) => (
                        <div
                            key={leader._id}
                            className={`flex flex-col md:flex-row items-center mb-16 p-8 rounded-2xl shadow-lg border-2 border-midnight-slate ${
                                idx % 2 === 0 ? "bg-porcelain" : "bg-burnt-crimson/90"
                            } ${idx % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                        >
                            <div className="flex justify-center md:w-1/2">
                                {leader.imageUrl ? (
                                    <img
                                        src={leader.imageUrl}
                                        alt={leader.name}
                                        className="rounded-2xl w-64 h-64 object-cover shadow-xl"
                                    />
                                ) : (
                                    <div className="rounded-2xl w-64 h-64 bg-gray-200 flex items-center justify-center shadow-xl">
                                        <span className="text-gray-400 text-5xl">👤</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center text-center md:text-left md:w-1/2 px-5">
                                <h2 className="text-2xl font-bold text-yale-blue">{leader.name}</h2>
                                <p className="text-lg text-graphite mb-4">{leader.title}</p>
                                <p className="text-graphite">{leader.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Partners Carousel */}
            {!loading && partners.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 pb-20">
                    <h2 className="text-4xl font-bold text-yale-blue text-center mb-10">Our Partners</h2>
                    <Carousel className="w-full">
                        <CarouselContent className="-ml-1">
                            {partners.map((partner) => (
                                <CarouselItem key={partner._id} className="pl-1 md:basis-1/2 lg:basis-1/4">
                                    <Card className="border-2 border-golden-bronze shadow-lg rounded-xl flex flex-col items-center p-4">
                                        {partner.imageUrl ? (
                                            <img
                                                src={partner.imageUrl}
                                                alt={partner.name}
                                                className="w-36 h-36 object-cover rounded-full mb-4"
                                            />
                                        ) : (
                                            <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                                                <span className="text-gray-400 text-4xl">🤝</span>
                                            </div>
                                        )}
                                        <p className="text-graphite font-semibold text-center">{partner.name}</p>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            )}
        </section>
    );
}
