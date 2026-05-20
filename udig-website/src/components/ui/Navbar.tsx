import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown, MenuIcon } from "lucide-react";
import udigLogo from "../../assets/UDIGLogo.png";
import { useState, useRef } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger } from "./drawer";
import { Button } from "./button";
import { Collapsible, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { CollapsibleContent } from "./collapsible";

type MenuItem = "about" | "programs" | "get-involved" | null;

interface NavbarProps {
    isLoggedIn: boolean;
    isAdmin: boolean;
    onLogout: () => void;
}

export default function Navbar({ isLoggedIn, isAdmin, onLogout }: NavbarProps) {
    const [openItem, setOpenItem] = useState<MenuItem>(null);
    const closeTimeout = useRef<number | null>(null);

    // Opens menu and cancels any pending close
    const openMenu = (item: Exclude<MenuItem, null>) => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        setOpenItem(item);
    };

    // Delays closing menu to give user time to hover into dropdown
    const closeMenu = () => {
        closeTimeout.current = window.setTimeout(() => {
            setOpenItem(null);
        }, 200); // 200ms delay
    };

    const navItems = [
        { name: "Contact", href: "/contact" },
        { name: "Contribute", href: "/contribute" },
    ];

    return (
        <div>
            <div className="desktop-only">
                <nav className="w-full bg-yale-blue px-6 py-3 flex items-center justify-between relative z-50">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3">
                        <img src={udigLogo} alt="UDIG Logo" className="w-12" />
                        <div className="text-left">
                            <h3 className="text-porcelain font-bold">UDIG</h3>
                            <h3 className="text-porcelain font-semibold">United for Decency in Government</h3>
                        </div>
                    </a>

                    {/* Nav Items */}
                    <div className="flex items-center gap-6 text-porcelain relative">
                        <NavigationMenu.Root>
                            <NavigationMenu.List className="flex items-center gap-6 text-porcelain relative">

                                {/* ABOUT */}
                                <NavigationMenu.Item
                                    onMouseEnter={() => openMenu("about")}
                                    onMouseLeave={closeMenu}
                                >
                                    <NavigationMenu.Trigger className="flex items-center gap-1 cursor-pointer">
                                        <a href="/about" className="hover:underline">UDIG</a>
                                        <ChevronDown size={16} />
                                    </NavigationMenu.Trigger>
                                    <NavigationMenu.Content
                                        onMouseEnter={() => openMenu("about")}
                                        onMouseLeave={closeMenu}
                                        className={`absolute mt-2 pt-2 bg-white text-graphite rounded-md shadow-lg p-3 min-w-[180px] transition-all duration-200 ${
                                            openItem === "about"
                                                ? "opacity-100 translate-y-0 pointer-events-auto"
                                                : "opacity-0 -translate-y-2 pointer-events-none"
                                        }`}
                                    >
                                        <ul className="flex flex-col gap-2">
                                            <li><a href="/about" className="hover:underline">Our Vision and Mission</a></li>
                                            <li><a href="/impact" className="hover:underline">What is UDIG</a></li>
                                            <li><a href="/about/leadership" className="hover:underline">Leadership</a></li>
                                            <li><a href="/about/history" className="hover:underline">Our Story</a></li>
                                            <li><a href="/about/press-coverage" className="hover:underline">Press Coverage</a></li>
                                        </ul>
                                    </NavigationMenu.Content>
                                </NavigationMenu.Item>

                                {/* PROGRAMS */}
                                <NavigationMenu.Item
                                    onMouseEnter={() => openMenu("programs")}
                                    onMouseLeave={closeMenu}
                                >
                                    <NavigationMenu.Trigger className="flex items-center gap-1 cursor-pointer">
                                        <a href="/programs" className="hover:underline">Programs</a>
                                        <ChevronDown size={16} />
                                    </NavigationMenu.Trigger>
                                    <NavigationMenu.Content
                                        onMouseEnter={() => openMenu("programs")}
                                        onMouseLeave={closeMenu}
                                        className={`absolute mt-2 pt-2 bg-white text-graphite rounded-md shadow-lg p-3 min-w-[180px] transition-all duration-200 ${
                                            openItem === "programs"
                                                ? "opacity-100 translate-y-0 pointer-events-auto"
                                                : "opacity-0 -translate-y-2 pointer-events-none"
                                        }`}
                                    >
                                        <ul className="flex flex-col gap-2">
                                            <li><a href="/programs/essays" className="hover:underline">Essays</a></li>
                                            <li><a href="/programs/videos" className="hover:underline">Videos</a></li>
                                            <li><a href="/programs/bookclub" className="hover:underline">Book Club</a></li>
                                            <li><a href="/programs/issues" className="hover:underline">Current Issues</a></li>
                                        </ul>
                                    </NavigationMenu.Content>
                                </NavigationMenu.Item>

                                {/* GET INVOLVED */}
                                <NavigationMenu.Item
                                    onMouseEnter={() => openMenu("get-involved")}
                                    onMouseLeave={closeMenu}
                                >
                                    <NavigationMenu.Trigger className="flex items-center gap-1 cursor-pointer">
                                        <a href="/get-involved" className="hover:underline">Get Involved</a>
                                        <ChevronDown size={16} />
                                    </NavigationMenu.Trigger>
                                    <NavigationMenu.Content
                                        onMouseEnter={() => openMenu("get-involved")}
                                        onMouseLeave={closeMenu}
                                        className={`absolute mt-2 pt-2 bg-white text-graphite rounded-md shadow-lg p-3 min-w-[180px] transition-all duration-200 ${
                                            openItem === "get-involved"
                                                ? "opacity-100 translate-y-0 pointer-events-auto"
                                                : "opacity-0 -translate-y-2 pointer-events-none"
                                        }`}
                                    >
                                        <ul className="flex flex-col gap-2">
                                            <li><a href="/get-involved/volunteer" className="hover:underline">Volunteer</a></li>
                                            <li><a href="/get-involved/events" className="hover:underline">Events</a></li>
                                            <li><a href="/get-involved/petitions" className="hover:underline">Petitions and Campaigns</a></li>
                                            <li><a href="/get-involved/community" className="hover:underline">Community</a></li>
                                            <li><a href="/get-involved/socialmedia" className="hover:underline">Social Media</a></li>
                                            <li><a href="/get-involved/guides" className="hover:underline">Guides</a></li>
                                        </ul>
                                    </NavigationMenu.Content>
                                </NavigationMenu.Item>

                                {/* Normal Links */}
                                {navItems.map((item) => (
                                    <NavigationMenu.Item key={item.name}>
                                        {item.external ? (
                                            <NavigationMenu.Link
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline font-semibold"
                                            >
                                                {item.name}
                                            </NavigationMenu.Link>
                                        ) : (
                                            <NavigationMenu.Link href={item.href} className="hover:underline">
                                                {item.name}
                                            </NavigationMenu.Link>
                                        )}
                                    </NavigationMenu.Item>
                                ))}
                            </NavigationMenu.List>
                        </NavigationMenu.Root>
        \
                        {/* Login / Admin Links */}
                        {!isLoggedIn ? (
                            <a href="/login" className="font-semibold hover:underline">Login</a>
                        ) : (
                            <>
                                {isAdmin ? (
                                    <a href="/admin" className="font-semibold hover:underline">Admin Dashboard</a>
                                ) : (
                                    <a href="/" className="font-semibold hover:underline">My Account</a>
                                )}
                                <button
                                    onClick={onLogout}
                                    className="ml-3 font-semibold hover:underline text-red-500"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            </div>
            <div className="mobile-only">
                <nav className="w-full bg-yale-blue px-6 py-3 flex items-center justify-between relative z-50">
                    <Drawer
                        key="nav"
                        direction="left"
                    >
                        <DrawerTrigger asChild>
                            <Button variant="outline" className="bg-yale-blue border-0 text-porcelain">
                                <MenuIcon/>
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="bg-yale-blue flex">
                            <DrawerHeader className="flex flex-row justify-between">
                                <div className="text-lg text-porcelain font-bold">
                                    <h2>UDIG</h2>
                                    <h2>United for Decency in Government</h2>
                                    {/* Replace with icon? */}
                                </div>
                                <DrawerClose asChild>
                                    <Button variant="ghost" className="w-fit text-porcelain hover:bg-alice-blue">X</Button>
                                </DrawerClose>
                            </DrawerHeader>

                            {/* Nav list */}
                            <div className="px-6 py-3 flex flex-col items-start gap-5 text-porcelain">

                                {/* ABOUT */}
                                <Collapsible>
                                    <CollapsibleTrigger className="flex pt-2 px-5 min-w-[30vw]">UDIG</CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ul className="flex flex-col gap-2 p-5 pt-2 ml-4">
                                            <li><a href="/about" className="hover:underline">Our Vision and Mission</a></li>
                                            <li><a href="/impact" className="hover:underline">What is UDIG</a></li>
                                            <li><a href="/about/leadership" className="hover:underline">Leadership</a></li>
                                            <li><a href="/about/history" className="hover:underline">Our Story</a></li>
                                        </ul>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* PROGRAMS */}
                                <Collapsible>
                                    <CollapsibleTrigger className="flex pt-2 px-5 min-w-[30vw]">Programs</CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ul className="flex flex-col gap-2 p-5 pt-2 ml-4">
                                            <li><a href="/programs" className="hover:underline">Our Programs</a></li>
                                            <li><a href="/programs/essays" className="hover:underline">Essays</a></li>
                                            <li><a href="/programs/videos" className="hover:underline">Videos</a></li>
                                            <li><a href="/programs/bookclub" className="hover:underline">Book Club</a></li>
                                            <li><a href="/programs/blogs" className="hover:underline">Blog Posts</a></li>
                                        </ul>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* GET INVOLVED */}
                                <Collapsible>
                                    <CollapsibleTrigger className="flex pt-2 px-5 min-w-[30vw]">Get Involved</CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ul className="flex flex-col gap-2 p-5 pt-2 ml-4">
                                            <li><a href="/get-involved" className="hover:underline">How to get involved</a></li>
                                            <li><a href="/get-involved/volunteer" className="hover:underline">Volunteer</a></li>
                                            <li><a href="/get-involved/events" className="hover:underline">Events</a></li>
                                            <li><a href="/get-involved/petitions" className="hover:underline">Petitions and Campaigns</a></li>
                                            <li><a href="/get-involved/community" className="hover:underline">Community</a></li>
                                        </ul>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* Normal Links */}
                                <div className="flex-col flex px-5 pt-2">
                                    <a href="/contact">Contact</a>
                                    <a href="/contribute" className="pt-7">Contribute</a>
                                </div>

                                {!isLoggedIn ? (
                                    <a href="/login" className="font-semibold hover:underline px-5 py-2">Login</a>
                                ) : (
                                    <>
                                        {isAdmin ? (
                                            <a href="/admin" className="font-semibold hover:underline px-5 py-2">Admin Dashboard</a>
                                        ) : (
                                            <a href="/" className="font-semibold hover:underline px-5 py-2">My Account</a>
                                        )}
                                        <button
                                            onClick={onLogout}
                                            className="ml-3 font-semibold hover:underline text-red-500 px-5 py-2"
                                        >
                                            Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </DrawerContent>
                    </Drawer>
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3">
                        <div className="text-right">
                            <h3 className="text-porcelain font-bold">UDIG</h3>
                            <h3 className="text-porcelain font-semibold">United for Decency in Government</h3>
                        </div>
                        <img src={udigLogo} alt="UDIG Logo" className="w-12" />
                    </a>
                </nav>
            </div>
        </div>
    );
}
