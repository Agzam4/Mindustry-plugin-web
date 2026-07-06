import { ApiHooks } from '@/api/gen/api-hooks'
import style from './DashboardPage.module.scss'

import Text from '@/components/ui/Text'
import Spoiler from '@/components/ui/text/Spoiler'
import Copyable from '@/components/ui/text/Copyable'

export default function DashboardPage() {
    const [data, err, loading] = ApiHooks.info.useMe()
    if (loading) return <div className={style.page}><div /><div>loading</div></div>;
    if (err) return <div className={style.page}><div /><div>Please, login first</div></div>;

    return <div className={style.page}>
        <div></div>
        <div className={style.profile}>
            <div className={style.playerName}>
                <Text>[accent]{data?.name}</Text>
            </div>
            <div className={style.separator}></div>
            <div className={style.playtime}>
                <Text>[white]Наиграно минут:[] {data?.playtime}</Text>
            </div>
            <div className={style.uuid}>
                <div>

                    <Text>[gray]Ваш UUID:[] {<Spoiler title='Отобразить uuid'><Copyable>{data?.uuid ?? ""}</Copyable></Spoiler>}</Text>
                </div>
                <div className={style.warn}>
                    <Text>[red]Утечка uuid может привести к краже аккаунта. Держите его в секрете</Text>
                </div>
            </div>
        </div>
    </div >
}
