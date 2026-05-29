import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { type TokenProp } from "@/App";

const formSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
    cityState: z.string().min(1),
});

type FormData = z.infer<typeof formSchema>;

export default function PetitionSubmissionPage({ token }: TokenProp) {
    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            address: "",
            cityState: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        if(!token){
            return
        }

        try {
            await axios.post(`${API_BASE}/petition`, data, {headers: {
                    Authorization: `Bearer ${token}`,
                }});
            
            alert("Petition submitted successfully!");
            form.reset();
        } catch (err) {
            console.error(err);
            alert("Failed to submit petition");
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 text-left">

            {/* ================= TEXT SECTION ================= */}

            <p>
                Please sign and submit the <b>Petition for Decency, Integrity, and Accountability</b> below, demanding far greater decency on the part of candidates and elected government officials at the local, state, and federal level. Then we will submit to candidates and elected officials the <a href="http://localhost:5173/petition-pledge/pledge" style={{ color: "blue", textDecoration: "underline" }}>Pledge for Decency, Integrity, and Accountability</a> and ask them to sign and return it to us. Then we will provide to the public a <a href="http://localhost:5173/petition-pledge/certification" style={{ color: "blue", textDecoration: "underline" }}>Decency Certification</a> regarding each candidate and elected official to hold candidates and elected officials accountable.
            </p>

            <br />

            <h1 className="text-2xl font-bold mb-6 text-red-500 text-center">
                Petition for Decency, Integrity, and Accountability
            </h1>

            <div className="space-y-6 text-lg leading-relaxed">

                <div className="text-center">
                    <p>
                        <b>To:</b> Local, State, and Federally Elected Officials & Candidates<br />
                        <b>From:</b> The Undersigned Citizens of the United States
                    </p>
                </div>

                <br />

                <p>
                    We, the undersigned, recognize that public office is a sacred trust. The effectiveness of elected officials depends not only on the laws we enact but on the character and fundamental decency of those we choose to lead us. We hereby demand that every elected official pledge in writing to uphold the following standards of decency, integrity, and accountability:
                </p>

                <div>
                    <p className="font-bold">1. Ethical Leadership and Integrity</p>
                    <div className="pl-6">
                        <p>
                            Elected officials must conduct themselves with absolute honesty and transparency. We demand an end to corruption and self-dealing in all forms.
                        </p>
                    </div>
                </div>

                <div>
                    <p className="font-bold">2. War Powers and Constitutional Balance of Power</p>
                    <div className="pl-6">
                        <p>
                            We insist on the restoration of the constitutional balance of power regarding national security. We agree with the following statement by James Madison:<br /><br />

                            <em>
                                "The power to declare war, including the power of judging the causes of war is fully and exclusively vested in the legislature . . . the executive has no right, in any case, to decide the question, whether there is or is not cause for declaring war."
                            </em>
                            <br /><br />

                            Elected officials must pledge their insistence that <b>Congress, not the President, shall make the decision as to whether the United States will go to war or engage in acts of war.</b> The only exceptions shall be instances where (1) the U.S. is under direct military attack by another nation or (2) urgent action is required by the President, without an opportunity for Congress to make the decision, in the case of an imminent military attack. Elected officials at all levels of government must recognize that an abrogation by a President of Congress’s sole constitutional prerogative to decide whether war shall be commenced or that the nation shall engage in acts of war, shall be a prima facie basis for censure, impeachment, conviction, and removal from office, regardless of political partisanship.
                        </p>
                    </div>
                </div>

                <div>
                    <p className="font-bold">3. Civility and Good Manners</p>
                    <div className="pl-6">
                        <p>
                            Effective governance requires <b>civility</b> and <b>good manners</b>. We demand that elected officials treat their roles with the gravity they deserve, replacing inflammatory rhetoric, ad hominem attacks, and vindictive, self-serving conduct with reasoned discourse and temperate actions.
                        </p>
                    </div>
                </div>

                <div>
                    <p className="font-bold">4. Compassion and Kindness</p>
                    <div className="pl-6">
                        <p>
                            Leadership should be tempered with <b>kindness</b> and <b>compassion</b>. Decisions made in the halls of power should reflect a fundamental respect for the dignity and well-being of all individuals.
                        </p>
                    </div>
                </div>

                <div>
                    <p className="font-bold">5. Tolerance of Dissent</p>
                    <div className="pl-6">
                        <p>
                            We agree with the following statement of Theodore Roosevelt:
                        </p>

                        <br />

                        <p>
                            <i>
                                "It is patriotic to support [the President] insofar as he efficiently serves the country.
                                It is unpatriotic not to oppose him to the exact extent that by inefficiency or otherwise
                                he fails in his duty to stand by the country. In either event, it is unpatriotic not to
                                tell the truth, whether about the president or anyone else."
                            </i>
                        </p>

                        <br />

                        <p>
                            A healthy democracy requires <b>tolerance</b> toward political critics and opponents.
                            We demand that elected officials engage with opposing views through constructive,
                            civil dialogue rather than personal attacks, intimidation, or the weaponization of office
                            or government institutions.
                        </p>
                    </div>
                </div>

                <br />

                <p><b>Enforcement and Consequences</b></p>

                <p>
                    The commitments described above are not merely aspirational but represent what should be a
                    binding social contract between elected officials and those they are to serve. Should an elected
                    official fail to uphold these standards, we demand the following remedies and consequences:
                </p>

                <ul className="pl-6 list-disc">
                    <li>
                        <b>Public Censure and Full Accountability: </b>
                        We demand that legislative bodies utilize formal <b>censure resolutions</b> to publicly condemn
                        behavior that violates these standards of decency. For local and state officials, we advocate
                        for the use of <b>recall trials</b> or administrative hearings to adjudicate claims of significant indecency.
                    </li>

                    <li>
                        <b>Recall Elections: </b>
                        In the states that permit it, a <b>recall petition</b> should be initiated to remove an official from office
                        before their term expires if they engage in malfeasance, neglect of duty, corruption, abuse of power,
                        or significant indecency damaging to the government or the people the elected official is supposed to serve.
                    </li>

                    <li>
                        <b>Financial Penalties: </b>
                        We support legislation to suspend the salaries of officials who fail to perform their core constitutional duties.
                        Furthermore, we demand <b>significant fines and forfeiture of profits</b> for any official found guilty of <b>self-dealing
                        or insider trading</b>.
                    </li>

                    <li>
                        <b>Disqualification from Future Office: </b>
                        For egregious or continuing violations, including the unauthorized engagement in acts of war, corruption,
                        or dishonesty, we demand that the offending individual (1) be <b>prohibited from holding future elected office</b>
                        or (2) serving in appointed government roles for a period of no less than ten years.
                    </li>

                    <li>
                        <b>Independent Oversight and Investigations: </b>
                        We demand the empowerment of <b>independent ethics watchdogs</b> and <b>inspectors general</b> with the authority
                        to investigate allegations of misconduct without political interference.
                    </li>

                    <li>
                        <b>Electoral Consequences: </b>
                        We pledge to actively oppose the re-election of any elected official who demonstrates a pattern of intolerance,
                        dishonesty, or incivility, without respect to political affiliation. Our signatures serve as a collective non-partisan
                        commitment to <b>reject those who treat public office as a platform for personal gain</b>.
                    </li>
                </ul>

                <p>
                    By establishing these clear mechanisms for accountability, this petition seeks to ensure that the standards of conduct
                    remain a central component of governance rather than a collection of symbolic gestures. The implementation of such measures
                    serves to strengthen democratic integrity and restore public trust in governing institutions.
                </p>
            </div>

            {/* ================= FORM SECTION (BOXED) ================= */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-12 border border-gray-300 rounded-xl p-8 shadow-md bg-white"
            >
                <h2 className="text-xl font-semibold mb-6">
                    Sign the Petition
                </h2>

                <FieldSet>
                    <div className="grid gap-4">

                        <Controller
                            name="fullName"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Full Name</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Email (For internal use only) </FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="phone"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Phone Number (For internal use only) </FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="address"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Mailing Address (For internal use only) </FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="cityState"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>City, State</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />

                    </div>

                    <Button type="submit" className="mt-6 w-full">
                        Sign Petition
                    </Button>
                </FieldSet>
            </form>
        </div>
    );
}