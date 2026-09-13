import { Icons } from "@/components/ui/icons"
import type { ComponentType } from "react"


export interface Router {
    readonly path: string
    readonly match?: string
    readonly icon: ComponentType
}

export const routers: Router[] = [
    {
        path: '/dashboard',
        icon: Icons.dashboard
    },
    {
        path: '/logs',
        icon: Icons.logs
    },
    {
        path: '/admins',
        icon: Icons.admin
    },
    {
        path: "/maps",
        icon: Icons.map
    },
    {
        path: "/server",
        match: "/server/:tool?",
        icon: Icons.server
    },
    {
        path: "/mcp",
        icon: Icons.mcp
    },
    {
        path: "/bans",
        icon: Icons.bans
    }
]


export const paths = routers.map(r => r.path)

