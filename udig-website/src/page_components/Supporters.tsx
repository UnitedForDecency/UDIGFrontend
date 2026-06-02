import { type TokenProp } from "@/App";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

type SupporterAccount = {
    _id?: string;
    name?: string;
    email?: string;
    zip?: string;
};

type DisplaySupporter = {
    id: string;
    name: string;
    email: string;
    city: string;
    state: string;
};

async function getCityStateFromZip(zip: string): Promise<{ city: string; state: string }> {
    const apiKey = import.meta.env.VITE_GOOGLEMAPS_API_KEY;
    try {
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&key=${apiKey}`
        );
        const data = await res.json();
        const components = data.results[0]?.address_components ?? [];
        const city = components.find((c: any) =>
            c.types.includes('locality') || c.types.includes('postal_town')
        )?.long_name ?? '';
        const state = components.find((c: any) =>
            c.types.includes('administrative_area_level_1')
        )?.short_name ?? '';
        return { city, state };
    } catch {
        return { city: '', state: '' };
    }
}

export default function Leadership({ token }: TokenProp) {
    const [displaySupporters, setDisplaySupporters] = useState<DisplaySupporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/supporter`
                );

                const data: SupporterAccount[] = Array.isArray(res.data) ? res.data : [];

                const withLocations = await Promise.all(
                    data.map(async (s) => {
                        const { city, state } = s.zip
                            ? await getCityStateFromZip(s.zip)
                            : { city: '', state: '' };
                        return {
                            id: s._id ?? s.email ?? crypto.randomUUID(),
                            name: s.name ?? 'Unknown',
                            email: s.email ?? 'No email',
                            city: city || 'Unknown',
                            state: state || 'Unknown',
                        };
                    })
                );

                setDisplaySupporters(withLocations);
            } catch (err) {
                console.error("Failed to fetch supporter data:", err);
                setError("Failed to load supporters.");
                setDisplaySupporters([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <section className="bg-alice-blue min-h-screen">
            <div className="text-center py-20">
                <h1 className="text-5xl font-bold text-yale-blue underline decoration-brick-ember underline-offset-4">
                    Our Supporters
                </h1>
                <p className="text-xl text-graphite max-w-2xl mx-auto mt-4">
                    Meet the people standing behind our mission and empowering communities nationwide.
                </p>
            </div>

            {error && (
                <div className="max-w-4xl mx-auto px-4 mb-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center py-24">
                    <div className="w-10 h-10 border-4 border-golden-bronze border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!loading && (
                <div className="max-w-6xl mx-auto px-4 pb-20">
                    {displaySupporters.length === 0 ? (
                        <p className="text-center text-graphite text-lg py-12">No supporters yet.</p>
                    ) : (
                        <Card className="shadow-lg border-2 border-midnight-slate">
                            <CardHeader>
                                <CardTitle className="text-xl">Supporters ({displaySupporters.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
                                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                                    Location
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {displaySupporters.map((supporter) => (
                                                <tr key={supporter.id} className="align-top">
                                                    <td className="px-4 py-4 min-w-40">
                                                        <span className="font-medium text-gray-900">
                                                            {supporter.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 min-w-52">
                                                        <span className="text-gray-700">{supporter.email}</span>
                                                    </td>
                                                    <td className="px-4 py-4 min-w-44">
                                                        <span className="text-gray-700">
                                                            {supporter.city && supporter.state
                                                                ? `${supporter.city}, ${supporter.state}`
                                                                : 'Unknown'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <div className="mt-12 text-center">
                        <div className="bg-white border-2 border-midnight-slate rounded-2xl shadow-md p-8 max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-yale-blue mb-4">
                                Want to Connect With Our Community?
                            </h2>
                            <p className="text-graphite text-lg mb-6">
                                Meet more members, collaborate on initiatives, and get involved with
                                people making a difference nationwide.
                            </p>
                            <Link
                                to="/get-involved/community"
                                className="inline-flex items-center rounded-xl bg-yale-blue px-6 py-3 text-white font-semibold shadow hover:bg-blue-900 transition-colors duration-200"
                            >
                                Visit Our Community
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}