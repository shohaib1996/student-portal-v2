// import React, { useState, useEffect, useRef } from 'react';
// import { useTheme } from 'next-themes';
// import Link from 'next/link';
// import { useRouter, usePathname } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { useDispatch, useSelector } from 'react-redux';

// // Shadcn components
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu';
// import { Switch } from '@/components/ui/switch';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// // Lucide Icons
// import {
//     Bell,
//     BellDot,
//     Captions,
//     Calendar,
//     LogOut,
//     MessageSquare,
//     Moon,
//     Search,
//     ScrollText,
//     Settings,
//     Sun,
//     User,
//     X,
//     ChevronDown,
//     Phone,
// } from 'lucide-react';

// // Redux
// import { persistor } from '@/redux/store';
// // Utils
// import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import TopbarRoutes from './TopbarRoutes';
// import { setSound } from '@/redux/features/notificationReducer';
// import { setCompanySwitcher } from '@/redux/features/comapnyReducer';
// import { useAppSelector } from '@/redux/hooks';
// // import TopbarRoutes from '../TopbarRoutes';

// dayjs.extend(relativeTime);

// // Types
// interface User {
//     _id: string;
//     fullName: string;
//     email: string;
//     profilePicture?: string;
//     type?: string;
//     family?: {
//         relation?: string;
//         user?: {
//             _id: string;
//             fullName: string;
//             email: string;
//             profilePicture?: string;
//         }
//     };
// }

// interface Company {
//     _id: string;
//     name: string;
// }

// interface Feature {
//     key: string;
//     name: string;
// }

// interface Event {
//     _id: string;
//     title: string;
//     start: Date;
//     end: Date;
//     createdBy?: {
//         _id: string;
//     };
// }

// interface Notification {
//     _id: string;
//     read: boolean;
// }

// interface Chat {
//     _id: string;
//     unreadCount: number;
// }

// interface Route {
//     name: string;
//     route: string;
// }

// const Header = () => {
//     const { theme, setTheme, resolvedTheme } = useTheme();
//     const router = useRouter();
//     const dispatch = useDispatch();

//     // Redux state
//     const { isAuthenticated, user } = useAppSelector((state) => state.auth);
//     const { companies, features, companySwitcher } = useAppSelector((state) => state.company);
//     // const { chats } = useAppSelector((state) => state.chat);
//     const { notifications, unReadNotification } = useAppSelector((state) => state.notification);
//     // const { upcommingEvents, events, monthIndex } = useAppSelector((state) => state.calendar);
//     const { displayMode } = useAppSelector((state: any) => state.theme);

//     const pathname = usePathname();

//     // Local state
//     const [selectedProgram, setSelectedProgram] = useState<any>(null);
//     const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
//     const [searchOpen, setSearchOpen] = useState<boolean>(false);
//     const [searchedRoutes, setSearchedRoutes] = useState<Route[]>([]);
//     const [focused, setFocused] = useState<boolean>(false);
//     const [isSound, setISound] = useState<boolean>(true);
//     const [isOnOrOff, setIsOnOrOff] = useState<string>("on");

//     const searchRef = useRef<HTMLDivElement>(null);
//     const routes = TopbarRoutes();

//     const activeCompany = Cookies.get("activeCompany");
//     const isChatAvailable = features?.find((f: Feature) => f.key === "chat");
//     const isCalendarAvailable = features?.find((f: Feature) => f.key === "calendar");

//     // Theme toggle function
//     const toggleTheme = () => {
//         setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
//     };

//     // Logout function
//     const handleLogout = () => {
//         Cookies.remove(process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME as string, {
//             domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
//         });
//         persistor.purge();
//         window.location.href = process.env.NEXT_PUBLIC_REDIRECT_URL || "/login";
//     };

//     // Search function
//     const handleChangeSearch = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => {
//         e.preventDefault();
//         if ('target' in e && 'value' in e.target && e.target.value) {
//             const value = e.target.value as string;
//             const filterNav = routes.filter((x: Route) =>
//                 x.name.toLowerCase().includes(value.toLowerCase())
//             );
//             setSearchedRoutes(filterNav);
//         } else {
//             setSearchedRoutes([]);
//         }
//     };

//     // Sound toggle function
//     const handleSound = () => {
//         localStorage.setItem("isSoundOn", isOnOrOff === "on" ? "off" : "on");
//         setIsOnOrOff(localStorage.getItem("isSoundOn") || "off");
//     };

