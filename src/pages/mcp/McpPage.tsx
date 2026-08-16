import McpManager from "@/components/elements/mcp/McpManager";
import style from './McpPage.module.scss'


export default function McpPage() {
    return <div className={style.panels}>
        <div></div>
        <div className={style.center}>
            <McpManager />
        </div>
    </div>
}
