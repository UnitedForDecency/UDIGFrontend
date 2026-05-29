import { useState, useEffect } from "react";

type Section = {
    id: string;
    title: string;
    teaser: string;
    content: React.ReactNode;
};

const SECTIONS: Section[] = [
    {
        id: "help",
        title: "Please help UDIG",
        teaser: "How your contribution will help UDIG achieve its goal.",
        content: (
            <>
                <ul className="list-disc list-inside space-y-3 text-lg">
                    <li>Expose indecency by government officials in local, state, and federal governments.</li>
                    <li>Raise awareness among the public about what can be done to restore decency and reduce unnecessary divisiveness.</li>
                    <li>Organize people throughout the nation to effectively demand far greater decency, including accountability, on the part of government officials.</li>
                </ul>
                <p className="text-lg leading-relaxed">
                    United for Decency in Government (UDIG) was founded to help people of various political stripes organize in a{" "}
                    <span className="font-bold">non-partisan fashion</span> to make a real difference.{" "}
                    <span className="font-bold">
                        We will amplify your individual voice into a loud collective roar for real change.
                    </span>
                </p>
            </>
        ),
    },
    {
        id: "final",
        title: "Please contribute today",
        teaser: "See how collective action can make a real difference.",
        content: (
            <>
                <p className="text-2xl font-bold">Please contribute today!</p>
                <p className="text-lg">Only if we each do our part can we achieve the changes we so badly need.</p>
                <p className="text-xl font-bold">We CAN do this — together!</p>
                <p className="text-lg leading-relaxed">
                    We-the-people — organizing, working, and advocating together, regardless of our partisan differences — can demand and achieve{" "}
                    <span className="font-bold">
                        a more honest, accountable, compassionate government that truly serves the interests of the public,
                    </span>{" "}
                    not just the interests of politicians and the demands of wealthy contributors.
                </p>
                <p className="text-lg leading-relaxed">
                    Please join UDIG, a non-partisan organization, in raising awareness about what we can all do, as we organize and act together,{" "}
                    <span className="font-bold">to transform each of our lone voices into a collective roar for real change.</span>
                </p>
            </>
        ),
    },
];

