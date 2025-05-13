'use client'

import React, { Fragment, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar/sidebar"
import checkStatus from "@/lib/status"

const AuthLayout = ({children}: 
    Readonly<{
    children: React.ReactNode;
  }>) => {

    const pathname = usePathname()

    useEffect(() => {
        checkStatus()
    }, [pathname])
  
    return (
        <Fragment>
            <div className="flex h-screen overflow-hidden">
                <Sidebar className="bg-purple-50 shrink-0" />
                <div className="flex-1 overflow-auto">
                        {children}
                </div>
            </div>
        </Fragment>
    )
}

export default AuthLayout