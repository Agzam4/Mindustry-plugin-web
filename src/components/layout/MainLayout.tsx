import { Navbar } from "@/components/elements/Navbar";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LogsPage from "@/pages/logs/LogsPage";
import { Suspense } from "react";
import { Redirect, Route } from "wouter";

import DesktopLayout from './DesktopLayout.module.scss';
import AuthPage from "@/pages/auth/AuthPage";
import AdminsPage from "@/pages/admins/AdminsPage";
import MapsPage from "@/pages/maps/MapsPage";

export function MainLayout() {
    return (
        <div className={DesktopLayout.layout}>
            <Navbar />

            <Suspense fallback={<div>Загрузка...</div>}>
                <Route path="/"><Redirect to="/dashboard" replace /></Route>
                <Route path="/dashboard"><DashboardPage /></Route>
                <Route path="/logs"><LogsPage /></Route>
                <Route path="/auth/:token">
                    {({ token }) => <AuthPage token={token} />}
                </Route>
                <Route path="/admins"><AdminsPage /></Route>
                <Route path="/maps/:type?/:id?">{(p) => <MapsPage type={p.type} id={p.id} />}</Route>
            </Suspense>
        </div>
    );
}
