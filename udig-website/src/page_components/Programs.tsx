import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { type ImageType } from "@/page_components/Admin/ImagesAdmin"

export default function Programs() {
    const [headerImages, setHeaderImages] = useState<ImageType[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
                try {
                const res = await fetch(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images?page=programs`
                );
                const data = await res.json();
                setHeaderImages(data);
            } catch (err) {
                console.error("Failed to fetch Programs header images:", err);
            }
        };
        fetchImages();
    }, []);

    return (
        <div>

        {/* ================= ESSAY CONTEST HERO ================= */}
        <section className="relative w-full h-[520px] flex items-center justify-center overflow-hidden border-b border-graphite">

            {/* Background image */}
            {headerImages.length > 0 && (
                <img
                    src={headerImages[0].url}
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

                <p className="text-graphite text-lg mb-8">
                    Have strong ideas you want to share? One of the best ways is to submit an essay
                    to a contest run either by UDIG or a collaborating organization. Essay contests
                    can be local, state-wide, or national, and are judged by credible authorities.
                </p>

                <Button className="rounded-full px-8 py-6 bg-yale-blue hover:bg-deep-harbor transition cursor-pointer">
                    Find Contests to Enter
                </Button>

            </div>
        </section>

        {/* ================= FEATURED ESSAYS ================= */}
        <section className="bg-white w-full flex flex-col items-center pb-20 border-b border-stone-taupe">
            <div>
            <h2 className="text-yale-blue text-3xl font-bold pt-10 mt-10 mb-4">
                Winning Essays
            </h2>

            <Carousel
                className="drop-shadow-2xl mt-10 md:max-w-300 sm:max-w-[70vw]"
                opts={{ align: "start", loop: true }}
            >
                <CarouselContent className="ml-10">

                {/* Essay 1 */}
                <CarouselItem className="lg:basis-1/3 md:basis-1/2 pl-0 max-w-100">
                    <Card className="w-85 h-65 border-0 text-left bg-warm-parchment border-1 border-stone-taupe">
                    <CardHeader>
                        <CardTitle className="font-bold text-yale-blue pb-0">Essay 1</CardTitle>
                        <CardTitle className="font-bold text-yale-blue pb-0">City, State</CardTitle>
                        <CardTitle className="font-bold text-yale-blue pb-0">Name LastName</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                        </CardDescription>
                    </CardContent>
                    </Card>
                </CarouselItem>

                {/* Essay 2 */}
                <CarouselItem className="lg:basis-1/3 md:basis-1/2 pl-0 max-w-100">
                    <Card className="w-85 h-65 border-0 text-left bg-warm-parchment border-1 border-stone-taupe">
                    <CardHeader>
                        <CardTitle className="font-bold text-yale-blue pb-0">Essay 2</CardTitle>
                        <CardTitle className="font-bold text-yale-blue pb-0">National</CardTitle>
                        <CardTitle className="font-bold text-yale-blue pb-0">Name LastName</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                        </CardDescription>
                    </CardContent>
                    </Card>
                </CarouselItem>

                {/* Essay 3 */}
                <CarouselItem className="lg:basis-1/3 md:basis-1/2 pl-0 max-w-100">
                    <Card className="w-85 h-65 border-0 text-left bg-warm-parchment border-1 border-stone-taupe">
                    <CardHeader>
                        <CardTitle className="font-bold text-yale-blue pb-0">Essay 3</CardTitle>
                        <CardTitle className="font-bold text-yale-blue pb-0">City, State</CardTitle>
                        <CardTitle className="font-bold text-yale-blue pb-0">Name LastName</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                        </CardDescription>
                    </CardContent>
                    </Card>
                </CarouselItem>

                {/* Essay 4 */}
                <CarouselItem className="lg:basis-1/3 md:basis-1/2 pl-0 max-w-100">
                    <Card className="w-85 h-65 border-0 text-left bg-warm-parchment border-1 border-stone-taupe">
                    <CardHeader>
                        <CardTitle className="font-bold text-yale-blue pb-0">Essay 4</CardTitle>
                        <CardTitle className="font-bold text-yale-blue pb-0">State</CardTitle>
                        <CardTitle className="font-bold text-yale-blue pb-0">Name LastName</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                        </CardDescription>
                    </CardContent>
                    </Card>
                </CarouselItem>

                </CarouselContent>

                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

            <Button
                className="rounded-full mx-3 mt-8 p-6 bg-yale-blue hover:bg-deep-harbor transition cursor-pointer"
                onClick={() => (window.location.href = "/programs/essays")}
            >
                See All
            </Button>
            </div>
        </section>

        {/* ================= PRESENTATIONS ================= */}
        <section className="w-full flex flex-col items-center pb-20">
            <div>
            <h2 className="text-yale-blue text-3xl font-bold pt-10 mt-10 mb-4">
                Our Latest Presentations
            </h2>

            <Carousel
                className="drop-shadow-2xl/30 mt-10 md:max-w-300 sm:max-w-[70vw]"
                opts={{ align: "start", loop: true }}
            >
                <CarouselContent className="ml-12">

                <CarouselItem className="lg:basis-1/3 md:basis-1/2 pl-0">
                    <iframe
                    className="w-80 h-45 rounded-xl"
                    src="https://www.youtube.com/embed/ECPGenexyKM"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                </CarouselItem>

                <CarouselItem className="lg:basis-1/3 md:basis-1/2 pl-0">
                    <iframe
                    className="w-80 h-45 rounded-xl"
                    src="https://www.youtube.com/embed/4j7F-AHA4jU"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                </CarouselItem>

                <CarouselItem className="lg:basis-1/3 md:basis-1/2 pl-0">
                    <iframe
                    className="w-80 h-45 rounded-xl"
                    src="https://www.youtube.com/embed/3nm6SHQvgJ0"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                </CarouselItem>

                <CarouselItem className="lg:basis-1/3 md:basis-1/2 pl-0">
                    <iframe
                    className="w-80 h-45 rounded-xl"
                    src="https://www.youtube.com/embed/nGiL8i6eAe8"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    />
                </CarouselItem>

                </CarouselContent>

                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

            <Button
                className="rounded-full mx-3 mt-8 p-6 bg-yale-blue hover:bg-deep-harbor transition cursor-pointer"
                onClick={() => window.open("https://www.youtube.com/@highroad4hr")}
            >
                Go to Channel
            </Button>
            </div>
        </section>

        </div>
    );
}