//     // Event click handler
//     // function handleClickOnEventName(e: React.MouseEvent, evt: Event, monthIndex: number) {
//     //     e.stopPropagation();
//     //     if (evt?.createdBy?._id && user) {
//     //         if (evt?.createdBy?._id !== user?._id) {
//     //             // other created event id
//     //             // show event detail
//     //             handleOpenEventDetailRoute(evt._id);
//     //         } else {
//     //             clickOnEventName(evt, monthIndex);
//     //             router.push("/dashboard/calendar");
//     //         }
//     //     } else {
//     //         clickOnEventName(evt, monthIndex);
//     //         router.push("/dashboard/calendar");
//     //     }
//     // }

//     function handleOpenEventDetailRoute(eventId: string) {
//         let to = "/dashboard/calendar?view=month&detail=";
//         /*
//         if (router.query["view"] === "day") {
//           if (router.query["date"]) {
//             to = `/dashboard/calendar?view=day&date=${router.query["date"]}&detail=`;
//           } else {
//             to = "/dashboard/calendar?view=day&detail=";
//           }
//         }
//         */

//         if (eventId) {
//             to += eventId;
//         }
//         router.push(to);
//     }

//     // Load events on mount
//     // useEffect(() => {
//     //     const fetchEvents = async () => {
//     //         try {
//     //             const response = await fetch("/calendar/event/myevents");
//     //             const data = await response.json();

//     //             const eventArray = data.events.map((e: any) => ({
//     //                 ...e,
//     //                 start: new Date(e.start),
//     //                 end: new Date(e.end),
//     //             }));
//     //             dispatch(setEvents(eventArray));
//     //         } catch (err) {
//     //             console.error(err);
//     //         }
//     //     };

//     //     fetchEvents();
//     // }, []);

//     // Window resize listener
//     useEffect(() => {
//         const handleResize = () => setWidth(window.innerWidth);
//         window.addEventListener("resize", handleResize);
//         return () => {
//             window.removeEventListener("resize", handleResize);
//         };
//     }, []);

//     // Click outside search results handler
//     useEffect(() => {
//         const handleClick = (e: MouseEvent) => {
//             if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
//                 setSearchedRoutes([]);
//             }
//         };
//         window.addEventListener("click", handleClick);
//         return () => window.removeEventListener("click", handleClick);
//     }, []);

//     // Init sound settings
//     useEffect(() => {
//         setISound(localStorage.getItem("isSoundOn") === "on" ? true : false);
//         setIsOnOrOff(localStorage.getItem("isSoundOn") || "on");
//         dispatch(setSound(localStorage.getItem("isSoundOn") as 'on' | 'off'));
//     }, [isOnOrOff]);

//     useEffect(() => {
//         const soundSetting = localStorage.getItem("isSoundOn") || "on";
//         localStorage.setItem("isSoundOn", soundSetting);
//         setISound(soundSetting === "on");
//         setIsOnOrOff(soundSetting);
//     }, []);

//     // Search form component
//     const searchForm = (
//         <form
//             className="flex items-center gap-2 bg-background rounded-lg px-3 py-2"
//             onSubmit={handleChangeSearch}
//         >
//             <button onClick={handleChangeSearch} type="submit" className="text-muted-foreground">
//                 <Search size={18} />
//             </button>
//             <input
//                 className="bg-transparent text-foreground outline-none flex-1"
//                 type="text"
//                 placeholder="Search"
//                 onChange={(e) => handleChangeSearch(e)}
//                 onFocus={() => setFocused(true)}
//                 onBlur={() => setFocused(false)}
//             />

//             {searchedRoutes.length > 0 && (
//                 <div className="absolute top-12 left-0 w-full bg-background border rounded-md shadow-md z-50" ref={searchRef}>
//                     {searchedRoutes.map((route) => (
//                         <Link
//                             key={route.name}
//                             href={route.route}
//                             className="block p-2 hover:bg-muted text-foreground"
//                         >
//                             {route.name}
//                         </Link>
//                     ))}
//                 </div>
//             )}
//         </form>
//     );

