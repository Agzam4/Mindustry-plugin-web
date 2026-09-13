import { useState } from "react"
import clsx from "clsx"
import { Api } from "@/api/gen/api"
import Text from "@/components/ui/Text"

import style from './JsConsole.module.scss'

export default function JsConsole() {
    const [code, setCode] = useState("")
    const [output, setOutput] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [running, setRunning] = useState(false)

    const run = async () => {
        if (running || !code.trim()) return
        setRunning(true)
        setOutput(null)
        setError(null)
        const [result, err] = await Api.server.js({ js: code })
        if (err) setError(err.message)
        else setOutput(result)
        setRunning(false)
    }

    return <div className={style.console}>
        <textarea
            className={style.textarea}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault()
                    run()
                }
            }}
            spellCheck={false}
            placeholder="print('Hello, Mindustry!')"
        />
        <div className={style.actions}>
            <button
                className={clsx("no-button", style.run)}
                onClick={run}
                disabled={running || !code.trim()}
            >
                {running ? "Running..." : "Run"}
            </button>
        </div>
        {error !== null && <div className={style.error}><Text>[red]Error: {error}[]</Text></div>}
        {output !== null && <pre className={style.output}>{output}</pre>}
    </div>
}