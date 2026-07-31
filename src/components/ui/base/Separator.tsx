import style from './Sparator.module.scss'


export default function Separator({ children }: { children: string }) {
    return <div className={style.separator}>
        {children}
    </div>
}
