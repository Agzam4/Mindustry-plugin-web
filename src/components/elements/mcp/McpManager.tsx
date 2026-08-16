import { ApiHooks } from "@/api/gen/api-hooks"
import ContextMenuWrapper from "@/components/ui/context/ContextMenuWrapper"
import HttpError from "@/components/ui/text/HttpError"

import style from './McpManager.module.scss'
import clsx from "clsx"
import { Api } from "@/api/gen/api"
import Text from "@/components/ui/Text"
import { useState } from "react"


export default function McpManager() {

    const [sessions, error, loading, setSessions] = ApiHooks.mcp.useTokens()

    if (error) return <HttpError error={error} />

    if (sessions)
        return <div>
            <div className={style.permissions}>{sessions.map(p => {
                return <div>Token <ContextMenuWrapper key={p.token} items={[
                    {
                        label: 'remove',
                        key: 'remove',
                        action: () => {
                            (async () => {
                                const [removed, err] = await Api.mcp.deleteToken({
                                    token: p.token
                                })
                                if (err) alert(err.message)
                                if (removed) {
                                    setSessions(() => sessions.filter(pp => p.token != pp.token))
                                }
                            })()
                        }
                    }
                ]} >
                    <span className={style.token}><Text>{p.token}</Text></span>
                </ContextMenuWrapper>
                    {location.href.startsWith("http://") && <Text>[red]Warning! You are using an unsafe HTTP connection. Your token could be intercepted.[]</Text>}
                    <div className={style.code}>                    <Text>
                        {`{
    "enabled": true,
    "url": [accent]"${location.href}/api/mcp/server"[],
    "headers": {
        [accent]"Agzam4-Authorization"[]: [accent]"${p.token}"[]
    }
}
`}
                    </Text></div>
                </div>
            })}
                <button className={clsx('no-button', style.permission)} onClick={() => {
                    (async () => {
                        const [added, err] = await Api.mcp.createToken()
                        if (err) alert(err.message)
                        if (added) {
                            setSessions(s => [...(s ?? []).filter(pp => pp.token != added), { token: added }])
                        }
                    })()
                }}><Text>[accent]Create new</Text></button>
            </div>
        </div >
    return "Loading..."
}
