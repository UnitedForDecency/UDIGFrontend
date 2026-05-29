import {useEffect, useState} from "react";
import axios, {AxiosError} from "axios";
import {notifyApiError} from "@/App";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {Button} from "@/components/ui/button";

type Image = {
    id: string;
    imageData: string;
    type: string;
    section: string;
};

type Essay = Readonly<{
    id: string;
    title: string;
    author: string;
    content: string;
    featured: string;
    createdAt: Date;
    writtenAt: Date;
}>;

/**
 * A string array of Youtube video IDs.
 * 
 * NOTE: For anyone who is trying to add new IDs to this list,
 * but doesn't know how to get the ID of a video, the ID can be
 * extracted from a Youtube URL.  
 * Use the following example URLs to know which part of the URL
 * is the ID.
 * In the examples, `{ID}` is used to represent the portion that
 * is the ID
 * - `www.youtube.com/watch?v={ID}`
 * - `www.youtube.com/embed/{ID}`
 * - `www.youtube-nocookie.com/embed/{ID}`
 * - `m.youtube.com/watch?v={ID}`
 * - `youtu.be/{ID}`
 */
const PresentationIds: readonly string[] = [
    "ECPGenexyKM",
    "4j7F-AHA4jU",
    "3nm6SHQvgJ0",
    "nGiL8i6eAe8"
];

/**
 * You might be wondering "Why is this function needed?"
 * 
 * It is needed because dates are serialized to strings
 * when sent over the network, meaning that we have to
 * deserialize them back into date objects in order
 * to use them properly
 * @param essay An essay received from over the network
 * @returns The {@link essay} with its date strings converted into date objects
 */
function convertStringToDate(essay: any): any {
    if(essay.createdAt !== undefined && typeof essay.createdAt === "string") {
        essay.createdAt = new Date(essay.createdAt);
    }

    if(essay.writtenAt !== undefined && typeof essay.writtenAt === "string") {
        essay.writtenAt = new Date(essay.writtenAt);
    }

    return essay;
}

