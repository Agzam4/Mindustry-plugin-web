import BansList from "@/components/elements/bans/BansList"
import style from './BansPage.module.scss'

export default function BansPage({ group }: { group?: string }) {
    return <div className={style.panels}>
        <div></div>
        <div className={style.center}>
            <BansList selectedGroup={group} />
        </div>
    </div>
}