//     return (
//         <>
//             <div className="sticky top-0 z-20 w-full">
//                 <nav
//                     className={`${displayMode === "dark" ? "bg-background" : "bg-primary"} text-primary-foreground`}
//                 >
//                     <div className="container mx-auto px-4">
//                         <div className="flex items-center justify-between h-16">
//                             {/* Logo */}
//                             <div className="flex items-center">
//                                 <Link href="/dashboard" className="flex items-center">
//                                     <img
//                                         src="/SchoolHubs-logo-final-white.png"
//                                         alt="logo"
//                                         className="h-8"
//                                     />
//                                 </Link>
//                             </div>

//                             {/* Search - desktop */}
//                             {width > 740 && (
//                                 <div className="relative w-64 mx-4">
//                                     {searchForm}
//                                 </div>
//                             )}

//                             {/* Right side nav items */}
//                             {!searchOpen && (
//                                 <div className="flex items-center space-x-2">
//                                     {/* Mobile search toggle */}
//                                     {width < 740 && (
//                                         <Button
//                                             onClick={() => setSearchOpen(!searchOpen)}
//                                             variant="ghost"
//                                             size="icon"
//                                         >
//                                             <Search className="h-5 w-5" />
//                                         </Button>
//                                     )}

//                                     {/* Company switcher */}
//                                     <TooltipProvider>
//                                         <Tooltip>
//                                             <TooltipTrigger asChild>
//                                                 <Button
//                                                     onClick={() => dispatch(setCompanySwitcher(true))}
//                                                     variant="secondary"
//                                                     className="md:flex hidden"
//                                                 >
//                                                     {companies?.find((c: Company) => c._id === activeCompany)?.name || "Select Company"}
//                                                     <ChevronDown className="ml-2 h-4 w-4" />
//                                                 </Button>
//                                             </TooltipTrigger>
//                                             <TooltipContent>
//                                                 <p>Switch Company/University</p>
//                                             </TooltipContent>
//                                         </Tooltip>
//                                     </TooltipProvider>

//                                     {/* Manual link */}
//                                     {width > 1000 && (
//                                         <Button
//                                             variant="secondary"
//                                             className="flex items-center gap-2"
//                                             asChild
//                                         >
//                                             <Link href="/docs" target="_blank">
//                                                 <ScrollText className="h-4 w-4 mr-2" />
//                                                 Manual
//                                             </Link>
//                                         </Button>
//                                     )}

//                                     {/* Calendar icon */}
//                                     {/* {isAuthenticated && isCalendarAvailable && (
//                                         <DropdownMenu>
//                                             <DropdownMenuTrigger asChild>
//                                                 <Button
//                                                     variant="ghost"
//                                                     size="icon"
//                                                     className="relative"
//                                                     onClick={() => {
//                                                         if (upcommingEvents?.length === 0) {
//                                                             router.push("/dashboard/calendar");
//                                                         }
//                                                     }}
//                                                 >
//                                                     <Calendar className="h-5 w-5" />
//                                                     {upcommingEvents?.length > 0 && (
//                                                         <Badge
//                                                             variant="destructive"
//                                                             className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
//                                                         >
//                                                             {upcommingEvents?.length}
//                                                         </Badge>
//                                                     )}
//                                                 </Button>
//                                             </DropdownMenuTrigger>

//                                             {upcommingEvents?.length > 0 && (
//                                                 <DropdownMenuContent align="end" className="w-80">
//                                                     <div className="max-h-96 overflow-auto p-2 space-y-2">
//                                                         {upcommingEvents?.map((event: Event) => (
//                                                             <Card
//                                                                 key={event._id}
//                                                                 className="cursor-pointer hover:bg-muted"
//                                                             // onClick={(e) => handleClickOnEventName(e, event, monthIndex)}
//                                                             >
//                                                                 <CardContent className="p-3 space-y-2">
//                                                                     <p className="font-semibold">{event.title}</p>
//                                                                     <p className="text-sm text-muted-foreground">
//                                                                         {dayjs(event.start).format("DD MMM, YYYY - hh:mm A")}
//                                                                     </p>
//                                                                     <p className="text-sm text-muted-foreground">
//                                                                         Starts {dayjs(event.start).fromNow()}
//                                                                     </p>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         ))}
//                                                     </div>
//                                                 </DropdownMenuContent>
//                                             )}
//                                         </DropdownMenu>
//                                     )} */}

