import { Button } from "@/components/ui/button";
import DualCarousel from "@/components/ui/DualCarousel";
import { useEffect, useState } from "react";

interface ImageType {
    id: string;
    imageData: string;
    url: string;
    type: string;
    section: string;
    order?: number;
    mimetype?: string;
}

    const formatImages = (data: any[]) => {
        return data
            .map((img) => ({
                ...img,
                url: `data:${img.mimetype || "image/png"};base64,${img.imageData}`
            }))
            .sort((a, b) => a.order - b.order);
    };

function useSectionImage(section: string) {
    const [image, setImage] = useState<ImageType | null>(null);
    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/section${section}`
                );
                const data = await res.json();
                const imgs = formatImages(data);
                if (imgs.length) setImage(imgs[0]);
            } catch (err) {
                console.error(`Failed to fetch image for section "${section}":`, err);
            }
        };
        fetch_();
    }, [section]);
    return image;
}

/* ── Blockquote component ──────────────────────────────────────────────── */
function Quote({ children }: { children: React.ReactNode }) {
    return (
        <div className="border border-black p-4 text-lg font-['Open_Sans'] italic leading-relaxed my-4">
            {children}
        </div>
    );
}

/* ── Person + quote row ────────────────────────────────────────────────── */
function PersonQuote({
    imgSrc,
    name,
    quote,
    attribution,
}: {
    imgSrc: string;
    name: string;
    quote: React.ReactNode;
    attribution: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row gap-6 items-start my-6">
            <div className="flex-shrink-0 text-center w-40">
                <img src={imgSrc} alt={name} className="w-36 h-auto object-contain mx-auto" />
                <p className="text-sm text-gray-600 mt-1">{name}</p>
            </div>
            <div className="text-lg">
                <em>{quote}</em>
                <p className="mt-2 text-base not-italic">{attribution}</p>
            </div>
        </div>
    );
}

/* ── Horizontal rule ───────────────────────────────────────────────────── */
function HR() {
    return <hr className="border-gray-300 my-8" />;
}

/* ── YouTube embed ─────────────────────────────────────────────────────── */
function YouTubeEmbed({ id }: { id: string }) {
    return (
        <div className="my-6 aspect-video w-full max-w-2xl mx-auto">
            <iframe
                className="w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${id}?wmode=opaque`}
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
}

/* ── Indented block (for footnote body text) ───────────────────────────── */
function Indented({ children }: { children: React.ReactNode }) {
    return <div className="mx-8 my-3 text-base">{children}</div>;
}

/* ── Footnote anchor + return link ────────────────────────────────────── */
function FootnoteReturn({ href, label }: { href: string; label: string }) {
    return (
        <p className="mt-4 text-sm">
            <a href={href} className="text-blue-700 hover:underline">{label}</a>
        </p>
    );
}