function launchCelebration() {
    const existing = document.getElementById("confetti-canvas");
    if (existing) existing.remove();

    const canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    Object.assign(canvas.style, {
        position: "fixed",
        top: "0",
        left: "0",
        pointerEvents: "none",
        zIndex: "9999",
        width: "100vw",
        height: "100vh",
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const colors = ["#ff6b6b", "#feca57", "#54a0ff", "#1dd1a1", "#5f27cd"];
    const confetti = Array.from({ length: 150 }, () => ({
        x: Math.random() * W,
        y: Math.random() * -H,
        r: 4 + Math.random() * 4,
        d: Math.random() * 150,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: 0,
        tiltAngle: 0,
        tiltAngleIncrement: 0.05 + Math.random() * 0.07,
    }));

    let frame: number;
    let elapsed = 0;
    const duration = 6000;
    let last = performance.now();

    function draw(now: number) {
        elapsed += now - last;
        last = now;
        ctx.clearRect(0, 0, W, H);
        confetti.forEach((c) => {
            ctx.beginPath();
            ctx.lineWidth = c.r;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt, c.y);
            ctx.lineTo(c.x + c.tilt + c.r, c.y + c.tilt);
            ctx.stroke();
            c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
            c.x += Math.sin(c.d);
            c.tiltAngle += c.tiltAngleIncrement;
            c.tilt = Math.sin(c.tiltAngle) * 15;
            if (c.y > H) { c.y = -10; c.x = Math.random() * W; }
        });
        if (elapsed < duration) {
            frame = requestAnimationFrame(draw);
        } else {
            cancelAnimationFrame(frame);
            canvas.remove();
        }
    }
    frame = requestAnimationFrame(draw);

    const balloonColors = ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7", "#a29bfe"];
    for (let i = 0; i < 10; i++) {
        const b = document.createElement("div");
        const dur = 10 + Math.random() * 10;
        Object.assign(b.style, {
            position: "fixed",
            bottom: "-150px",
            left: Math.random() * 100 + "%",
            width: "60px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: balloonColors[i % balloonColors.length],
            zIndex: "9998",
            animation: `floatUp ${dur}s linear forwards`,
            pointerEvents: "none",
        });
        const string = document.createElement("div");
        Object.assign(string.style, {
            position: "absolute",
            bottom: "-20px",
            left: "50%",
            width: "2px",
            height: "20px",
            background: "#555",
        });
        b.appendChild(string);
        document.body.appendChild(b);
        setTimeout(() => b.remove(), (dur + 1) * 1000);
    }

    if (!document.getElementById("balloon-style")) {
        const style = document.createElement("style");
        style.id = "balloon-style";
        style.textContent = `
            @keyframes floatUp {
                from { transform: translateY(0); opacity: 1; }
                to   { transform: translateY(-120vh); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function ThankYouModal({ onClose }: { onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[10000]"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 text-center space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-6xl">🎉</div>
                <h2 className="text-3xl font-bold text-yale-blue">Thank You!</h2>
                <p className="text-lg text-graphite leading-relaxed">
                    Your contribution makes a real difference. Together, we are building a louder, stronger collective voice for decency and accountability in government.
                </p>
                <p className="text-base font-semibold text-graphite">
                    We CAN do this — together!
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 px-8 py-3 rounded-2xl bg-yale-blue text-white text-lg font-semibold hover:bg-yale-blue/90 transition"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

function AccordionCard({
    section,
    isOpen,
    onToggle,
}: {
    section: Section;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border border-yale-blue rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center px-6 py-5 bg-porcelain transition font-bold text-2xl"
            >
                {section.title}
                <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>▼</span>
            </button>
            {!isOpen && (
                <p className="px-6 py-2 text-sm text-graphite italic bg-porcelain">
                    {section.teaser}
                </p>
            )}
            {isOpen && (
                <div className="px-6 py-6 space-y-6 bg-white">
                    {section.content}
                </div>
            )}
        </div>
    );
}

export default function Contribute() {
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [showThankYou, setShowThankYou] = useState(false);

    useEffect(() => {
        function handleMessage(e: MessageEvent) {
            if (e.origin !== "https://donorbox.org") return;
            if (
                typeof e.data === "string"
                    ? e.data.includes("donated")
                    : e.data?.event === "donated"
            ) {
                launchCelebration();
                setShowThankYou(true);
            }
        }
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    //Test: press T to trigger
    // useEffect(() => {
    //     function handleKey(e: KeyboardEvent) {
    //         if (e.key === "t") {
    //             launchCelebration();
    //             setShowThankYou(true);
    //         }
    //     }
    //     window.addEventListener("keydown", handleKey);
    //     return () => window.removeEventListener("keydown", handleKey);
    // }, []);

    const toggleSection = (section: string) => {
        setOpenSection((current) => (current === section ? null : section));
    };

    return (
        <section className="flex flex-col items-center bg-alice-blue w-full">
            {showThankYou && <ThankYouModal onClose={() => setShowThankYou(false)} />}

            {/* INTRO */}
            <div className="w-full py-20 px-6 flex justify-center">
                <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-6">
                    <h1 className="text-4xl font-bold underline underline-offset-4 decoration-brick-ember">
                        Want to make a difference?
                    </h1>

                    <p className="text-lg leading-relaxed max-w-2xl">
                        We are all fed up with abuses of power by government officials of all political stripes, with{" "}
                        <span className="font-bold">
                            partisanship and self-interest taking priority over principle and the public interest.
                        </span>{" "}
                        Oftentimes it even seems that meanness, spite, and retribution are the sole motivations for much that is done by government officials.
                    </p>

                    {/* DONORBOX IFRAME */}
                    <div className="w-full flex justify-center">
                        <iframe
                            src="https://donorbox.org/embed/united-for-decency-in-government"
                            name="donorbox"
                            allowFullScreen
                            seamless
                            frameBorder="0"
                            scrolling="no"
                            height="750"
                            style={{
                                width: "425px",
                                minWidth: "250px",
                                display: "block",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* COLLAPSIBLE CONTENT AREA */}
            <div className="w-full py-20 px-6 flex justify-center">
                <div className="max-w-4xl w-full space-y-6">
                    {SECTIONS.map((section) => (
                        <AccordionCard
                            key={section.id}
                            section={section}
                            isOpen={openSection === section.id}
                            onToggle={() => toggleSection(section.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}