"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"

const dashboardRoutes = ["/student", "/faculty", "/admin"]

export default function ConditionalNavFooter({ children }) {
    const pathname = usePathname()
    const isDashboard = dashboardRoutes.some((r) => pathname?.startsWith(r))

    if (isDashboard) {
        return <>{children}</>
    }

    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
