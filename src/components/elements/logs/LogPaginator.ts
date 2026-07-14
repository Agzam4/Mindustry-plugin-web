
import { type LogEntity } from '@/api/gen/api'
import { LogBuffer } from './LogBuffer'
import { type LogFilters } from './types'

export class LogPaginator {

    private static ids = 0
    public readonly id = LogPaginator.ids++

    private buffer: LogBuffer
    private pageSize: number

    private minIndex: number | null = null // past
    private maxIndex: number | null = null // future

    public logs: LogEntity[] = []

    public canDecrease = true // has past
    public canIncrease = true // has future

    public firstItemIndex: number | null = null
    public initFromIndex: number | null = null

    constructor(filters: LogFilters, pageSize: number) {
        this.buffer = new LogBuffer(filters)
        this.pageSize = pageSize
    }

    async initialize(initId: number, signal: AbortSignal) {
        let lid = initId

        if (lid < 0) {
            this.canDecrease = false
            this.logs = []
            return this
        }

        const first = Math.max(this.pageSize, lid)
        const entries = await this.buffer.past(first, this.pageSize, signal)

        if (entries.length === 0) {
            this.canDecrease = false
            this.logs = []
            return this
        }

        this.logs = entries
        // console.log(this.logs)
        const minimum = entries[0].globalId
        const maximum = entries[entries.length - 1].globalId

        this.firstItemIndex = minimum
        this.initFromIndex = lid

        this.minIndex = Math.max(0, minimum - 1)
        this.maxIndex = maximum + 1
        // console.log(`[${this.minIndex}, ${this.maxIndex}]`)

        this.canDecrease = minimum > 0
        this.canIncrease = true

        return this
    }

    async loadMin(): Promise<boolean> {
        if (!this.canDecrease || this.minIndex === null) return false

        const entries = await this.buffer.past(this.minIndex, this.pageSize)

        if (entries.length === 0) {
            this.minIndex = 0
            this.canDecrease = false
            return true
        }

        this.minIndex = entries[0].globalId - 1
        console.log(`[${this.minIndex}, ${this.maxIndex}]`)
        this.logs = [...entries, ...this.logs]
        console.log(this.logs)

        if (this.firstItemIndex !== null) {
            this.firstItemIndex -= entries.length
        }

        if (entries.length < this.pageSize || entries[0].globalId <= 0) {
            this.canDecrease = false
            console.log("bottom limit")
        }
        return true
    }

    async loadMax(): Promise<boolean> {
        if (!this.canIncrease || this.maxIndex === null) return false

        const entries = await this.buffer.future(this.maxIndex, this.pageSize)

        if (entries.length === 0) {
            this.maxIndex = this.maxIndex + 1
            this.canIncrease = false
            return true
        }

        this.maxIndex = entries[entries.length - 1].globalId + 1
        console.log(`[${this.minIndex}, ${this.maxIndex}]`)
        this.logs = [...this.logs, ...entries]
        console.log(this.logs)

        if (entries.length < this.pageSize) {
            this.canIncrease = false
            console.log("top limit")
        }
        return true
    }

    /* Is <= 1 loading required to reach value */
    loadNear(target: number, onFuture: () => void, onPast: () => void) {
        if (target < 0) return true
        console.log("near")

        if (this.maxIndex !== null && this.minIndex !== null) {
            if (this.minIndex <= target && target <= this.maxIndex) {
                // this.initFromIndex = target
                return true // already inside
            }
            if (this.minIndex <= target && target <= this.maxIndex + this.pageSize) {
                console.log(this.maxIndex, `+${this.pageSize} >=`, target)
                onFuture()
                // this.initFromIndex = target
                return true
            }
            if (this.minIndex - this.pageSize <= target && target <= this.maxIndex) {
                console.log(this.minIndex, `-${this.pageSize} <=`, target)
                onPast()
                // this.initFromIndex = target
                return true
            }
        }


        return false
    }


    offset() {
        return this.minIndex ?? 0
    }
}
