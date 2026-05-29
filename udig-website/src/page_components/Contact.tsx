// import { SocialIcon } from "react-social-icons";

const glowBlobs = [
    {
        position: "-top-25 -left-15",
        color: "bg-blue-300",
    },
    {
        position: "-bottom-25 -right-15",
        color: "bg-red-300",
    },
];

export default function Contact() {
    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-alice-blue to-white px-4 py-16">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100">

                {/* soft glow accents */}
                {glowBlobs.map((blob, i) => (
                    <div
                        key={i}
                        className={`absolute h-96 w-96 rounded-full blur-3xl ${blob.position} ${blob.color}`}
                    />
                ))}

                <div className="relative z-10 p-12 text-center">

                    {/* heading */}
                    <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-yale-blue">
                        Let’s talk
                    </h1>

                    <p className="mb-10 text-lg leading-relaxed text-gray-600 max-w-md mx-auto">
                        Questions, ideas, local tips, or something we should know about in your community —
                        we’re here and listening.
                    </p>

                    {/* EMAIL CARD */}
                    <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
                        <p className="mb-2 text-xs uppercase tracking-widest text-gray-400">
                            Email us
                        </p>

                        <a
                            href="mailto:rocky.udig@gmail.com"
                            className="text-lg font-semibold text-yale-blue hover:underline break-all"
                        >
                            rocky.udig@gmail.com
                        </a>
                    </div>

                    {/* SOCIAL */}
                    {/* <div>
                        <p className="mb-4 text-xs uppercase tracking-widest text-gray-400">
                            Follow us
                        </p>

                        <div className="flex justify-center gap-5">
                            <div className="hover:scale-110 transition-transform">
                                <SocialIcon url="https://x.com" bgColor="#0a0a0a" fgColor="#ffffff" />
                            </div>
                            <div className="hover:scale-110 transition-transform">
                                <SocialIcon url="https://youtube.com" bgColor="#e41515" fgColor="#ffffff" />
                            </div>
                            <div className="hover:scale-110 transition-transform">
                                <SocialIcon url="https://instagram.com" bgColor="#ac8443" fgColor="#ffffff" />
                            </div>
                            <div className="hover:scale-110 transition-transform">
                                <SocialIcon url="https://tiktok.com" bgColor="#0f0f0e" fgColor="#ffffff" />
                            </div>
                        </div>
                    </div> */}

                </div>
            </div>
        </section>
    );
}