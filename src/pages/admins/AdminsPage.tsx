import { memo, useCallback, useState } from 'react'
import type { LogEntity } from '@/api/gen/api'
import { LogsFilters } from '@/components/elements/logs/LogsFilters'
import { LogsFeed } from '@/components/elements/logs/LogsFeed'
import { LogsDetails } from '@/components/elements/logs/LogsDetails'
import { useLogFilterStore } from '@/components/elements/logs/useFiltersStore'
import { useSearchParams } from 'wouter'

import style from './AdminsPage.module.scss'
import AdminsList from '@/components/elements/admins/AdminsList'

export default function LogsPage() {


    return (
        <div className={style.panels}>
            <main className={style.center}>
                <AdminsList></AdminsList>
            </main>
        </div>
    )
}
