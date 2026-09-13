import { Link } from "wouter"
import clsx from "clsx"
import Separator from "@/components/ui/base/Separator"
import JsConsole from "@/components/elements/server/JsConsole"

import style from "./ServerPage.module.scss"

export default function ServerPage({ tool }: { tool?: string }) {
    return (
        <main className={style.panels}>
            <aside className={style.left}>
                <Separator>Server</Separator>
                <Link href="/server/js" className={clsx(style.item, tool === "js" && style.active)}>JS Console</Link>
            </aside>
            <main className={style.center}>
                {tool === "js" && <JsConsole />}
            </main>
        </main>
    )
}