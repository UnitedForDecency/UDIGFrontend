import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { type Milestone, getMilestones } from "./Admin/MilestoneAPI";

export default function History() {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const data = await getMilestones();
                if (!Array.isArray(data)) {
                    setMilestones([]);
                    setError("Failed to load milestones.");
                    return;
                }
                setMilestones(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch milestones:", err);
                setError("Failed to load milestones.");
            } finally {
                setLoading(false);
            }
        };
        fetchMilestones();
    }, []);

    return (
        <section className="bg-alice-blue py-20">

            {/* Header */}
            <div className="text-center mb-20 px-4">
                <h1 className="text-5xl font-bold text-yale-blue underline decoration-brick-ember underline-offset-4">
                    Our Story
                </h1>
                <p className="text-xl text-graphite max-w-2xl mx-auto mt-4">
                    A timeline of milestones that shaped our organization.
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-24">
                    <div className="w-10 h-10 border-4 border-golden-bronze border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="text-center py-12 text-brick-ember text-lg">{error}</div>
            )}

            {/* Empty */}
            {!loading && !error && milestones.length === 0 && (
                <div className="text-center py-12 text-graphite text-lg">
                    No milestones yet.
                </div>
            )}

            {/* Timeline container */}
            {!loading && !error && milestones.length > 0 && (
                <div className="relative max-w-5xl mx-auto px-4">

                    {/* Vertical line */}
                    <div className="absolute left-1/2 top-0 h-full w-1 bg-golden-bronze/70 -translate-x-1/2" />

                    {milestones.map((m, idx) => {
                        const isLeft = idx % 2 === 0;

                        return (
                            <div key={m._id} className="relative flex items-center mb-24">

                                {/* LEFT SIDE */}
                                <div className="w-1/2 pr-10 flex justify-end">
                                    {isLeft && <MilestoneCard milestone={m} />}
                                </div>

                                {/* CENTER DOT */}
                                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brick-ember border-4 border-golden-bronze z-10" />

                                {/* RIGHT SIDE */}
                                <div className="w-1/2 pl-10 flex justify-start">
                                    {!isLeft && <MilestoneCard milestone={m} />}
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function MilestoneCard({ milestone: m }: { milestone: Milestone }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="bg-porcelain border-2 border-golden-bronze shadow-xl hover:scale-105 transition cursor-pointer max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl text-yale-blue">
                            {m.year} — {m.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-graphite text-lg">
                        {m.description}
                    </CardContent>
                </Card>
            </DialogTrigger>

            {/* POPUP */}
            <DialogContent className="max-w-2xl bg-porcelain">
                <DialogHeader>
                    <DialogTitle className="text-3xl text-yale-blue">
                        {m.year} — {m.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 text-lg text-graphite">
                    {m.imageUrl && (
                        <img
                            src={m.imageUrl}
                            alt={m.title}
                            className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                    )}
                    <p>{m.details}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
