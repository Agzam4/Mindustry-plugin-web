
import { type LogEntity } from '@/api/gen/api'
import { LogBuffer } from './LogBuffer'
import { type LogFilters } from './types'

export class LogPaginator {
    private buffer: LogBuffer
    private pageSize: number

    private pastIndex: number | null = null
    private futureIndex: number | null = null

    public logs: LogEntity[] = []
    public hasMoreOlder = true
    public hasMoreNewer = true
    public firstItemIndex: number | null = null
    public reallyFirstItemIndex: number | null = null

    constructor(filters: LogFilters, pageSize: number) {
        this.buffer = new LogBuffer(filters)
        this.pageSize = pageSize
    }

    async initialize(initId: number | null, fetchLastId: () => Promise<number | null>) {
        let lid = initId
        if (lid === null) {
            lid = await fetchLastId()
        }

        if (lid === null || lid <= 0) {
            this.hasMoreOlder = false
            this.logs = []
            return this
        }

        const startFrom = Math.floor(lid)
        const entries = await this.buffer.past(startFrom, this.pageSize)

        if (entries.length === 0) {
            this.hasMoreOlder = false
            this.logs = []
            return this
        }

        this.logs = entries
        const oldest = entries[0].globalId
        const newest = entries[entries.length - 1].globalId

        this.firstItemIndex = lid
        this.reallyFirstItemIndex = lid
        this.pastIndex = Math.max(0, newest - 1)
        this.futureIndex = newest + 1
        this.hasMoreOlder = oldest > 0
        this.hasMoreNewer = true

        return this
    }

    async loadOlder(): Promise<boolean> {
        if (!this.hasMoreOlder || this.pastIndex === null) return false

        const entries = await this.buffer.past(this.pastIndex, this.pageSize)

        if (entries.length === 0) {
            this.pastIndex = 0
            this.hasMoreOlder = false
            return true // состояние изменилось
        }

        this.pastIndex = entries[0].globalId - 1
        this.logs = [...entries, ...this.logs]

        if (this.firstItemIndex !== null) {
            this.firstItemIndex -= entries.length
        }

        if (entries.length < this.pageSize || entries[0].globalId <= 0) {
            this.hasMoreOlder = false
        }
        return true
    }

    async loadNewer(): Promise<boolean> {
        if (!this.hasMoreNewer || this.futureIndex === null) return false

        const entries = await this.buffer.future(this.futureIndex, this.pageSize)

        if (entries.length === 0) {
            this.futureIndex = this.futureIndex + 1
            this.hasMoreNewer = false
            return true
        }

        this.futureIndex = entries[entries.length - 1].globalId + 1
        this.logs = [...this.logs, ...entries]

        if (entries.length < this.pageSize) {
            this.hasMoreNewer = false
        }
        return true
    }
}