export default function WhyDecency() {
    /* ── Image hooks ───────────────────────────────────────────────────── */
    const gandhiImg        = useSectionImage("/Gandhi");
    const carolynImg       = useSectionImage("/CarolynKennedy");
    const rooseveltImg     = useSectionImage("/Roosevelt");
    const adamsImg         = useSectionImage("/JohnAdams");
    const clementeImg      = useSectionImage("/Clemente");
    const carterImg        = useSectionImage("/Carter");
    const brooksImg        = useSectionImage("/EdwardBrookes");
    const morrisonImg      = useSectionImage("/ToniMorrison");
    const eleanorImg       = useSectionImage("/EleanorRoosevelt");
    const weissImg         = useSectionImage("/BariWeiss");
    const angelouImg       = useSectionImage("/MayaAngelou");
    const jesusImg         = useSectionImage("/Jesus");
    const popeImg          = useSectionImage("/PopeLeo");
    const josephSmithImg   = useSectionImage("/JosephSmith");
    const mouwImg          = useSectionImage("/RichardMouw");
    const islamImg         = useSectionImage("/Islam");
    const hillelImg        = useSectionImage("/Hillel");
    const irvinBerlinImg   = useSectionImage("/IrvingBerlin");
    const confuciusImg     = useSectionImage("/Confucius");
    /* Footnote images */
    const hamiltonImg      = useSectionImage("/Hamilton");
    const andrewJohnsonImg = useSectionImage("/AndrewJohnson");
    const jeffAdams2Img    = useSectionImage("/JeffersonAdams2");
    const polkImg          = useSectionImage("/Polk");
    const lincolnImg       = useSectionImage("/Lincoln");
    const mccarthyImg      = useSectionImage("/McCarthy");
    const ussMaddoxImg     = useSectionImage("/USSMaddox");
    const lewinskiImg      = useSectionImage("/Lewinsky");
    const bushImg          = useSectionImage("/Bush");
    const bush2Img         = useSectionImage("/Bush2");
    const hillaryImg       = useSectionImage("/Hillary");
    const bidenImg         = useSectionImage("/Biden");
    const trumpImg         = useSectionImage("/Trump");
    const trump2Img        = useSectionImage("/Trump2");
    const trump3Img        = useSectionImage("/Trump3");
    const cabinetImg       = useSectionImage("/Cabinet");
    const thomasPaineImg   = useSectionImage("/ThomasPaine");
    const madisonImg       = useSectionImage("/JamesMadison");
    const alexanderHamiltonImg = useSectionImage("/AlexanderHamilton");
    const henryClayImg     = useSectionImage("/HenryClay");
    const emersonImg       = useSectionImage("/Emerson");
    const jeffAdamsPortraitImg = useSectionImage("/JeffersonAdamsPortrait");
    const constitutionImg  = useSectionImage("/Constitution");

    const allImages = [
        gandhiImg, carolynImg, rooseveltImg, adamsImg, clementeImg, carterImg,
        brooksImg, morrisonImg, eleanorImg, weissImg, angelouImg, jesusImg,
        popeImg, josephSmithImg, mouwImg, islamImg, hillelImg, irvinBerlinImg,
        confuciusImg, hamiltonImg, andrewJohnsonImg, jeffAdams2Img, polkImg,
        lincolnImg, mccarthyImg, ussMaddoxImg, lewinskiImg, bushImg, bush2Img,
        hillaryImg, bidenImg, trumpImg, trump2Img, trump3Img, cabinetImg,
        thomasPaineImg, madisonImg, alexanderHamiltonImg, henryClayImg,
        emersonImg, jeffAdamsPortraitImg, constitutionImg,
    ];
    const imagesLoaded = allImages.every((img) => img !== null)

    if (!imagesLoaded) {
        return (
            <div className="min-h-screen bg-[#f8f9bf] flex items-center justify-center">
                <p className="text-yale-blue text-2xl font-bold animate-pulse">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            {/* Carousel */}
            {/* ── HERO BANNER ──────────────────────────────────────────────── */}
            <section className="bg-[#f8f9bf]">
            {/* Carousel banner */}
            <div className="relative w-full h-56 overflow-hidden shadow-md">
                <DualCarousel page="Carousel" />
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#f8f9bf] to-transparent z-10" />
            </div>

            {/* Hero content */}
            <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10 items-center">

                {/* Gandhi image with decorative ring */}
                <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="rounded-full p-1 bg-gradient-to-br from-yale-blue to-brick-ember shadow-xl">
                        <div className="rounded-full overflow-hidden bg-[#f8f9bf] p-1">
                            {gandhiImg ? (
                                <img
                                    src={gandhiImg.url}
                                    alt="Gandhi"
                                    className="w-44 h-44 object-contain rounded-full"
                                />
                            ) : (
                                <div className="w-44 h-44 bg-gray-100 animate-pulse rounded-full" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Text + nav */}
                <div className="flex-1 flex flex-col gap-5">
                    <div>
                        <p className="text-3xl font-bold text-yale-blue leading-tight mb-1">
                            Take a Stand for Decency Today.
                        </p>
                        <div className="w-16 h-1 bg-brick-ember rounded-full mt-2 mb-5" />
                    </div>

                    <Button
                        className="w-fit rounded-full px-8 py-3 bg-yale-blue text-white hover:bg-deep-harbor shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                        onClick={() => { window.location.href = "/petition-pledge/petition"; }}
                    >
                        ✍ Sign Petition Now!
                    </Button>

                    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {[
                            { href: "#goal",      label: "Decency: UDIG's Goal" },
                            { href: "#defined",   label: "Decency Defined" },
                            { href: "#indecency", label: "Examples of Gross Indecency" },
                            { href: "#why",       label: "Why Does Decency Matter?" },
                        ].map(({ href, label }) => (
                            <a
                                key={href}
                                href={href}
                                className="flex items-center gap-2 text-base font-semibold text-yale-blue hover:text-brick-ember transition-colors group"
                            >
                                <span className="w-2 h-2 rounded-full bg-brick-ember flex-shrink-0 group-hover:scale-125 transition-transform" />
                                {label}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </section>



            {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* ════════════════════════════════════════════════════════════
                    SECTION 1 — UDIG'S GOAL
                ════════════════════════════════════════════════════════════ */}
                <section id="goal">
                    <h2 className="text-red-600 text-3xl font-bold text-center mb-6">
                        DECENCY: UDIG's Goal
                    </h2>

                    <p className="text-lg mb-4">
                        UDIG (United for Decency in Government) passionately focuses on elevating decency and
                        civility in government and among government leaders. When officials act with integrity
                        and respect, they earn the public's trust and strengthen the foundations of a free,
                        responsive constitutional republic.
                    </p>

                    <div className="text-center my-4">
                        <Button
                            className="rounded-full px-6 py-3 bg-brick-ember text-white hover:bg-oxblood-shadow"
                            onClick={() => { window.location.href = "/contribute"; }}
                        >
                            Contribute
                        </Button>
                    </div>

                    <p className="text-lg mb-4">
                        Our approach is uniquely grassroots. We invite people of all political stripes to move
                        beyond partisan divides and to unite around core humanitarian, philosophical, religious,
                        and ethical values of <em>decency</em>. By focusing on these shared standards, we
                        remind everyone of the essential qualities of good governance: the absence of corruption
                        and self-dealing, honesty, compassion, kindness, good manners, accountability, and
                        mutual respect. Together, we will turn individual voices into a collective roar,
                        demanding that leaders at all levels of government conduct themselves with decency.
                    </p>

                    <p className="text-lg mb-2 font-semibold">How we'll raise the standard:</p>
                    <ul className="list-disc pl-6 text-lg space-y-2 mb-6">
                        <li>
                            Reach broad audiences through social media, an informative website (
                            <a href="http://united4decency.com/" className="text-blue-700 hover:underline" target="_blank" rel="noreferrer">
                                united4decency.com
                            </a>
                            ), billboards across the nation, and sustained local and national media coverage.
                        </li>
                        <li>
                            Conduct a 100-day road trip to 100 communities across the nation, partnering with
                            local and national organizations.
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Showcase music and performances by young people during each stop.</li>
                                <li>
                                    Sponsor essay contests and host nonpartisan multimedia presentations that
                                    contrast the harms of indecency with the uplifting impact of decent
                                    leadership—historically and for the future.
                                </li>
                                <li>
                                    Draw attention to acts of decency and indecency in government and promote
                                    democratic responses by people committed to combating corruption,
                                    self-dealing, dishonesty, cruelty, and lack of accountability.
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <p className="text-lg mb-4">
                        This powerful campaign will illuminate the tangible benefits of <em>decent</em>{" "}
                        leadership and the real costs of <em>indecency</em>. It will mobilize public demand for
                        higher standards and foster a civic culture where leaders are expected to act with
                        honesty, accountability, kindness, and respect.
                    </p>

                    <p className="text-lg mb-6">
                        Support UDIG today. Learn more, participate in events, share your stories, and help us
                        elevate decency as a cornerstone of good government—of, by, and for the people.
                    </p>

                    <div className="text-center mb-8">
                        <Button
                            className="rounded-full px-6 py-3 bg-brick-ember text-white hover:bg-oxblood-shadow"
                            onClick={() => { window.location.href = "/contribute"; }}
                        >
                            Contribute
                        </Button>
                    </div>

                    {carolynImg && (
                        <PersonQuote
                            imgSrc={carolynImg.url}
                            name="Carolyn Kennedy Schlossberg"
                            quote="As much as we need a prosperous economy, we also need a prosperity of kindness and decency."
                            attribution="— Carolyn Kennedy Schlossberg, 2000 DNC Speech; August 14, 2000"
                        />
                    )}

                    {rooseveltImg && (
                        <PersonQuote
                            imgSrc={rooseveltImg.url}
                            name="Theodore Roosevelt"
                            quote="I desire to see in this country the decent men strong and the strong men decent. And until we get that combination in pretty good shape we are not going to be by any means as successful as we should be."
                            attribution="— Theodore Roosevelt, Speech before the Society of the Holy Name of Brooklyn and Long Island, August 16, 1903"
                        />
                    )}

                    {adamsImg && (
                        <PersonQuote
                            imgSrc={adamsImg.url}
                            name="John Adams"
                            quote="We may please ourselves with the prospect of free and popular Governments. But there is great Danger, that those Governments will not make us happy. God grant they may. But I fear, that in every assembly, Members will obtain an Influence, by Noise not sense. By Meanness, not Greatness. By Ignorance not Learning. By contracted Hearts not large souls. . . . There must be a Decency, and Respect, and Veneration introduced for Persons in Authority, of every Rank, or We are undone."
                            attribution="— John Adams, Letter to Major General James Warren, April 1776"
                        />
                    )}

                    {clementeImg && (
                        <PersonQuote
                            imgSrc={clementeImg.url}
                            name="Roberto Clemente"
                            quote="Any time you have an opportunity to make a difference in this world and you don't, then you are wasting your time on Earth."
                            attribution="— Roberto Clemente"
                        />
                    )}

                    <p className="text-lg mb-6">
                        When leaders act with decency, they acknowledge the full spectrum of our country—
                        different ethnicities, national origins, ideas, religious or non-religious beliefs,
                        cultures, and ways of communicating—and treat them with respect. This commitment to
                        inclusivity is what makes government truly of the people, by the people, and for the
                        people.
                    </p>

                    {carterImg && (
                        <PersonQuote
                            imgSrc={carterImg.url}
                            name="President Jimmy Carter"
                            quote="We have become not a melting pot but a beautiful mosaic. Different people, different beliefs, different yearnings, different hopes and different dreams."
                            attribution="— President Jimmy Carter"
                        />
                    )}

                    <p className="text-lg mb-6">
                        Decent government officials also recognize their duty to the people they represent to be
                        open and honest with them and to act in the public's best interests—without self-dealing,
                        corruption, or abuses of power. If they do not conduct themselves in such a manner, they
                        are subject to impeachment{" "}
                        <a href="#footnote-1" className="text-blue-700 hover:underline">[more here 1]</a>.
                        <br /><br />
                        We-the-people of the United States, regardless of political differences, can join
                        together and make it clear that we expect and <em>demand decency</em> from our political
                        leaders—for our sakes, for the sake of our nation, and for the sake of future
                        generations. That is the goal of UDIG.
                    </p>

                    {brooksImg && (
                        <PersonQuote
                            imgSrc={brooksImg.url}
                            name="Edward Brooke"
                            quote="The polarization of Congress; the decline of civility; and the rise of attack politics . . . are a blot on our political system and a disservice to the American people."
                            attribution="— Edward Brooke, Republican Senator"
                        />
                    )}
                </section>

                <HR />

                {/* ════════════════════════════════════════════════════════════
                    SECTION 2 — DECENCY DEFINED
                ════════════════════════════════════════════════════════════ */}
                <section id="defined">
                    <h2 className="text-red-600 text-3xl font-bold text-center mb-6">
                        Decency Defined
                    </h2>

                    <p className="text-lg mb-6">
                        Decency—encompassing the principles of respect, kindness, honesty, openness, compassion,
                        accountability, and an absence of corruption and self-dealing—requires dialogue and
                        conduct free of vitriol, deceit, and personal attacks that serve only to mislead, create
                        unnecessary divisions, engender bitterness, and divert attention from the real issues{" "}
                        <a href="#footnote-2" className="text-blue-700 hover:underline">[more here 2]</a>.
                        <br /><br />
                        Our constitutional republic and representative democracy are sustained only when the
                        electorate is informed of the truth. That is possible only when our government and its
                        officials are open, honest, and accountable. Individually and collectively, we are
                        uplifted by decency.
                    </p>

                    {morrisonImg && (
                        <PersonQuote
                            imgSrc={morrisonImg.url}
                            name="Toni Morrison"
                            quote="Ruthless language is not just ruthless; it is also a mask for the fear and the lack of decency that hide behind the curtain of power."
                            attribution="— Toni Morrison, 1993 Nobel Lecture"
                        />
                    )}

                    <p className="text-lg mb-6">
                        Fundamentally, our lives, our community, and our nation are enriched, more peaceful, and
                        happier when we are surrounded by decency rather than meanness, cruelty, dishonesty,
                        corruption, and abuses of power.
                    </p>

                    {eleanorImg && (
                        <PersonQuote
                            imgSrc={eleanorImg.url}
                            name="Eleanor Roosevelt"
                            quote="I think the time has come for all citizens who have convictions to speak out and be counted on the side of law and decency."
                            attribution='— Eleanor Roosevelt, "My Day" Column, April 27, 1957'
                        />
                    )}

                    <p className="text-lg mb-6">
                        UDIG's goals are to bring together people of <em>all</em> viewpoints and beliefs—people
                        from all religious, political, and socioeconomic groups—to celebrate our shared
                        fundamental values of decency, learn the importance of decency in our lives and our
                        government, and effectively communicate our expectations and insistence that government
                        officials will conduct themselves in accordance with those values.
                    </p>

                    {weissImg && (
                        <PersonQuote
                            imgSrc={weissImg.url}
                            name="Bari Weiss"
                            quote={
                                <>
                                    Donald Trump's election was a watershed moment. Even those like me, who had
                                    previously pulled levers for candidates of both parties, felt that Mr. Trump
                                    had not only violated all sense of common decency, but, alarmingly, that he
                                    seemed to have no idea that there even existed such an unspoken code of
                                    civility and dignity.
                                </>
                            }
                            attribution={
                                <>— Bari Weiss, Opinion in <em>The New York Times</em>, August 1, 2017</>
                            }
                        />
                    )}

                    <p className="text-lg mb-6">
                        Decency requires that one behaves in a manner conforming to long-accepted standards of
                        propriety and good taste, demonstrating respect, kindness, and honesty. To act decently
                        requires modesty and consideration for others in speech, conduct, and appearance,
                        encompassing courtesy, fairness, respect, and honor.
                    </p>
                </section>

                <HR />

                {/* ════════════════════════════════════════════════════════════
                    SECTION 3 — GROSS INDECENCY
                ════════════════════════════════════════════════════════════ */}
                <section id="indecency">
                    <h2 className="text-red-600 text-3xl font-bold text-center mb-6">
                        Examples of Gross Indecency
                    </h2>

                    <p className="text-lg mb-6">
                        Sadly, our nation's history reflects many occasions of appallingly indecent conduct and
                        discourse by members of all political parties. Serious damage was done to our nation,
                        our government, and interpersonal relationships when government officials acted
                        indecently, in derogation of the public's best interests. That damage continues
                        unabated under the current reign of indecency.
                        <br /><br />
                        Among hundreds of instances of extremely consequential indecent conduct and discourse by
                        members of both major political parties have been:
                    </p>

                    <div className="flex flex-col gap-0">
                        {[
                            {
                            img: jeffAdams2Img,
                            num: 3,
                            label: "Jefferson & Adams — 1800 Election",
                            text: "The malicious and dishonest charges by, or at the behest of, Thomas Jefferson and John Adams during their bitter 1800 presidential election campaign.",
                            href: "#footnote-3",
                            },
                            {
                            img: polkImg,
                            num: 4,
                            label: "President Polk — Mexican-American War",
                            text: "False claims by President Polk as a justification for the horrendous Mexican-American War.",
                            href: "#footnote-4",
                            },
                            {
                            img: mccarthyImg,
                            num: 5,
                            label: "Senator McCarthy — Red Scare",
                            text: "The campaign of Senator Joseph McCarthy to destroy the lives and reputations of people he recklessly accused of being Communists.",
                            href: "#footnote-5",
                            },
                            {
                            img: ussMaddoxImg,
                            num: 6,
                            label: "President Johnson — Vietnam War",
                            text: "Dishonest information to the public and to Congress by President Johnson's administration to gain support for tragically escalating the Vietnam War.",
                            href: "#footnote-6",
                            },
                            {
                            img: lewinskiImg,
                            num: 7,
                            label: "President Clinton — Lewinsky Affair",
                            text: "President Clinton's sexual misconduct with an intern in the White House and his lies to the nation regarding it.",
                            href: "#footnote-7",
                            },
                            {
                            img: bushImg,
                            num: 8,
                            label: "Gulf War — Nayirah Testimony",
                            text: "Dishonest propaganda in a campaign to sway the public to support the first Gulf War against Iraq.",
                            href: "#footnote-8",
                            },
                            {
                            img: bush2Img,
                            num: 9,
                            label: "Bush Administration — Iraq War",
                            text: "Baseless claims by the Bush Administration, parroted by Hillary Clinton, to gain support for the devastating and illegal invasion and occupation of Iraq.",
                            href: "#footnote-9",
                            },
                            {
                            img: bidenImg,
                            num: 10,
                            label: "Biden Administration — Cognitive Decline Cover-Up",
                            text: "The cover-up by the Biden administration, with the assistance of several journalists, of President Biden's conspicuously deteriorating cognitive state.",
                            href: "#footnote-10",
                            },
                            {
                            img: trumpImg,
                            num: 11,
                            label: "President Trump — Documented Lies",
                            text: "The tens of thousands of documented lies, during both his terms as President, undermining trust in Donald Trump by millions of people in the U.S. and people throughout the world.",
                            href: "#footnote-11",
                            },
                            {
                            img: trump2Img,
                            num: 12,
                            label: "Trump Administration — Treatment of Immigrants",
                            text: 'The vicious, inhumane treatment by the Trump administration of (a) lawful citizens, (b) law-abiding people who are in the process of becoming legal residents or citizens, and (c) undocumented immigrants who have worked hard and not violated any criminal laws, even though President Trump assured the nation that ICE was detaining and deporting the "worst of the worst."',
                            href: "#footnote-12",
                            },
                            {
                            img: cabinetImg,
                            num: 13,
                            label: "Extrajudicial Killings off Venezuela",
                            text: "The mass murder of at least 157 people off the coast of Venezuela by the U.S. military, in blatant violation of U.S. and international law.",
                            href: "#footnote-13",
                            },
                            {
                            img: trump3Img,
                            num: 14,
                            label: "President Trump — Claims of Total Authority",
                            text: 'The assertion by President Trump that the President can act without any constitutional, legal, or other constraints except the President\'s "morality" or "mind."',
                            href: "#footnote-14",
                            },
                        ].map((item) => (
                            <div key={item.num} className="flex flex-row gap-4 items-start border-b border-gray-100 py-4">
                            {/* Thumbnail image, fixed width like the HTML site */}
                            <div className="flex-shrink-0 w-20">
                                {item.img ? (
                                <img
                                    src={item.img.url}
                                    alt={item.label}
                                    className="w-20 h-auto object-contain"
                                />
                                ) : (
                                /* placeholder so layout doesn't collapse when image missing */
                                <div className="w-20 h-16 bg-gray-100 rounded" />
                                )}
                            </div>
                            {/* Text content */}
                            <div className="flex-1">
                                <p className="font-semibold text-yale-blue text-lg leading-snug">{item.label}</p>
                                <p className="text-base text-gray-800 mt-1">{item.text}</p>
                                <a href={item.href} className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                                More here →
                                </a>
                            </div>
                            </div>
                        ))}
                        </div>
                </section>

                <HR />

                {/* ════════════════════════════════════════════════════════════
                    SECTION 4 — WHY DOES DECENCY MATTER
                ════════════════════════════════════════════════════════════ */}
                <section id="why">
                    <h2 className="text-red-600 text-3xl font-bold text-center mb-6">
                        Why Does Decency Matter?
                    </h2>

                    {angelouImg && (
                        <PersonQuote
                            imgSrc={angelouImg.url}
                            name="Maya Angelou"
                            quote="I think we all have a responsibility for the decency of the world in which we live. . . . The person who thinks he or she is a leader has a greater responsibility. I think that we've lost a lot of the sense of the high ground in our country. I think that we've allowed ourselves to be pulled down into the mud of obscenity and the mud of small-mindedness."
                            attribution="— Maya Angelou"
                        />
                    )}

                    <p className="text-lg mb-6">
                        Indecency in government and by certain government officials—often manifested by
                        corruption, unnecessary and illegal use of military force against other nations,
                        self-dealing, cruelty, insults, mean-spiritedness, contempt for other branches of
                        government, disregard for the rule of law, and hatefulness—has become a persistent and
                        increasingly devastating cancer on our body politic. It is also contrary to
                        humanitarian, philosophical, religious, and ethical traditions.
                        <br /><br />
                        Our nation, and each of us as human beings who endeavor to live decent lives and expect
                        decency from our leaders will benefit from a unified, non-partisan movement—like the one
                        UDIG is building—that demands basic decency by government officials.
                    </p>

                    <h3 className="text-center font-bold text-xl mb-6">
                        Decency As a Uniform, Fundamental Principle
                    </h3>

                    {/* Christianity */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                        {jesusImg && (
                            <div className="flex-shrink-0 text-center w-40">
                                <img src={jesusImg.url} alt="Jesus Christ" className="w-36 h-auto object-contain mx-auto" />
                                <p className="text-sm text-gray-600 mt-1">Jesus Christ</p>
                            </div>
                        )}
                        <Quote>
                            <em>
                                A new command I give you: Love one another. As I have loved you, so you must love
                                one another. By this everyone will know that you are my disciples, if you love
                                one another.
                            </em>
                            <br />
                            <span className="not-italic">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— John 13:34–35</span>
                        </Quote>
                    </div>

                    {popeImg && (
                        <div className="my-4 text-center">
                            <img src={popeImg.url} alt="Pope Leo XIV" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            <p className="text-sm text-gray-600 mt-1">Pope Leo XIV</p>
                        </div>
                    )}

                    <p className="text-lg mb-4">
                        The current Pope, Leo XIV, has been a powerful advocate for decency in governing and in
                        the treatment of immigrants. Like{" "}
                        <a href="https://www.nytimes.com/2025/05/12/world/asia/pope-leo-voice-platform.html" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                            Benedict XVI
                        </a>
                        , who focused on fundamental values like decency and peace, Leo XIV has directly
                        criticized the mass deportation policies of President Trump, referring to them as
                        "inhuman" and a violation of the "dignity of many men and women, and of entire
                        families."
                    </p>

                    <Quote>
                        <em>When the righteous are in authority, the people rejoice; but when a wicked man rules, the people groan.</em>
                        <br />
                        <span className="not-italic">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— Proverbs 29:2</span>
                    </Quote>

                    {/* LDS */}
                    {josephSmithImg && (
                        <div className="my-4 text-center">
                            <img src={josephSmithImg.url} alt="Joseph Smith" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            <p className="text-sm text-gray-600 mt-1">Joseph Smith</p>
                        </div>
                    )}

                    <p className="text-lg mb-4">
                        Doctrine of The Church of Jesus Christ of Latter-Day Saints emphasizes that{" "}
                        <strong>only good, honest, wise men are to be supported to lead in government positions</strong>.
                    </p>

                    <Indented>
                        <Quote>
                            <em>
                                9 Nevertheless, when the wicked rule the people mourn.<br />
                                10 Wherefore, honest men and wise men should be sought for diligently, and good
                                men and wise men ye should observe to uphold; otherwise whatsoever is less than
                                these cometh of evil.<br />
                                11 And I give unto you a commandment, that ye shall forsake all evil and cleave
                                unto all good, that ye shall live by every word which proceedeth forth out of
                                the mouth of God.
                            </em>
                            <br />
                            <span className="not-italic">
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;—{" "}
                                <a href="https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/98?lang=eng" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                    Doctrine and Covenants
                                </a>{" "}
                                98:9–11
                            </span>
                        </Quote>
                    </Indented>

                    <Indented>
                        <Quote>
                            <strong><em>
                                Wise men, good men, patriotic men are to be found in all communities, in all
                                political parties, among all creeds. None but such men should be chosen
                            </em></strong> . . .
                            <br />
                            <span className="not-italic">
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;—{" "}
                                <a href="https://www.churchofjesuschrist.org/study/manual/doctrine-and-covenants-student-manual/section-134-earthly-governments-and-laws?lang=eng" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                    Statement
                                </a>{" "}
                                issued in January 1928 by the First Presidency of The Church of Jesus Christ of
                                Latter-Day Saints (Heber J. Grant, Anthony W. Ivins, and Charles W. Nibley)
                            </span>
                        </Quote>
                    </Indented>

                    {/* Evangelical */}
                    <p className="text-lg mb-4">
                        Evangelical leaders like{" "}
                        <a href="https://www.nae.org/uncommon-decency/" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                            Richard Mouw
                        </a>{" "}
                        have emphasized the importance of Christians treating others, including those holding
                        divergent views, with civility and decency.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 items-start my-6">
                        <div className="flex-1">
                            <Quote>
                                <em>
                                    Kindness and gentleness should be especially characteristic of those of us
                                    who are Christians. We were created for kind and gentle living. Indeed,
                                    kindness and gentleness are two of the fruit-of-the-Spirit characteristics
                                    that the apostle Paul mentions in Galatians 5.{" "}
                                    <strong>
                                        When Christians fail to measure up to the standards of kindness and
                                        gentleness, we are not the people God meant us to be.
                                    </strong>{" "}
                                    (Emphasis added.)
                                </em>
                            </Quote>
                        </div>
                        {mouwImg && (
                            <div className="flex-shrink-0 text-center w-40">
                                <img src={mouwImg.url} alt="Richard Mouw" className="w-36 h-auto object-contain mx-auto" />
                                <p className="text-sm text-gray-600 mt-1">Richard Mouw</p>
                            </div>
                        )}
                    </div>

                    <HR />

                    {/* Islam */}
                    <Indented>
                        <Quote>
                            <em>Never will God change the conditions of a people until they change what is in their own souls.</em>
                            <br />
                            <span className="not-italic">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— The Qur'an, 13:11</span>
                        </Quote>
                    </Indented>

                    <p className="text-lg mb-4">
                        Principally because of the misdeeds by a relatively few people who falsely claim to have
                        acted in the name of their faith, perhaps no religion is as misunderstood by
                        non-Muslims as Islam, primarily a faith of peace, justice, and decency.
                    </p>

                    {islamImg && (
                        <div className="my-4 text-center">
                            <img src={islamImg.url} alt="Islam" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                        </div>
                    )}

                    <Indented>
                        <p className="text-base italic mb-4">
                            Muhammed . . . was known for his exceptional character, kindness, and mercy towards
                            all people. He treated everyone with respect and compassion, regardless of their
                            background or beliefs. His interactions with others were characterized by humility,
                            patience, and forgiveness. People were drawn to Prophet Muhammad for his integrity,
                            honesty, and sincerity.
                        </p>
                    </Indented>

                    <p className="text-lg mb-2">
                        The following is found on{" "}
                        <a href="https://quranacademy.io/blog/14-islamic-quotes-politeness/" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                            Quran Academy's website
                        </a>:
                    </p>

                    <Indented>
                        <Quote>
                            <em>
                                Showing good manners is extremely important in Islam. In fact, one of the reasons
                                that Prophet Muhammad was sent to humankind was to teach good manners:
                                <br /><br />
                                "God has sent me to perfect good manners and to do good deeds." (Bukhari, Ahmad)
                                <br /><br />
                                . . . Politeness is a form of kindness and respect. It promotes a peaceful world.
                                It enhances positive feelings. It prevents hurt feelings. It motivates others to
                                be kind.
                                <br /><br />
                                The most beloved of me among you is he who is the best in manners among you.
                                (Bukhari, Muslim)
                                <br /><br />
                                Rude talk does not bring anything except shame! Modesty and decency decorate
                                wherever they may be. (Muslim, Abu Daud)
                                <br /><br />
                                You should show courtesy and be cordial with each other, so that nobody should
                                consider himself superior to another nor do him harm. (Riyadh-us-Saleheen)
                            </em>
                        </Quote>
                    </Indented>

                    <HR />

                    {/* Judaism */}
                    <div className="flex flex-col sm:flex-row gap-6 items-center my-6">
                        <div className="flex-1">
                            <Quote>
                                <em>
                                    Whatever is hateful and distasteful to you, do not do to your fellow man. This
                                    is the entire Torah, the rest is commentary.
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;—{" "}
                                    <a href="https://aish.com/judaisms-golden-rule/" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                        Rabbi Hillel
                                    </a>
                                </span>
                            </Quote>
                        </div>
                        {hillelImg && (
                            <div className="flex-shrink-0 text-center w-40">
                                <img src={hillelImg.url} alt="Rabbi Hillel" className="w-36 h-auto object-contain mx-auto" />
                            </div>
                        )}
                    </div>

                    <p className="text-lg mb-4">
                        Deeply rooted values centered on decency are{" "}
                        <a href="https://www.juf.org/jcrc/Civility-Statement.aspx" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                            discussed
                        </a>{" "}
                        by the Jewish United Fund as follows:
                    </p>

                    <Indented>
                        <Quote>
                            <em>
                                With growing concern, we have seen some members of our Jewish community––from
                                across the political spectrum––engage in discourse in ways that both reflect sharp
                                national divisions and foster Jewish communal ones. The views and humanity of
                                others with different opinions on Israeli or American politics are too often
                                treated in ways that erode decency, civility and respect, and too often the
                                attacks become personal.
                                <br /><br />
                                JCRC calls upon our community to exemplify{" "}
                                <strong>
                                    the noble Jewish ideal of derech eretz (common decency). We will not allow
                                    our arguments to devolve into sinat chinam, or baseless hatred.
                                </strong>{" "}
                                (Emphasis added.)
                            </em>
                        </Quote>
                    </Indented>

                    {irvinBerlinImg && (
                        <PersonQuote
                            imgSrc={irvinBerlinImg.url}
                            name="Irving Berlin"
                            quote="If you ask why we believe in human rights, I can say because that is the only decent, even tolerable way human beings can live with each other, and if you ask what is 'decent,' I can say that it is the only kind of life which we think that humans should follow, if they are not to destroy each other."
                            attribution="— Irving Berlin"
                        />
                    )}

                    <HR />

                    {/* Confucius */}
                    {confuciusImg && (
                        <PersonQuote
                            imgSrc={confuciusImg.url}
                            name="Confucius"
                            quote={
                                <>
                                    To be able under all circumstances to practice five things constitutes
                                    perfect virtue; these five things are:
                                    <br /><br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<em>gravity</em> (dignity and respectfulness),<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<em>generosity of soul</em> (magnanimity and tolerance),<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<em>sincerity</em> (trustworthiness and honesty),<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<em>earnestness</em> (diligence and dedication), and<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<em>kindness</em> (benevolence and grace).
                                </>
                            }
                            attribution="— The Analects of Confucius, Book 17, Verse 6"
                        />
                    )}

                    <HR />

                    <p className="text-center font-bold text-xl mb-6">
                        Our Right and Duty to Insist on Decency in Our Government and By Government Officials
                    </p>

                    {constitutionImg && (
                        <div className="my-4 text-center">
                            <img src={constitutionImg.url} alt="The Constitution" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                        </div>
                    )}

                    <p className="text-lg mb-4">
                        Americans have the right to insist on the principles of decency and justice that form
                        the basis of our Constitution, which begins with the principle that governmental power
                        derives from we-the-people. The Federalist Papers convey the extraordinary civility
                        generally existing among the Framers in their debates and written discourses despite
                        often divergent approaches as to how a union of states should be governed. Very little
                        public name-calling or vitriolic discourse occurred because courtesy and civility were
                        standards the Founders considered essential in their mutual endeavor to help "form a more
                        perfect Union." From this they created an openness structured to provide a democratic
                        marketplace of ideas in public discourse.
                    </p>

                    {jeffAdamsPortraitImg && (
                        <div className="my-4 text-center">
                            <img src={jeffAdamsPortraitImg.url} alt="Thomas Jefferson and John Adams" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            <p className="text-sm text-gray-600 mt-1">Thomas Jefferson and John Adams</p>
                        </div>
                    )}

                    <p className="text-lg mb-4">
                        Thomas Jefferson and John Adams fundamentally disagreed with each other on many key
                        issues, including federalism versus the rights of states and freedom to criticize the
                        President and the government. Nevertheless, except for their vicious conduct toward each
                        other during the campaign leading up to the 1800 presidential election, they displayed
                        genuine respect and affection for each other in their correspondence, particularly
                        during the fourteen years before their deaths. (Remarkably, they died on the same date,
                        July 4, 1826, exactly fifty years after the date of the Declaration of Independence.)
                    </p>

                    {emersonImg && (
                        <div className="my-4 text-center">
                            <img src={emersonImg.url} alt="Ralph Waldo Emerson" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            <p className="text-sm text-gray-600 mt-1">Ralph Waldo Emerson</p>
                        </div>
                    )}

                    <p className="text-lg mb-4">
                        Decency and civility lead to enriching, productive, and principled interactions among
                        people of good will. It lends itself to peace in the world <em>and</em> to peace of mind.
                        <br /><br />
                        Ralph Waldo Emerson encapsulated this well, writing:
                    </p>

                    <Indented>
                        <Quote>
                            <em>Nothing can bring you peace but yourself. Nothing can bring you peace but the triumph of principles.</em>
                        </Quote>
                    </Indented>

                    <p className="text-lg mb-6">
                        It is UDIG's mission to restore decency to government and greater peace in our own lives
                        through the democratic insistence that indecent behavior and discourse be rejected and
                        that our representatives and other government officials conduct themselves according to
                        fundamental shared values of decency.
                    </p>

                    <div className="text-center mt-6 mb-12">
                        <Button
                            className="rounded-full px-6 py-3 bg-brick-ember text-white hover:bg-oxblood-shadow"
                            onClick={() => { window.location.href = "/contribute"; }}
                        >
                            Contribute
                        </Button>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════════
                    FOOTNOTES
                ════════════════════════════════════════════════════════════ */}
                <div className="border-t-2 border-gray-400 pt-8 space-y-16">

                    {/* ── Footnote 1: Impeachment ─────────────────────────── */}
                    <section id="footnote-1">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#goal" className="text-blue-700 hover:underline">1.</a>{" "}
                            Because they are so damaging to our nation and our system of government,
                            dishonesty, breaches of trust, and abuses of power are grounds for impeachment,
                            contrary to the uninformed or willfully false arguments of those who have
                            baselessly insisted that impeachment requires proof of a criminal act.
                        </p>

                        <YouTubeEmbed id="_nmGcdWvjMI" />

                        <p className="text-sm mb-4 leading-relaxed">
                            When the Framers approved the term of art "high Crimes and Misdemeanors" in 1787,
                            they well knew its broad meaning, history, and usage in English parliamentary
                            practice, and they understood and accepted that it extended to gross misconduct in
                            office that was not confined to criminal offenses.
                        </p>

                        {hamiltonImg && (
                            <div className="my-4 text-center">
                                <img src={hamiltonImg.url} alt="Alexander Hamilton" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            Alexander Hamilton, in The Federalist Papers: No. 65, stated: "The subjects of
                            [the Senate's impeachment] jurisdiction are those offenses which proceed from the
                            misconduct of public men, or, in other words, from{" "}
                            <strong>the abuse or violation of some public trust</strong>. They are of a nature
                            which may with peculiar propriety be <strong>denominated POLITICAL</strong>, as
                            they relate chiefly to injuries done immediately to the society itself."
                        </p>

                        <p className="text-sm mb-4 leading-relaxed">
                            Congress has identified three general types of conduct that constitute grounds for
                            impeachment: (1) improperly exceeding or abusing the powers of the office;
                            (2) behavior incompatible with the function and purpose of the office; and
                            (3) misusing the office for an improper purpose or for personal gain.
                        </p>

                        <p className="text-sm mb-4 leading-relaxed">
                            Many impeachments against presidents and federal judges have proceeded, at least in
                            part, on the basis of charges of abuses of power or corruption—and even on charges
                            of being, essentially, indecent—without an assertion of criminal misconduct.
                        </p>

                        {andrewJohnsonImg && (
                            <div className="my-4 text-center">
                                <img src={andrewJohnsonImg.url} alt="Andrew Johnson Impeachment" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-2 text-center font-semibold">"Peculiarly Indecent"</p>

                        <p className="text-sm mb-4 leading-relaxed">
                            The 10th article of impeachment against President Johnson accused him of being
                            "unmindful of the high duties of his office and the dignity and proprieties
                            thereof," arguing that Johnson's behavior attempted to "bring into disgrace,
                            ridicule, hatred, contempt and reproach the Congress." The article asserted that
                            Johnson's utterances are{" "}
                            <strong>"peculiarly indecent and unbecoming in the Chief Magistrate"</strong> and
                            that he had{" "}
                            <strong>
                                "brought the high office of the President of the United States into contempt,
                                ridicule and disgrace."
                            </strong>
                        </p>

                        <p className="text-sm mb-4 leading-relaxed">
                            One of the three articles of impeachment pending when President Nixon resigned was
                            for abuse of power. The first article of impeachment against President Trump in
                            2019 was entitled "Abuse of Power" and was not framed in terms of a violation of
                            any criminal law. Likewise, many impeachments against federal judges have been
                            based on abuses of power and indecency, not criminal offenses.
                        </p>

                        <FootnoteReturn href="#goal" label="[Return to main text 1]" />
                    </section>

                    {/* ── Footnote 2: Ad hominem attacks ─────────────────── */}
                    <section id="footnote-2">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#defined" className="text-blue-700 hover:underline">2.</a>
                        </p>

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                The Latin phrase <em>ad hominem</em> meaning <em>to the person</em> describes
                                approaches to argumentation, debate, discourse, and politics, that consist of
                                personal attacks against the opposing speaker, rather than presenting arguments
                                or evidence relevant to the topic under discussion. . . . From a logical
                                viewpoint, ad hominem attacks are usually recognized as a type of fallacy.
                                Unfortunately, political discourse today is full of them.{" "}
                                <strong>
                                    Personal insults and name calling, formally called abusive ad hominem attacks,
                                    have become the norm, frequently practiced by the current US President and
                                    many other politicians.
                                </strong>
                            </p>
                        </Indented>

                        <p className="text-sm mb-4 leading-relaxed">
                            Ian H. Hutchinson, "Are Ad Hominem Attacks Legitimate Academic Freedom?" MIT
                            Faculty Newsletter, September/October 2025 (emphasis added).
                            <br /><br />
                            <strong>
                                Ad hominem attacks are currently common fare when certain government officials
                                conspicuously seek to divert the discussion, cast aspersions upon those who
                                challenge them, and avoid answering questions of concern to the public.
                            </strong>{" "}
                            Here is one example, among many instances, of a refusal to address a question and,
                            instead, launching a vicious ad hominem verbal assault by President Trump:
                        </p>

                        <YouTubeEmbed id="QE9JipXnfHI" />

                        <p className="text-sm mb-4 leading-relaxed">
                            When CNN Chief White House Correspondent Kaitlan Collins pressed President Trump
                            regarding the recently released Epstein files and the survivors of his abuse,
                            asking about heavily redacted Justice Department documents, the following ad
                            hominem attacks were launched by President Trump:
                        </p>

                        <Indented>
                            <p className="text-sm leading-relaxed">
                                <strong>Kaitlan Collins:</strong> "What would you say to the survivors who feel like they haven't gotten justice?"
                                <br /><br />
                                <strong>President Trump:</strong> "You are so bad. You are the worst reporter. No wonder CNN has no ratings because of people like you. . . . I've never seen a smile on your face."
                                <br /><br />
                                <strong>Kaitlan Collins:</strong> "Well, I'm asking you about survivors of a sexual abuser, Mr. President."
                                <br /><br />
                                <strong>President Trump:</strong> "You know why you're not smiling? Because you know you're not telling the truth."
                            </p>
                        </Indented>

                        <p className="text-sm mb-4 mt-4 leading-relaxed">
                            Another example: Senator Whitehouse asked specific questions of Attorney General
                            Pam Bondi about whether the FBI delivered $50,000 to Tom Homan and what happened
                            to that money. The Attorney General contemptuously dodged every question, sometimes
                            by personally attacking Senator Whitehouse.
                        </p>

                        <YouTubeEmbed id="EibEKzXVYU8" />

                        <Indented>
                            <p className="text-sm italic leading-relaxed">
                                During these times, we need to remember that at the end of the day, we're all
                                people — and we're all in this together. . . . Avoiding the ad hominem attack is
                                a basic aspect of best practices in political discourse.
                            </p>
                        </Indented>

                        <p className="text-sm mt-2">
                            Glenn Geher, Ph.D., "Avoid the Ad Hominem Attack," March 10, 2017,{" "}
                            <a href="https://www.psychologytoday.com/us/blog/darwins-subterranean-world/201703/avoid-the-ad-hominem-attack" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                Psychology Today
                            </a>.
                        </p>

                        <FootnoteReturn href="#defined" label="[Return to main text 2]" />
                    </section>

                    {/* ── Footnote 3: Jefferson & Adams ─────────────────── */}
                    <section id="footnote-3">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">3.</a>
                        </p>

                        {jeffAdams2Img && (
                            <div className="my-4 text-center">
                                <img src={jeffAdams2Img.url} alt="Jefferson and Adams" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <Indented>
                            <p className="text-sm mb-4 leading-relaxed">
                                Jefferson's camp accused President Adams of having a "hideous hermaphroditical
                                character, which has neither the force and firmness of a man, nor the gentleness
                                and sensibility of a woman."
                                <br /><br />
                                In return, Adams' men called Vice President Jefferson "a mean-spirited, low-lived
                                fellow, the son of a half-breed Indian squaw, sired by a Virginia mulatto father."
                                <br /><br />
                                As the slurs piled on, Adams was labeled a fool, a hypocrite, a criminal, and a
                                tyrant, while Jefferson was branded a weakling, an atheist, a libertine, and a
                                coward.
                            </p>
                        </Indented>

                        <p className="text-sm">
                            Kerwin Swint, "Founding Fathers' dirty campaign," CNN, August 22, 2008.
                        </p>

                        <FootnoteReturn href="#indecency" label="[Return to main text 3]" />
                    </section>

                    {/* ── Footnote 4: Polk / Mexican-American War ─────────── */}
                    <section id="footnote-4">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">4.</a>
                        </p>

                        {polkImg && (
                            <div className="my-4 text-center">
                                <img src={polkImg.url} alt="President Polk" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                Polk sent his message to Congress. In the strongest possible language he
                                excoriated Mexico, elided the truth, and demanded not that Congress declare war
                                but that it recognize a war already in existence. He informed them that "now,
                                after reiterated menaces, Mexico has passed the boundary of the United States,
                                has invaded our territory and shed American blood upon the American soil." None
                                of it was true . . .
                            </p>
                        </Indented>

                        {lincolnImg && (
                            <div className="my-4 text-center">
                                <img src={lincolnImg.url} alt="Abraham Lincoln" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                [In his first speech on the floor of the House of Representatives, Abraham]
                                Lincoln demanded to know the exact "spot" upon which Mexican troops shed
                                "American blood on American soil." Acting every bit the lawyer he was, Lincoln
                                offered a devastating rebuke to Polk and proved that it had been U.S. troops who
                                began the war by making an unprovoked attack on Mexico.
                            </p>
                        </Indented>

                        <p className="text-sm">
                            Amy S. Greenberg, <em>A Wicked War</em> (Alfred A. Knopf: New York 2012), at 104, 249.
                        </p>

                        <FootnoteReturn href="#indecency" label="[Return to main text 4]" />
                    </section>

                    {/* ── Footnote 5: McCarthy ──────────────────────────── */}
                    <section id="footnote-5">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">5.</a>
                        </p>

                        <Indented>
                            <Quote>
                                <em>
                                    Until this moment, Senator, I think I never really gauged your cruelty or
                                    your recklessness. . . . Let us not assassinate this lad further, senator.
                                    You have done enough.{" "}
                                    <strong>Have you no sense of decency?</strong>
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— Army Lawyer Joseph Welch, addressing Senator
                                    Joseph R. McCarthy, June 9, 1954.
                                </span>
                            </Quote>
                        </Indented>

                        {mccarthyImg && (
                            <div className="my-4 text-center">
                                <img src={mccarthyImg.url} alt="McCarthy Hearings" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                Wisconsin Republican senator Joseph R. McCarthy rocketed to public attention in
                                1950 with his allegations that hundreds of Communists had infiltrated the State
                                Department and other federal agencies. . . . McCarthy relentlessly continued his
                                anticommunist campaign into 1953, when he gained a new platform as chairman of
                                the Senate Permanent Subcommittee on Investigations. . . . Harvard law dean
                                Ervin Griswold described McCarthy's role as "judge, jury, prosecutor,
                                castigator, and press agent, all in one."
                                <br /><br />
                                At a session on June 9, 1954, McCarthy charged that one of Welch's attorneys
                                had ties to a Communist organization. As an amazed television audience looked
                                on, Welch responded: "Until this moment, Senator, I think I never really gauged
                                your cruelty or your recklessness." When McCarthy tried to continue his attack,
                                Welch angrily interrupted, "Let us not assassinate this lad further, senator.
                                You have done enough. Have you no sense of decency?"
                                <br /><br />
                                Overnight, McCarthy's immense national popularity evaporated. Censured by his
                                Senate colleagues, ostracized by his party, and ignored by the press, McCarthy
                                died three years later, 48 years old and a broken man.
                            </p>
                        </Indented>

                        <p className="text-sm">
                            "Have You No Sense of Decency?" United States Senate, June 9, 1954, found{" "}
                            <a href="https://www.senate.gov/about/powers-procedures/investigations/mccarthy-hearings/have-you-no-sense-of-decency.htm" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                here
                            </a>.
                        </p>

                        <FootnoteReturn href="#indecency" label="[Return to main text 5]" />
                    </section>

                    {/* ── Footnote 6: Vietnam / Gulf of Tonkin ─────────── */}
                    <section id="footnote-6">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">6.</a>
                        </p>

                        {ussMaddoxImg && (
                            <div className="my-4 text-center">
                                <img src={ussMaddoxImg.url} alt="USS Maddox" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            After two supposed attacks on August 2, 1964, and on August 4, by North Vietnamese
                            troops against the <em>USS Maddox</em> in the Gulf of Tonkin, Congress passed a
                            resolution granting President Lyndon Johnson authority to "take all necessary steps
                            to repel any armed attack against the forces of the United States."{" "}
                            <strong>
                                That resolution, based upon false information provided by the Johnson
                                administration, was a major turning point in ratcheting up the United States's
                                engagement in a brutal, undeclared war against North Vietnam, costing millions
                                of lives.
                            </strong>
                        </p>

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                The <em>Maddox</em> was conducting electronic eavesdropping on North Vietnam to
                                assist South Vietnamese Army commando raids on North Vietnamese targets, but
                                that wasn't publicly known at the time. . . . Then on August 4, the USS{" "}
                                <em>Maddox</em> captain reported a second incident, that he was "under
                                continuous torpedo attack." He later cabled "freak weather effects on radar and
                                overeager sonarmen may have accounted for many reports," but Defense Secretary
                                Robert McNamara did not report the captain's doubts to President Johnson. (A
                                2002 National Security Agency report made available in 2007 confirmed the
                                August 2 attack, but concluded the August 4 attack never happened.)
                            </p>
                        </Indented>

                        <FootnoteReturn href="#indecency" label="[Return to main text 6]" />
                    </section>

                    {/* ── Footnote 7: Clinton / Lewinsky ───────────────── */}
                    <section id="footnote-7">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">7.</a>
                        </p>

                        <p className="text-sm text-center italic mb-4">
                            "I did not have sexual relations with that woman, Miss Lewinsky."<br />
                            — President Bill Clinton, January 26, 1998
                        </p>

                        <YouTubeEmbed id="-K-VoGJtbWU" />

                        {lewinskiImg && (
                            <div className="my-4 text-center">
                                <img src={lewinskiImg.url} alt="Lewinsky" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            <strong>
                                The lies by President Clinton about a sexual relationship with a White House
                                intern, leading to his impeachment, created enormous distractions in the U.S.
                                government and vast divisions among the population.
                            </strong>{" "}
                            Incredibly, Clinton justified his dishonesty on the basis that telling the truth
                            could have cost him his presidency.
                        </p>

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                When Bill Clinton looks back at his denials that he had an affair with Monica
                                Lewinsky, he regrets lying, but also believes that telling the truth could have
                                cost him the presidency. . . . "I didn't do it because there was so much
                                hysteria and because I didn't know what Ken Starr was going to do to anybody,"
                                Clinton said. . . . Many people told him that telling the truth would have cost
                                him the White House.
                            </p>
                        </Indented>

                        <p className="text-sm">
                            "Clinton Torn Over Lying About Lewinsky,"{" "}
                            <a href="https://tinyurl.com/mrxmfyhj" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                ABC News
                            </a>, June 23, 2004.
                        </p>

                        <FootnoteReturn href="#indecency" label="[Return to main text 7]" />
                    </section>

                    {/* ── Footnote 8: Gulf War / Nayirah ───────────────── */}
                    <section id="footnote-8">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">8.</a>{" "}
                            At the beginning of the United States bombardment of Iraqi troops in 1991, a large
                            segment of the U.S. population opposed the war.{" "}
                            <strong>That all changed after the "Nayirah testimony"––false war propaganda.</strong>
                        </p>

                        <YouTubeEmbed id="LmfVs3WaE9Y" />

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                On October 10th, 1990, a 15-year-old girl who provided only her first name,
                                Nayirah, appeared before the United States Congressional Human Rights Caucus and
                                gave a testimony which was then used by the US Government as justification of
                                the Gulf War. In her emotional testimony, Nayirah claimed that after the Iraqi
                                invasion of Kuwait she had witnessed Iraqi soldiers take babies out of
                                incubators and leave them to die.
                                <br /><br />
                                President George Bush repeated the story at least ten times in the following
                                weeks. Her account of the atrocities helped to stir American opinion in favor of
                                participation in the Gulf War.
                                <br /><br />
                                <strong>Everything Nayirah said, as it turned out, was a lie.</strong> There
                                were, in actuality, only a handful of incubators in all of Kuwait. It was later
                                revealed that Nayirah was the daughter of the Kuwaiti Ambassador to the U.S.,
                                and her testimony was organized as part of a public relations campaign run by
                                the American PR firm Hill & Knowlton for the Kuwaiti government.
                            </p>
                        </Indented>

                        <FootnoteReturn href="#indecency" label="[Return to main text 8]" />
                    </section>

                    {/* ── Footnote 9: Iraq War / Bush / Hillary ─────────── */}
                    <section id="footnote-9">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">9.</a>
                        </p>

                        {bushImg && (
                            <div className="my-4 text-center">
                                <img src={bushImg.url} alt="President Bush" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed italic">
                            "The British government has learned that Saddam Hussein recently sought significant
                            quantities of uranium from Africa."<br />
                            — President George W. Bush, State of the Union Address, January 28, 2003
                            <br /><br />
                            "We do know, with absolute certainty, that he is using his procurement system to
                            acquire the equipment he needs . . . to build a nuclear weapon."<br />
                            — Vice-President Dick Cheney, September 8, 2002
                            <br /><br />
                            "We have to date found no evidence that Iraq has revived its nuclear weapon
                            program since the elimination of the program in the 1990's."<br />
                            — Mohamed ElBaradei, head of the International Atomic Energy Agency, January 2003
                        </p>

                        {bush2Img && (
                            <div className="my-4 text-center">
                                <img src={bush2Img.url} alt="Bush Iraq War" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                Bush and senior members of his administration spent more than a year outlining
                                the dangers that they claimed Iraq posed to the United States. Two of the
                                administration's arguments proved especially powerful: first, that Hussein's
                                regime possessed "weapons of mass destruction" (WMD); and second, that it
                                supported terrorism and had close ties to al-Qaida. As numerous investigations
                                subsequently found,{" "}
                                <strong>there was no factual basis for either of these assertions</strong>.
                            </p>
                        </Indented>

                        {hillaryImg && (
                            <div className="my-4 text-center">
                                <img src={hillaryImg.url} alt="Hillary Clinton" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            Among some other Democrats, Hillary Clinton supported the resolution authorizing
                            President Bush to take military action against Iraq—"with conviction," she said at
                            the time. She later waffled about whether she was right or wrong, with her
                            positions seeming to depend on her political situation. In 2008, "her pollster
                            found that most voters would react negatively if she acknowledged that her vote
                            was a mistake." In her 2014 book, <em>Hard Choices</em>, she wrote that she "got
                            it wrong." And in 2015, she said her vote was a "mistake."
                        </p>

                        <FootnoteReturn href="#indecency" label="[Return to main text 9]" />
                    </section>

                    {/* ── Footnote 10: Biden cognitive decline ─────────── */}
                    <section id="footnote-10">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">10.</a>
                        </p>

                        {bidenImg && (
                            <div className="my-4 text-center">
                                <img src={bidenImg.url} alt="President Biden" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            For a significant period of time before President Biden demonstrated his severe
                            cognitive decline during a disastrous debate with Donald Trump in June 2024, there
                            were many clear signs of major cognitive problems, of which members of his
                            administration and numerous journalists were aware. The public was badly deceived
                            in a manner that seriously diminished our democracy.
                        </p>

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                Jake Tapper now claims that the White House "was lying … to the press, the
                                public, their own Cabinet." But as a journalist, Tapper's surprise is both
                                revealing and disingenuous. His book shifts blame to Democrats, ignoring how
                                the media aided the cover-up. . . .
                                <br /><br />
                                Biden's disastrous June 2024 debate, where he blanked mid-sentence and claimed
                                "We finally beat Medicare," ended the charade. He soon dropped out. . . .
                                <br /><br />
                                The damage isn't just to journalism, it's to democracy itself.
                            </p>
                        </Indented>

                        <FootnoteReturn href="#indecency" label="[Return to main text 10]" />
                    </section>

                    {/* ── Footnote 11: Trump's lies ─────────────────────── */}
                    <section id="footnote-11">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">11.</a>
                        </p>

                        {trumpImg && (
                            <div className="my-4 text-center">
                                <img src={trumpImg.url} alt="Donald Trump" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            Donald Trump has engaged in tens of thousands of blatant lies, false innuendo, and
                            gross exaggerations, some of them repeated dozens or hundreds of times.
                        </p>

                        <Indented>
                            <p className="text-sm mb-4 leading-relaxed">
                                "Lying is second nature to him," Tony Schwartz (ghost-writer for Trump's{" "}
                                <em>The Art of the Deal</em>) said. "More than anyone else I have ever met,
                                Trump has the ability to convince himself that whatever he is saying at any
                                given moment is true, or sort of true, or at least ought to be true."
                            </p>
                        </Indented>

                        <p className="text-sm mb-4 leading-relaxed">
                            Following are just some examples of Trump's documented false statements and their
                            refutations:
                        </p>

                        <ul className="text-sm list-disc pl-6 space-y-3 mb-4">
                            <li>
                                <strong>Trump (January 23, 2017):</strong> "Between 3 million and 5 million
                                illegal votes caused me to lose the popular vote."
                                <br />
                                <em>Refutation:</em> Voting officials across the country have said there is
                                virtually no evidence of people voting illegally, and certainly not millions of
                                them.
                            </li>
                            <li>
                                <strong>Trump (2023):</strong> "I've won two Elections, the second far bigger
                                than the first (it was Rigged!)"
                                <br />
                                <em>Refutation:</em> Trump's former attorney general, William Barr, found no
                                evidence of widespread election fraud. Trump's allegations have been dismissed
                                by a succession of judges and refuted by state election officials.
                            </li>
                            <li>
                                <strong>Trump (January 8, 2019):</strong> "Over the years, thousands of
                                Americans have been brutally killed by those who illegally entered our country."
                                <br />
                                <em>Refutation:</em> Immigrants—including undocumented immigrants—are less
                                likely to commit crimes than U.S.-born Americans. This is true at the national,
                                state, county, and neighborhood levels.
                            </li>
                            <li>
                                <strong>Trump (September 23, 2025):</strong> "This 'climate change,' it's the
                                greatest con job ever perpetrated on the world, in my opinion."
                                <br />
                                <em>Refutation (The Royal Society):</em>{" "}
                                <strong>
                                    Global temperature is rising. Arctic summer sea ice cover has shrunk
                                    dramatically. Global average sea level has risen by approximately 16 cm
                                    since 1901.
                                </strong>{" "}
                                CO₂ levels are increasing primarily because of the combustion of fossil fuels.
                            </li>
                        </ul>

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                <strong>Democracy relies on the public agreeing on a body of reliable knowledge
                                and information.</strong> . . .{" "}
                                <strong>
                                    Both aspects have been eroded by the widespread dissemination of
                                    misinformation.
                                </strong>
                            </p>
                        </Indented>

                        <Indented>
                            <p className="text-sm italic mb-4 leading-relaxed">
                                <strong>
                                    Donald Trump's false statements about politics and policy strike at the very
                                    heart of democracy.
                                </strong>{" "}
                                If there are no agreed-upon facts, then it becomes impossible for people to make
                                judgments about their government or hold it accountable. As Timothy Snyder
                                argued, "To abandon facts is to abandon freedom. . . .{" "}
                                <strong>Post truth is pre-fascism.</strong>"
                            </p>
                        </Indented>

                        <FootnoteReturn href="#indecency" label="[Return to main text 11]" />
                    </section>

                    {/* ── Footnote 12: Treatment of immigrants ─────────── */}
                    <section id="footnote-12">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">12.</a>
                        </p>

                        {trump2Img && (
                            <div className="my-4 text-center">
                                <img src={trump2Img.url} alt="Donald Trump" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                                <p className="text-sm text-gray-600 mt-1 text-center italic">Donald Trump</p>
                                <p className="text-sm text-gray-600 mt-1 text-center">
                                    "They're bringing drugs, they're bringing crime. They're rapists."
                                </p>
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            When he first announced he was running for President in 2015, Donald Trump made
                            attacks against immigrants the center of his political pitch. He said: "When Mexico
                            sends its people, they're not sending the best. They're bringing drugs, they're
                            bringing crime. They're rapists and some, I assume, are good people."
                            <br /><br />
                            President Trump has repeatedly made false claims and used dehumanizing language
                            about immigrants:
                        </p>

                        <ul className="text-sm list-disc pl-6 space-y-3 mb-4">
                            <li>
                                Just as Adolf Hitler used the term "blood poisoning" in <em>Mein Kampf</em> to
                                describe the mixing of races, Donald Trump has claimed that immigrants are
                                "poisoning the blood" of our country.
                            </li>
                            <li>
                                Trump called nonwhite Haiti and African nations "shithole countries,"
                                questioning why the U.S. would want people from there.
                            </li>
                            <li>
                                Trump maliciously lied to many millions of viewers about Haitian immigrants,
                                falsely saying they had been eating dogs and cats in Ohio, contrary to the
                                unequivocal denials of police and a city manager. More than half of Trump's
                                2024 supporters believed this baseless claim.
                            </li>
                            <li>
                                The truth is that immigrants commit crimes at a significantly lower rate than
                                U.S.-born citizens. Nevertheless, Trump has repeatedly referred to immigrants
                                as violent criminals, and even compared them to Hannibal Lecter.
                            </li>
                            <li>
                                The Trump administration has held more than 170 U.S. citizens (many of them
                                Latino), including children, many of whom were assaulted, arrested, and
                                detained—often in brutal conditions.
                            </li>
                        </ul>

                        <Indented>
                            <Quote>
                                <em>
                                    Americans have been dragged, tackled, beaten, tased and shot by immigration
                                    agents. They've had their necks kneeled on. They've been held outside in the
                                    rain while in their underwear. At least three citizens were pregnant when
                                    agents detained them. . . . About two dozen Americans have said they were
                                    held for more than a day without being able to phone lawyers or loved ones.
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— Nicole Foy,{" "}
                                    <a href="https://www.propublica.org/article/immigration-dhs-american-citizens-arrested-detained-against-will" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                        Pro Publica
                                    </a>, October 16, 2025
                                </span>
                            </Quote>
                        </Indented>

                        <Indented>
                            <Quote>
                                <em>
                                    In the shadow of political posturing and enforcement quotas, a silent tragedy
                                    unfolds every day in the U.S. Immigration and Customs Enforcement raids
                                    homes, workplaces and even community spaces, leaving children in the wake
                                    of their parents' abrupt and often unexplained detention. These separations
                                    are not just logistical inconveniences; they are acts of profound harm —
                                    wounds that, though invisible, may never fully heal. . . . These are not
                                    isolated stories — they represent a national crisis, where the very fabric
                                    of family life is being unraveled.
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— Diana Fishbein,{" "}
                                    <a href="https://thehill.com/opinion/immigration/5441487-ice-raids-trauma-children/" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                        The Hill
                                    </a>, October 8, 2025
                                </span>
                            </Quote>
                        </Indented>

                        <Indented>
                            <Quote>
                                <em>
                                    The UN's top human rights official has raised alarm over what he described as
                                    the growing dehumanisation of migrants in the United States, warning that
                                    current immigration enforcement practices are undermining due process, family
                                    unity and basic human dignity. . . . High Commissioner Volker Türk said he
                                    was "astounded by the now-routine abuse and denigration of migrants and
                                    refugees."
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;—{" "}
                                    <a href="https://news.un.org/en/story/2026/01/1166816" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                        United Nations
                                    </a>, January 23, 2026
                                </span>
                            </Quote>
                        </Indented>

                        <FootnoteReturn href="#indecency" label="[Return to main text 12]" />
                    </section>

                    {/* ── Footnote 13: Extrajudicial killings ──────────── */}
                    <section id="footnote-13">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">13.</a>
                        </p>

                        <YouTubeEmbed id="R7_XRaNYjEo" />

                        <Indented>
                            <p className="text-sm mb-4 leading-relaxed">
                                <em>
                                    At least 61 people have been killed in 14 U.S. military strikes on boats in
                                    the Caribbean Sea and Pacific Ocean since early September. President Donald
                                    Trump has said he is targeting "narcoterrorists" who threaten American lives
                                    with lethal substances. . . . But Democratic Sen. Ruben Gallego of Arizona
                                    called the strikes "sanctioned murder." And without any evidence from the
                                    administration for its claims about the cargo or the identities and
                                    affiliations of the people on the boats, Republican Sen. Rand Paul of
                                    Kentucky said the strikes are "extrajudicial killings."
                                </em>
                                <br /><br />
                                — Alan Jaffe,{" "}
                                <a href="https://www.factcheck.org/2025/10/assessing-the-facts-and-legal-questions-about-the-u-s-strikes-on-alleged-drug-boats/" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                    FactCheck.org
                                </a>, October 30, 2025
                            </p>
                        </Indented>

                        <p className="text-sm mb-4 leading-relaxed">
                            The United Nations condemned the killings:
                        </p>

                        <Indented>
                            <Quote>
                                <em>
                                    UN experts today condemned the{" "}
                                    <strong>extrajudicial execution by the United States</strong> of 11 people
                                    when it sank a civilian vessel in the Caribbean Sea on 2 September 2025. . . .
                                    "International law does not allow governments to simply{" "}
                                    <strong>murder</strong> alleged drug traffickers," the experts said.
                                    "Criminal activities should be disrupted, investigated and prosecuted in
                                    accordance with the rule of law, including through international cooperation."
                                </em>
                            </Quote>
                        </Indented>

                        {cabinetImg && (
                            <div className="my-4 text-center">
                                <img src={cabinetImg.url} alt="Trump Cabinet" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            The New York City Bar Association issued an unequivocal condemnation:
                        </p>

                        <Indented>
                            <Quote>
                                <em>
                                    This September, President Donald J. Trump ordered U.S. military strikes
                                    against three private Venezuelan-flagged vessels on the high seas, killing
                                    at least 17 individuals. None of these attacks was authorized under U.S.
                                    law and, as explained below, each of them appears to be an unlawful summary
                                    execution prohibited by both U.S. and international law. . . . Because the
                                    recent attacks on Venezuelan vessels and their crews were unauthorized by
                                    U.S. law and in violation of binding international law,{" "}
                                    <strong>they were illegal summary executions – murders.</strong>
                                </em>{" "}
                                (Emphasis added.)
                            </Quote>
                        </Indented>

                        <YouTubeEmbed id="mZ2wtWhF6TQ" />

                        <p className="text-sm mb-4 leading-relaxed">
                            Amnesty International also condemned the killings, stating:
                        </p>

                        <Indented>
                            <Quote>
                                <em>
                                    Amnesty International strongly condemns these acts and reiterates that{" "}
                                    <strong>they constitute extrajudicial killings, a form of murder</strong>,
                                    prohibited under international law, and represent a grave affront to the
                                    most basic principles of humanity and legality. No circumstances justify the
                                    arbitrary deprivation of life. . . . According to a post from social network
                                    X, U.S. Southern Command reported that the total comes to at least 157
                                    deaths recorded so far in this type of attack.
                                </em>
                            </Quote>
                        </Indented>

                        <FootnoteReturn href="#indecency" label="[Return to main text 13]" />
                    </section>

                    {/* ── Footnote 14: Trump "total authority" claim ───── */}
                    <section id="footnote-14">
                        <HR />
                        <p className="text-base font-bold mb-4">
                            <a href="#indecency" className="text-blue-700 hover:underline">14.</a>
                        </p>

                        {trump3Img && (
                            <div className="my-4 text-center">
                                <img src={trump3Img.url} alt="Donald Trump" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                                <p className="text-sm text-gray-600 mt-1 text-center italic">
                                    "When somebody's the president of the United States, the authority is total."<br />
                                    "My own morality. My own mind. It's the only thing that can stop me."
                                </p>
                            </div>
                        )}

                        <p className="text-sm mb-4 leading-relaxed">
                            The United States was founded upon the fundamental principle that we would be
                            governed by law, not by the tyrannical dictates of one person or a cabal of elites
                            who are not accountable to the people.
                        </p>

                        {thomasPaineImg && (
                            <div className="my-4 text-center">
                                <img src={thomasPaineImg.url} alt="Thomas Paine" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                                <p className="text-sm text-gray-600 mt-1">Thomas Paine</p>
                            </div>
                        )}

                        <Indented>
                            <Quote>
                                <em>
                                    In America, the law is king. For as in absolute governments the King is law,
                                    so in free countries the law ought to be king; and there ought to be no other.
                                </em>
                                <br />
                                <span className="not-italic">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— Thomas Paine</span>
                            </Quote>
                        </Indented>

                        <p className="text-sm mb-4 leading-relaxed">
                            The Constitution provides that the Constitution, federal laws made pursuant to it,
                            and treaties are the "supreme Law of the Land." No one is above the law.
                        </p>

                        <YouTubeEmbed id="dMt8qCl5fPk" />

                        <p className="text-sm mb-4 leading-relaxed">
                            Before he was forced to resign after the threat of impeachment and conviction,
                            President Nixon stated that "When the President does it, that means it's not
                            illegal." Demonstrating why he should have been impeached if he had not resigned,
                            Nixon argued that if someone acted illegally on order of the President, that person
                            should not be held accountable—"I was just following orders" would be a defense.
                            <br /><br />
                            Sounding like another authoritarian Nixon, but perhaps even more subversive to our
                            constitutional republic, President Trump stated during his first term in office that
                            "When somebody's the president of the United States, the authority is total." More
                            recently, he declared, when asked if there were any limits on his global powers:
                            "Yeah, there is one thing. My own morality. My own mind. It's the only thing that
                            can stop me." When asked if international law would constrain him, President Trump
                            said, "I don't need international law."
                        </p>

                        <p className="text-sm mb-4 leading-relaxed">
                            That assertion by the President of the United States is diametrically the opposite
                            of what the Founders had in mind, what our Constitution provides, and what
                            differentiates a constitutional republic from a tyrannical dictatorship.
                        </p>

                        {madisonImg && (
                            <div className="my-4 text-center">
                                <img src={madisonImg.url} alt="James Madison" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                                <p className="text-sm text-gray-600 mt-1">James Madison</p>
                            </div>
                        )}

                        <Indented>
                            <Quote>
                                <em>
                                    The Constitution supposes, what the History of all Governments demonstrates,
                                    that the Executive is the branch of power most interested in war, and most
                                    prone to it.
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— James Madison, Letter to Thomas Jefferson 1798
                                </span>
                            </Quote>
                        </Indented>

                        <p className="text-sm mb-4 leading-relaxed">
                            For instance, the Founders sought to avoid one-person rule and made sure that
                            Congress, <em>not</em> the president, would have the sole power to make the
                            decision regarding whether the nation would go to war—except that the president
                            would have the power to repel sudden attacks.
                        </p>

                        <Indented>
                            <Quote>
                                <em>
                                    Congress shall have power: To declare War, grant Letters of Marque and
                                    Reprisal, and make Rules concerning Captures on Land and Water.
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— War Clause of the Constitution, Article I,
                                    Section 8, paragraph 11
                                </span>
                            </Quote>
                        </Indented>

                        {alexanderHamiltonImg && (
                            <div className="my-4 text-center">
                                <img src={alexanderHamiltonImg.url} alt="Alexander Hamilton" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                                <p className="text-sm text-gray-600 mt-1">Alexander Hamilton</p>
                            </div>
                        )}

                        <Indented>
                            <Quote>
                                <em>
                                    Those who are to conduct a war cannot in the nature of things, be proper or
                                    safe judges, whether a war ought to be commenced, continued or concluded.
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— Alexander Hamilton
                                </span>
                            </Quote>
                        </Indented>

                        {henryClayImg && (
                            <div className="my-4 text-center">
                                <img src={henryClayImg.url} alt="Henry Clay" className="w-full max-w-xl mx-auto rounded-xl shadow" />
                                <p className="text-sm text-gray-600 mt-1">Henry Clay</p>
                            </div>
                        )}

                        <Indented>
                            <Quote>
                                <em>
                                    Either Congress or the president must have the right of determining upon the
                                    objects for which a war shall be prosecuted. There is no other alternative.
                                    If the president possesses it and may prosecute it for objects against the
                                    will of Congress, where is the difference between our free government and
                                    that of any other nation which may be governed by an absolute czar, emperor
                                    or king?
                                </em>
                                <br />
                                <span className="not-italic">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— Henry Clay
                                </span>
                            </Quote>
                        </Indented>

                        <p className="text-sm mb-4 leading-relaxed">
                            Acting as an all-powerful dictator, contrary to the clear constraints of the
                            Constitution, domestic law, and international law, President Trump has ordered 157
                            or more extrajudicial killings of people in boats off the coast of Venezuela
                            (with no legal authorization whatsoever); he has ordered an invasion of Venezuela
                            and the arrest of its head of state without authorization by Congress or the
                            United Nations; he has threatened to "take" Greenland by force or coercion,
                            alienating our long-time NATO allies; and he has bombed and made war against Iran
                            without the authorization of Congress—all of which is consistent with his view
                            that he can do as he wants without any constraints (other than his own "morality"
                            and "mind"), but entirely inconsistent with the Constitution, domestic law,
                            international law, and our republican form of government.
                        </p>

                        <FootnoteReturn href="#indecency" label="[Return to main text 14]" />
                    </section>

                </div>
                {/* end footnotes */}

            </div>
            {/* end main content */}
        </div>
    );
}