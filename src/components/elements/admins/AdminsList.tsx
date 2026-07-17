import { ApiHooks } from "@/api/gen/api-hooks"
import Text from "@/components/ui/Text"


import style from './AdminsList.module.scss'
import HttpError from "@/components/ui/text/HttpError"
import clsx from "clsx"
import Spoiler from "@/components/ui/text/Spoiler"
import ContextMenuWrapper from "@/components/ui/context/ContextMenuWrapper"
import { Api } from "@/api/gen/api"
import Player from "@/components/ui/text/Player"
import { useState } from "react"

export default function AdminsList() {

    const [admins, error, loading] = ApiHooks.admins.useHelpers()
    const [_, update] = useState({})

    if (error) return <HttpError error={error} />;


    if (admins)
        return <div className={style.table}>
            <div className={clsx(style.header, style.name)}>Name</div>
            <div className={clsx(style.header, style.adminName)}>Admin name</div>
            <div className={clsx(style.header, style.permissions)}>Permissions</div>
            {admins?.map(admin => <>
                <div className={style.name}><Player id={admin.id} name={admin.name} /></div>
                {/* <div className={style.name}><Text>{admin.adminName ?? admin.name} {admin.adminName != admin.name && admin.adminName ? `[white](${admin.name}[white])` : ""}</Text></div> */}
                <div className={style.adminName}><Text>{admin.adminName ?? "-"}</Text></div>
                <div className={style.permissions}>{admin.permissions.sort().map(p => {
                    return <ContextMenuWrapper key={p} items={[
                        {
                            label: 'remove',
                            key: 'remove',
                            action: () => {
                                (async () => {
                                    const [removed, err] = await Api.admins.removePermission({
                                        id: admin.id,
                                        permission: p
                                    })
                                    if (err) alert(err.message)
                                    if (removed) {
                                        admin.permissions = admin.permissions.filter(pp => pp !== p)
                                        update({})
                                    }
                                })()
                            }
                        }
                    ]} >
                        <span className={style.permission}><Text>{p}</Text></span>
                    </ContextMenuWrapper>
                })}
                    <button className={clsx('no-button', style.permission)} onClick={() => {
                        const result = prompt('Permission');
                        if (!result) return

                        (async () => {
                            const [added, err] = await Api.admins.addPermission({
                                id: admin.id,
                                permission: result
                            })
                            if (err) alert(err.message)
                            if (added) {
                                admin.permissions.push(result)
                                update({})
                            }
                        })()

                    }}>+</button>
                </div>
            </>)}
        </div>

    return "loading..."
}
