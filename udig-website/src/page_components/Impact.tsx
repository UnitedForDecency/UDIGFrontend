import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Info } from "lucide-react";
import { motion } from "framer-motion";
import { getImpactCards } from "./Admin/impactAPI";
import type { ImpactCard } from "./Admin/impactAPI";

export default function Impact() {
    const [highlights, setHighlights] = useState<ImpactCard[]>([]);
    const [activeCard, setActiveCard] = useState<ImpactCard | null>(null);
    const [headerImage, setHeaderImages] = useState<any[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/type/impact`);
                const data = await res.json();
                setHeaderImages(formatImages(data));
            } catch (err) {
                console.error("Failed to fetch Impact header images:", err);
            }
        };
        fetchImages();
    }, []);

    const formatImages = (data: any[]) => {
        return data
            .map((img) => ({
                ...img,
                url: `data:${img.mimetype || "image/png"};base64,${img.imageData}`
            }))
            .sort((a, b) => a.order - b.order);
    };

    useEffect(() => {
        const loadImpactCards = async () => {
            try {
                const cards = await getImpactCards();
                setHighlights(cards);
            } catch (error) {
                console.error("Failed to load impact cards:", error);
            }
        };
        loadImpactCards();
    }, []);

    return (
        <section className="w-full">

            {/* ===== HERO HEADER ===== */}
            <div className="relative h-[420px] flex items-center justify-center overflow-hidden border-b border-graphite">

                {headerImage.length > 0 && (
                    <img
                        src={headerImage[0].url}
                        alt="Impact Header"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                <div className="relative z-10 text-center px-6 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl py-12">
                    <h1 className="text-5xl font-bold text-yale-blue mb-4">
                        Our Impact
                    </h1>
                    <p className="text-xl text-black max-w-2xl mx-auto">
                        Turning values into action — and action into results.
                    </p>
                </div> 
            </div>

            {/* ===== IMPACT CARDS ===== */}
            <div className="bg-porcelain py-16 px-4 lg:px-12">
                <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                    {highlights.map((card, idx) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: idx * 0.05,
                            }}
                        >
                            <Card
                                onClick={() => setActiveCard(card)}
                                className="relative cursor-pointer bg-white border-2 border-golden-bronze shadow-lg rounded-2xl hover:scale-105 hover:shadow-2xl transition-transform duration-300 flex flex-col"
                            >
                                {/* Top-right clickable indicator */}
                                <div className="absolute top-3 right-3 bg-yale-blue text-white rounded-full text-xs font-semibold shadow-md flex items-center space-x-1">
                                    <Info className="w-4 h-4" />
                                </div>

                                <CardHeader>
                                    <CardTitle className="text-2xl text-yale-blue font-semibold">
                                    {card.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="text-graphite text-lg flex-1">
                                    {card.summary}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                </div>
            </div>

            {/* ===== MODAL ===== */}
            {activeCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="relative bg-white max-w-xl w-full rounded-2xl shadow-2xl p-8"
                    >
                        <button
                            onClick={() => setActiveCard(null)}
                            className="absolute top-4 right-4 text-graphite hover:text-brick-ember"
                        >
                            <X />
                        </button>

                        <h2 className="text-3xl sm:text-4xl font-bold text-yale-blue mb-6">
                            {activeCard.title}
                        </h2>

                        <p className="text-lg sm:text-xl text-graphite leading-relaxed">
                            {activeCard.description}
                        </p>
                    </motion.div>
                </div>
            )}
        </section>
    );
}