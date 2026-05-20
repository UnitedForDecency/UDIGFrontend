import { useEffect, useRef, useState } from "react";
import "@/styles/dualCarousel.css";

interface ImageType {
    _id: string;
    url: string;
    page: string;
}

interface Props {
    page: string;
}

export default function DualCarousel({ page }: Props) {
    const [images, setImages] = useState<ImageType[]>([]);
    const topRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images?page=${page}`)
        .then((res) => res.json())
        .then((data) => setImages(data));
    }, [page]);

    useEffect(() => {
        if (!images.length || !topRef.current || !bottomRef.current) return;

        const topRow = topRef.current;
        const bottomRow = bottomRef.current;

        const allImgs = topRow.querySelectorAll<HTMLImageElement>("img");
        let loadedCount = 0;
        const total = allImgs.length;

        const onAllLoaded = () => {
        // Wait one rAF to ensure layout is complete
        requestAnimationFrame(() => {
            const topOneSet = topRow.scrollWidth / 2;
            const bottomOneSet = bottomRow.scrollWidth / 2;

            topRow.style.setProperty("--track-w", `${topOneSet}px`);
            bottomRow.style.setProperty("--track-w", `${bottomOneSet}px`);

            setReady(true);
        });
        };

        const checkLoad = () => {
        loadedCount++;
        if (loadedCount === total) onAllLoaded();
        };

        if (total === 0) {
        onAllLoaded();
        return;
        }

        allImgs.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) checkLoad();
        else {
            img.addEventListener("load", checkLoad);
            img.addEventListener("error", checkLoad);
        }
        });
    }, [images]);

    if (!images.length) return null;

    const mid = Math.ceil(images.length / 2);
    const topImages = images.slice(0, mid);
    const bottomImages = images.slice(mid);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Top row - scrolls left */}
        <div className="absolute top-0 left-0 w-full pt-4 overflow-hidden" style={{ height: "48%" }}>
            <div
            ref={topRef}
            className={`flex h-full gap-2 ${ready ? "animate-scroll-left" : ""}`}
            style={{ width: "max-content" }}
            >
            {[...topImages, ...topImages].map((img, idx) => (
                <img
                key={`top-${img._id}-${idx}`}
                src={img.url}
                alt=""
                className="carousel-image h-full object-cover"
                />
            ))}
            </div>
        </div>

        {/* Bottom row - scrolls right */}
        <div className="absolute bottom-0 left-0 w-full pb-4 overflow-hidden" style={{ height: "48%" }}>
            <div
            ref={bottomRef}
            className={`flex h-full gap-2 ${ready ? "animate-scroll-right" : ""}`}
            style={{ width: "max-content" }}
            >
            {[...bottomImages, ...bottomImages].map((img, idx) => (
                <img
                key={`bottom-${img._id}-${idx}`}
                src={img.url}
                alt=""
                className="carousel-image h-full object-cover"
                />
            ))}
            </div>
        </div>
        </div>
    );
}