export default function Programs() {
    const controllerUrl: string = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const [headerImageData, setHeaderImageData] = useState<string | null>(null);

    const maxFeaturedEssays: number = 6;
    const [featuredEssays, setFeaturedEssays] = useState<Essay[]>([]);

    const fetchImages = async (): Promise<void> => {
        try {
            return axios.get<Image[]>(
                `${controllerUrl}/images/type/programs`
            ).then(res => {
                const image = res.data.at(0);

                if(image !== undefined) {
                    if(image.section === "programHeaderImage") {
                        setHeaderImageData(image.imageData);
                    }
                }
            }, (err: AxiosError) => {
                notifyApiError(err, "fetch header image");
            });
        } catch(err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const fetchEssays = async (): Promise<void> => {
        try {
            return axios.get<Essay[]>(
                `${controllerUrl}/essays/featured`
            ).then(res => {
                let essays: Essay[] = res.data.map(e => convertStringToDate(e));

                if(essays.length > 0) {
                    essays.sort((a, b): number => {
                        if(a.createdAt > b.createdAt) {
                            return -1;
                        } else if(b.createdAt > a.createdAt) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });

                    if(essays.length > maxFeaturedEssays) {
                        essays = essays.slice(0, maxFeaturedEssays);
                    }
                }

                setFeaturedEssays(essays);
            }, (err: AxiosError) => {
                notifyApiError(err, "fetch featured essays");
            });
        } catch(err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    useEffect(() => {
        fetchImages();
        fetchEssays();
    }, []);

    return (
        <div>
            {/* ================= ESSAY CONTEST HERO ================= */}
            <section className="relative w-full h-130 flex items-center justify-center overflow-hidden border-b border-graphite">
                {/* Background image */}
                {headerImageData !== null && (
                    <img
                        src={`data:image/png;base64,${headerImageData}`}
                        alt="Programs Header"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-yale-blue opacity-30" />

                {/* Content */}
                <div className="relative z-10 px-10 py-12 bg-white/60 backdrop-blur-xl border border-white/75 rounded-3xl shadow-2xl max-w-2xl text-center">
                    <h1 className="text-yale-blue text-4xl font-bold underline decoration-brick-ember underline-offset-4 mb-6">
                        Essay Contests
                    </h1>
                    <p className="text-primary text-lg mb-8">
                        Have strong ideas you want to share? One of the best ways is to submit an essay
                        to a contest run either by UDIG or a collaborating organization. Essay contests
                        can be local, state-wide, or national, and are judged by credible authorities.
                    </p>
                    <Button
                        className="rounded-full px-8 py-6 transition bg-yale-blue hover:bg-deep-harbor"
                        asChild={true}
                    >
                        <a href="/programs/contests">Find Contests to Enter</a>
                    </Button>
                </div>
            </section>

            {/* ================= FEATURED ESSAYS ================= */}
            <section className="bg-white w-full flex flex-col items-center pb-20 border-b border-stone-taupe">
                <h2 className="text-yale-blue text-3xl font-bold pt-10 mt-10 mb-4">
                    Winning Essays
                </h2>
                {featuredEssays.length !== 0 ? (
                    <div>
                        <Carousel
                            className={`drop-shadow-2xl mt-10 max-w-[70vw] ${
                                featuredEssays.length === 1 ? (
                                    "w-58 sm:w-95.5"
                                ) : featuredEssays.length === 2 ? (
                                    "w-116 sm:w-191"
                                ) : /* featuredEssays.length >= 3 */ (
                                    "w-116 sm:w-286.5"
                                )
                            }`}
                            opts={{align: "start", loop: true}}
                        >
                            <CarouselPrevious />
                            <CarouselContent className="ml-0">
                                {featuredEssays.map(essay => (
                                    <CarouselItem
                                        key={essay.id}
                                        className="pl-0 basis-auto"
                                    >
                                        <Card className="w-54 h-65 mx-2 sm:w-85 sm:mx-5.25 gap-4 relative text-left wrap-break-word bg-warm-parchment border-2 border-stone-taupe">
                                            <CardHeader className="block">
                                                <CardTitle className="font-bold text-yale-blue">{essay.title}</CardTitle>
                                                <CardTitle className="font-bold text-yale-blue my-2">{essay.author}</CardTitle>
                                                <CardTitle className="font-bold text-yale-blue">{essay.featured}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription>
                                                    <p>
                                                        {essay.content}
                                                    </p>
                                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-41 sm:w-72 h-16 bg-linear-to-t from-warm-parchment to-transparent" />
                                                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-41 sm:w-72 h-0.5 bg-stone-taupe" />
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselNext />
                        </Carousel>
                        <Button
                            className="rounded-full mx-3 mt-8 p-6 transition bg-yale-blue hover:bg-deep-harbor"
                            asChild={true}
                        >
                            <a href="/programs/essays">See All</a>
                        </Button>
                    </div>
                ) : (
                    <p className="text-primary text-lg">
                        No winning essays yet. <br />
                        Consider joining an {
                            <a
                                className="text-blue-600 hover:underline"
                                href="/programs/contests"
                            >
                                essay&nbsp;contest
                            </a>
                        } and seeing if yours will be the first!
                    </p>
                )}
            </section>

            {/* ================= PRESENTATIONS ================= */}
            <section className="w-full flex flex-col items-center pb-20">
                <h2 className="text-yale-blue text-3xl font-bold pt-10 mt-10 mb-4">
                    Our Latest Presentations
                </h2>
                <Carousel
                    className="drop-shadow-2xl/30 mt-10 w-63 sm:w-288 max-w-[70vw]"
                    opts={{align: "start", loop: true}}
                >
                    <CarouselPrevious />
                    <CarouselContent className="ml-0">
                        {PresentationIds.map(presentationId => (
                            <CarouselItem
                                key={presentationId}
                                className="pl-0 basis-auto"
                            >
                                <iframe
                                    className="w-59 h-33 mx-2 sm:w-80 sm:h-45 sm:mx-8 rounded-xl"
                                    src={`https://www.youtube-nocookie.com/embed/${presentationId}`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselNext />
                </Carousel>
                <Button
                    className="rounded-full mx-3 mt-8 p-6 transition bg-yale-blue hover:bg-deep-harbor"
                    asChild={true}
                >
                    <a href="https://www.youtube.com/@highroad4hr">Go to Channel</a>
                </Button>
            </section>
        </div>
    );
}