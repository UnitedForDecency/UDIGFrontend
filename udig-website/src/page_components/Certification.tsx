export default function Certification() {
    return (
        <div className="max-w-4xl mx-auto px-8 py-16 text-left">

            {/* ================= CERTIFICATION SECTION ================= */}

                <p className="text-base leading-relaxed text-gray-800 text-lg mb-8">
                    After the Pledge of Decency, Integrity, and Accountability has been submitted to elected officials and candidates for elective office, a Decency Certification will be published and circulated, according to the following standards:
                </p>

                <h3 className="text-2xl font-bold text-center tracking-wide text-red-500 mb-10 text-3xl">
                    Certification Program: “Certified for Decency”
                </h3>

                <div className="space-y-6 text-base leading-relaxed">

    <div className="flex gap-3 items-start text-xl">
        <span className="w-3 h-3 mt-2 rounded-full bg-green-500 shrink-0" />
        <div>
            <p className="font-bold">Certified for Decency:</p>
            <p className="text-gray-800">
                Signed pledge + no verified violations
            </p>
        </div>
    </div>

    <div className="flex gap-3 items-start text-xl">
        <span className="w-3 h-3 mt-2 rounded-full bg-yellow-400 shrink-0" />
        <div>
            <p className="font-bold">Provisionally Certified:</p>
            <p className="text-gray-800">
                Minor concerns under review
            </p>
        </div>
    </div>

    <div className="flex gap-3 items-start text-xl">
        <span className="w-3 h-3 mt-2 rounded-full bg-red-500 shrink-0" />
        <div>
            <p className="font-bold">Not Certified:</p>
            <p className="text-gray-800">
                Refused to sign or significant violations
            </p>
        </div>
    </div>

    <div className="flex gap-3 items-start text-xl">
        <span className="w-3 h-3 mt-2 rounded-full bg-black shrink-0" />
        <div>
            <p className="font-bold">Decertified:</p>
            <p className="text-gray-800">
                Serious or repeated violations after signing
            </p>
        </div>
    </div>

</div>
            </div>
    );
}