

import style from './HttpError.module.scss'

export default function HttpError({ error }: { error: { code: number, message: string } }) {
    return <div className={style.error}>{error.code} | {error.message}</div>
}
