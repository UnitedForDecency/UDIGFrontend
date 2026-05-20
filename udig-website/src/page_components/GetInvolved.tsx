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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState, type KeyboardEvent } from "react"
import GetInvolvedGallery from "@/components/ui/GetInvolvedGallery"
import { type ImageType } from "@/page_components/Admin/ImagesAdmin"

export default function GetInvolved() {
    const [headerImages, setHeaderImages] = useState<ImageType[]>([]);
    const [zipcodeInput, setZipcodeInput] = useState("");

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images?page=getInvolved&section=headerImage`
                );
                const data = await res.json();
                setHeaderImages(data);
            } catch (err) {
                console.error("Failed to fetch Get Involved header images:", err);
            }
        };
        fetchImages();
    }, []);

    const handleInput = (event: KeyboardEvent<HTMLInputElement>) => {
        if (
            ["e", "E", "+", "-", "."].includes(event.key) ||
            (zipcodeInput.length >= 5 &&
                ["0","1","2","3","4","5","6","7","8","9"].includes(event.key))
        ) {
            event.preventDefault()
        }
    }

    return (
        <div className="min-h-screen bg-misty-linen">
            {/* INTRO */}
            <section className="relative w-full h-[520px] flex items-center justify-center overflow-hidden border-b border-graphite">

                {/* Background image */}
                {headerImages.length > 0 && (
                    <img
                        src={headerImages[0].url}
                        alt="Get Involved Header"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-yale-blue opacity-30" />


                {/* Content */}
                <div className="relative z-10 px-10 py-12 bg-white/60 backdrop-blur-xl border border-white/75 rounded-3xl shadow-2xl max-w-2xl text-center">
                    <h1 className="text-yale-blue text-4xl font-bold underline decoration-brick-ember underline-offset-4 mb-6">
                        Getting Involved
                    </h1>

                    <p className="text-graphite text-lg mb-8">
                        Every action adds up, no matter how small. Either as an individual or in an organized movement, every voice adds to the pressure
                        for change and leads to greater decency in government. If you sign up for updates via email or text, we'll let you know about
                        actions you can take in your area to help make a difference.
                    </p>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="rounded-full px-8 py-5 bg-yale-blue hover:bg-deep-harbor transition">
                                Stay Informed
                            </Button>
                        </DialogTrigger>

                        {/* Keep your dialog content unchanged */}
                        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-brick-ember to-alice-blue border-0 shadow-xl">
                            <DialogHeader>
                                <DialogTitle>Opt In to Alerts</DialogTitle>
                                <DialogDescription className="text-graphite">
                                    Subscribe to location-based text or email updates to keep up to date on how you can get involved.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4">
                                <Input
                                    type="number"
                                    placeholder="5-digit ZIP Code"
                                    value={zipcodeInput}
                                    onChange={(e) => setZipcodeInput(e.target.value)}
                                    onKeyDown={handleInput}
                                    className="placeholder:text-graphite"
                                />

                                <div className="flex gap-2">
                                    <Input type="email" placeholder="Email"
                                        className="placeholder:text-graphite" />
                                    <Button type="submit" className="bg-burnt-crimson hover:bg-oxblood-shadow">
                                        Subscribe
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Input type="tel" placeholder="Phone"
                                        className="placeholder:text-graphite"
                                    />
                                    <Button type="submit" className="bg-burnt-crimson hover:bg-oxblood-shadow">
                                        Subscribe
                                    </Button>
                                </div>
                            </div>

                            <DialogFooter className="sm:justify-center mt-6">
                                <DialogClose asChild>
                                    <Button className="bg-deep-harbor hover:bg-midnight-slate">
                                        Done
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
            </section>

            {/* STARTING SMALL */}
            <section className="py-28">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl font-semibold text-yale-blue mb-6 text-left">
                        Starting Small
                    </h2>

                    <p className="max-w-3xl text-black/80 mb-12 text-left">
                        Want to know where to get started? Consider browsing our catalog of active online petitions that you can sign in just a few steps,
                        or sharing posts on social media to help spread awareness for current issues.
                    </p>

                    <Carousel
                        className="drop-shadow-lg"
                        opts={{ align: "start", loop: true }}
                    >
                        <CarouselContent className="flex gap-6 ml-2">
                            {[1,2,3,4].map((item) => (
                                <CarouselItem key={item} className="lg:basis-1/3 md:basis-1/2">
                                    <Card className="border border-golden-bronze bg-white transition hover:shadow-xl duration-300">
                                        <CardHeader>
                                            <CardTitle className="font-semibold text-yale-blue">
                                                Petition {item}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Sign this petition to help drive meaningful change.
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>

                    <div className="mt-10 text-left">
                        <Button
                            className="rounded-full px-8 py-5 bg-burnt-crimson hover:bg-oxblood-shadow transition"
                            onClick={() => (window.location.href = "/get-involved/petitions")}
                        >
                            See All
                        </Button>
                    </div>
                </div>
            </section>

            <GetInvolvedGallery />

            {/* ATTEND EVENTS */}
            <section className="py-28">
                <div className="max-w-4xl mx-auto px-6 text-left">
                    <h2 className="text-2xl font-semibold text-yale-blue mb-6">
                        Attend Events
                    </h2>

                    <p className="text-graphite mb-10">
                        If you're able to do more, consider attending local city council meetings or rallies. Consider writing a letter to the editor or meeting
                        with a legislator to discuss issues you're passionate about. We have many guides to help get you started.
                    </p>

                    <div className="flex flex-wrap gap-6">
                        <Button
                            className="rounded-full px-8 py-5 bg-burnt-crimson hover:bg-oxblood-shadow transition"
                            onClick={() => (window.location.href = "/get-involved/events")}
                        >
                            Find Events Near You
                        </Button>

                        <Button
                            variant="outline"
                            className="rounded-full px-8 py-5 border-burnt-crimson text-burnt-crimson hover:bg-burnt-crimson hover:text-white transition"
                            onClick={() => (window.location.href = "/get-involved/guides")}
                        >
                            Guides to Make Yourself Heard
                        </Button>
                    </div>
                </div>
            </section>

            {/* BECOME A LEADER */}
            <section className="py-28">
                <div className="max-w-4xl mx-auto px-6 text-left">
                    <h2 className="text-2xl font-semibold text-yale-blue mb-6">
                        Become a Leader
                    </h2>

                    <p className="text-black/80 mb-10">
                        Looking to lead the effort for change? Consider volunteering for an organization or campaign, organizing your own rally, or
                        running for office. We can help you find local organizations or learn how to start your own.
                    </p>

                    <div className="flex flex-wrap gap-6">
                        <Button
                            className="rounded-full px-8 py-5 bg-burnt-crimson hover:bg-oxblood-shadow transition"
                            onClick={() => (window.location.href = "/get-involved/volunteer")}
                        >
                            Become a Volunteer
                        </Button>

                        <Button
                            variant="outline"
                            className="rounded-full px-8 py-5 border-burnt-crimson text-burnt-crimson hover:bg-burnt-crimson hover:text-white transition"
                            onClick={() => (window.location.href = "/get-involved/guides")}
                        >
                            Learn how to Lead
                        </Button>
                    </div>
                </div>
            </section>

        </div>
    )
}