//                                     {/* Chat icon */}
//                                     {isAuthenticated && isChatAvailable && (
//                                         <DropdownMenu>
//                                             <DropdownMenuTrigger asChild>
//                                                 <Button variant="ghost" size="icon" className="relative">
//                                                     <MessageSquare className="h-5 w-5" />
//                                                     {/* {chats && chats.filter((chat: Chat) => chat?.unreadCount > 0).length > 0 && (
//                                                         <Badge
//                                                             variant="destructive"
//                                                             className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
//                                                         >
//                                                             {chats.filter((chat: Chat) => chat?.unreadCount > 0).length}
//                                                         </Badge>
//                                                     )} */}
//                                                 </Button>
//                                             </DropdownMenuTrigger>
//                                             <DropdownMenuContent align="end" className="w-80">
//                                                 {/* <ChatMenu /> */}
//                                             </DropdownMenuContent>
//                                         </DropdownMenu>
//                                     )}

//                                     {/* Notifications icon */}
//                                     {isAuthenticated && (
//                                         <DropdownMenu>
//                                             <DropdownMenuTrigger asChild>
//                                                 <Button variant="ghost" size="icon" className="relative">
//                                                     <Bell className="h-5 w-5" />
//                                                     {notifications && unReadNotification > 0 && (
//                                                         <Badge
//                                                             variant="destructive"
//                                                             className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
//                                                         >
//                                                             {unReadNotification > 99 ? "99+" : unReadNotification}
//                                                         </Badge>
//                                                     )}
//                                                 </Button>
//                                             </DropdownMenuTrigger>
//                                             <DropdownMenuContent align="end" className="w-80">
//                                                 {/* <MenuNotifications /> */}
//                                             </DropdownMenuContent>
//                                         </DropdownMenu>
//                                     )}

//                                     {/* Theme toggle */}
//                                     {width > 600 && (
//                                         <Button
//                                             variant="ghost"
//                                             size="icon"
//                                             // onClick={() => handleRadioChecked(displayMode)}
//                                             className="rounded-full"
//                                         >
//                                             {displayMode === "dark" ? (
//                                                 <Sun className="h-5 w-5" />
//                                             ) : (
//                                                 <Moon className="h-5 w-5" />
//                                             )}
//                                         </Button>
//                                     )}

//                                     {/* User Menu */}
//                                     {isAuthenticated ? (
//                                         <DropdownMenu>
//                                             <DropdownMenuTrigger asChild>
//                                                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//                                                     <Avatar>
//                                                         <AvatarImage src={user?.profilePicture || "/placeholder2.jpg"} alt={user?.fullName} />
//                                                         <AvatarFallback>{user?.fullName || ''}</AvatarFallback>
//                                                     </Avatar>
//                                                 </Button>
//                                             </DropdownMenuTrigger>
//                                             <DropdownMenuContent align="end" className="w-80">
//                                                 <div className="flex items-center gap-3 p-4 border-b">
//                                                     <Avatar className="h-12 w-12">
//                                                         <AvatarImage src={user?.profilePicture || "/placeholder2.jpg"} alt={user?.fullName} />
//                                                         <AvatarFallback>{user?.fullName || ''}</AvatarFallback>
//                                                     </Avatar>
//                                                     <div>
//                                                         <p className="font-medium">{user?.fullName}</p>
//                                                         <p className="text-sm text-muted-foreground">{user?.email}</p>
//                                                     </div>
//                                                 </div>

//                                                 {user?.type === "family" && user?.family?.user && (
//                                                     <div className="p-2 border-b">
//                                                         <p className="text-center text-sm mb-2">
//                                                             {user?.family?.relation} of
//                                                         </p>
//                                                         <div className="flex items-center gap-3 px-2">
//                                                             <Avatar className="h-8 w-8">
//                                                                 <AvatarImage src={user?.family?.user?.profilePicture || "/placeholder2.jpg"} alt={user?.family?.user?.fullName} />
//                                                                 <AvatarFallback>{user?.family?.user?.fullName || ''}</AvatarFallback>
//                                                             </Avatar>
//                                                             <div>
//                                                                 <p className="font-medium">{user?.family?.user?.fullName}</p>
//                                                                 <p className="text-xs text-muted-foreground">{user?.family?.user?.email}</p>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 <div className="p-2">
//                                                     <Link href="/dashboard/my-profile" className={`flex items-center gap-2 p-2 rounded-md ${pathname === "/dashboard/my-profile" ? "bg-muted" : "hover:bg-muted"}`}>
//                                                         <User className="h-4 w-4" />
//                                                         <span>My Profile</span>
//                                                     </Link>

