import NiceModal, { useModal } from '@ebay/nice-modal-react';
import * as Dialog from '@radix-ui/react-dialog';
import styleBase from '../BaseDialog.module.scss'
import { BaseDialog } from '../BaseDialog';
import { ApiHooks } from '@/api/gen/api-hooks';
import Text from '@/components/ui/Text';

import style from './PlayerProfile.module.scss'
import { TimeBefore } from '@/components/ui/text/TimeBefore';
import Spoiler from '@/components/ui/text/Spoiler';
import Copyable from '@/components/ui/text/Copyable';

export const PlayerProfile = NiceModal.create(({ player }: { player: number }) => {
    const modal = useModal();


    const [info, error, loading] = ApiHooks.info.usePlayerTrace({ id: player });

    const now = Date.now()

    return (<BaseDialog modal={modal} title={`${info?.name ?? "loading"} profile`} description='trace about player'>
        {info &&
            <>
                <div className={style.title}><Text>[accent]{info?.name} {info.admin ? "[red](admin)" : info.helper ? "[yellow](helper)" : ""}</Text></div>

                {info.uuid && <Spoiler title='Отобразить uuid'><Copyable>{info.uuid ?? ""}</Copyable></Spoiler>}
                <div className={style.gap}></div>

                {
                    info.permissions &&
                    <div className={style.group}>
                        <div className={style.separator}>Permissions</div>
                        <div><Text>[white]{info.permissions.length ? info.permissions.join(", ") : "[]no permissions"}</Text></div>
                    </div>
                }

                <div className={style.group}>
                    <div className={style.separator}>Stats</div>
                    <div><Text>[white]Playtime:[] {info.playtime} minutes</Text></div>
                    <div><Text>[white]Times joined:[] {info.timesJoined}</Text></div>
                    <div><Text>{info.timesKicked === 0 ? '[green]' : '[white]'}Times kicked:{info.timesKicked === 0 ? '' : '[]'} { }{info.timesKicked}</Text></div>
                </div>
                <div className={style.group}>
                    <div className={style.separator}>Bans</div>
                    {
                        !info.permaban && !info.dosBlacklist ?
                            <Text>[green]No active bans</Text> :
                            <>
                                {info.permaban && <b><Text>[red]PERMABAN</Text></b>}
                                {info.dosBlacklist && <Text>[red]Dos ban</Text>}
                            </>
                    }

                    {
                        now < info.lastKicked ?
                            <>
                                <div><Text>[white]Kicked: [red]<TimeBefore end={info.lastKicked} /></Text></div>
                                <div><Text>[white]Until: [red]{new Date(info.lastKicked).toLocaleString()}</Text></div>
                            </> :
                            info.lastKicked ?
                                <div><Text>[white]Last kick ended:[] {new Date(info.lastKicked).toLocaleString()}</Text></div> :
                                <div><Text>{info.permaban || info.dosBlacklist ? "" : "[green]"}Kicks not found</Text></div>
                    }
                </div>

                {
                    info.names &&
                    <div className={style.group}>
                        <div className={style.separator}>Names history</div>
                        {info.names.map(name => <div><Text>[white]{name}</Text></div>)}
                    </div>
                }

                {
                    (info.ip !== undefined && info.ips !== undefined) &&
                    <div className={style.group}>
                        <div className={style.separator}>IP history</div>
                        <div className={style.gap}></div>
                        <div><Text>[white]Last IP:[] <Spoiler>{info.ip}</Spoiler></Text></div>
                        <div className={style.gap}></div>
                        <Spoiler>
                            {info.ips.map(ip => <div><Text>[white]{ip}</Text></div>)}
                        </Spoiler>
                    </div>
                }
            </>}
    </BaseDialog >)

})
