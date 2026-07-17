import { Icons } from "@/components/ui/icons"
import type { ComponentType } from "react"


export interface Router {
    readonly path: string
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
        icon: Icons.dashboard
    }
]


export const paths = routers.map(r => r.path)