//                                                     <Link href="/dashboard/payment-history" className={`flex items-center gap-2 p-2 rounded-md ${pathname === "/dashboard/payment-history" ? "bg-muted" : "hover:bg-muted"}`}>
//                                                         <ScrollText className="h-4 w-4" />
//                                                         <span>Payments</span>
//                                                     </Link>

//                                                     <Link href="/dashboard/agreement" className={`flex items-center gap-2 p-2 rounded-md ${pathname === "/dashboard/agreement" ? "bg-muted" : "hover:bg-muted"}`}>
//                                                         <ScrollText className="h-4 w-4" />
//                                                         <span>Agreements</span>
//                                                     </Link>

//                                                     <Link href="/dashboard/change-password" className={`flex items-center gap-2 p-2 rounded-md ${pathname === "/dashboard/change-password" ? "bg-muted" : "hover:bg-muted"}`}>
//                                                         <Settings className="h-4 w-4" />
//                                                         <span>Change Password</span>
//                                                     </Link>

//                                                     <Link href="/dashboard/notification-preferences" className={`flex items-center gap-2 p-2 rounded-md ${pathname === "/dashboard/notification-preferences" ? "bg-muted" : "hover:bg-muted"}`}>
//                                                         <BellDot className="h-4 w-4" />
//                                                         <span>Notification Preferences</span>
//                                                     </Link>

//                                                     <Link href="https://portal.bootcampshub.ai/docs" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
//                                                         <ScrollText className="h-4 w-4" />
//                                                         <span>User Manual</span>
//                                                     </Link>

//                                                     <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
//                                                         <div className="flex items-center gap-2">
//                                                             <Bell className="h-4 w-4" />
//                                                             <span>Notification</span>
//                                                         </div>
//                                                         <Switch
//                                                             checked={isSound}
//                                                             onCheckedChange={handleSound}
//                                                         />
//                                                     </div>

//                                                     {width < 600 && (
//                                                         <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
//                                                             <span>Theme</span>
//                                                             <Button
//                                                                 variant="ghost"
//                                                                 size="icon"

//                                                                 className="rounded-full"
//                                                             >
//                                                                 {displayMode === "dark" ? (
//                                                                     <Sun className="h-4 w-4" />
//                                                                 ) : (
//                                                                     <Moon className="h-4 w-4" />
//                                                                 )}
//                                                             </Button>
//                                                         </div>
//                                                     )}

//                                                     <Button
//                                                         variant="destructive"
//                                                         className="w-full mt-2"
//                                                         onClick={handleLogout}
//                                                     >
//                                                         <LogOut className="h-4 w-4 mr-2" />
//                                                         <span>Logout</span>
//                                                     </Button>

//                                                     {width < 1260 && (
//                                                         <Button
//                                                             variant="secondary"
//                                                             className="w-full mt-2"
//                                                             onClick={() => dispatch(setCompanySwitcher(true))}
//                                                         >
//                                                             {companies?.find((c: Company) => c._id === activeCompany)?.name || "Select Company"}
//                                                             <ChevronDown className="ml-2 h-4 w-4" />
//                                                         </Button>
//                                                     )}
//                                                 </div>
//                                             </DropdownMenuContent>
//                                         </DropdownMenu>
//                                     ) : (
//                                         <div className="flex items-center gap-2">
//                                             <Button
//                                                 onClick={() => router.push("/auth/login")}
//                                                 variant="secondary"
//                                             >
//                                                 Sign In
//                                             </Button>
//                                             <Button
//                                                 onClick={() => router.push("/auth/register")}
//                                             >
//                                                 Sign Up
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Mobile search form */}
//                             {width < 740 && searchOpen && (
//                                 <div className="flex items-center space-x-2 w-full">
//                                     <div className="flex-1 relative">
//                                         {searchForm}
//                                     </div>
//                                     <Button
//                                         onClick={() => setSearchOpen(false)}
//                                         variant="ghost"
//                                         size="icon"
//                                     >
//                                         <X className="h-5 w-5" />
//                                     </Button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </nav>
//             </div>

//             {/* {selectedProgram && (
//                 <EnrollmentModal
//                     isModalVisible={Boolean(selectedProgram)}
//                     setIsModalVisible={() => setSelectedProgram(null)}
//                     program={selectedProgram}
//                     activeTab="demo"
//                 />
//             )} */}
//         </>
//     );
// };

// export default Header;
