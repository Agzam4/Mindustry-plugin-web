import { Icons } from "@/components/ui/icons"
import LogsPage from "@/pages/dashboard/DashboardPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import type { ComponentType, ReactNode } from "react"


export interface Router {
    readonly path: string
    readonly component: ReactNode
    readonly icon: ComponentType
}

export const routers: Router[] = [
    {
        path: '/dashboard',
        component: <DashboardPage />,
        icon: Icons.dashboard
    },
    {
        path: '/logs',
        component: <LogsPage />,
        icon: Icons.logs
    }
]


export const paths = routers.map(r => r.path)

