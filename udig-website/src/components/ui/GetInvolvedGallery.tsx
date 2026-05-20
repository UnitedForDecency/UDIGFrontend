import { useEffect, useState } from "react";

interface ImageType {
    _id: string;
    url: string;
    page: string;
}

export default function GetInvolvedGallery() {
    const [images, setImages] = useState<ImageType[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images?page=getInvolved`)
        .then((res) => res.json())
        .then((data) => setImages(data));
    }, [])

    if (!images.length) return null;

    return (
        <section className="py-24">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-2xl font-semibold text-yale-blue mb-12 text-left">
                    Community in Action
                </h2>

                <div className="grid gris-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {images.map((img) => (
                        <div
                            key={img._id}
                            className="overflow-hidden rounded-lg bg-porcelain transition hover:shadow-lg duration-300 border-2 border-golden-bronze"
                        >
                            <img 
                                src={img.url}
                                alt=""
                                className="w-full h-64 object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}