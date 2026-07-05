import { Api, type LogEntity } from '@/api/gen/api'
import { logsFilterKey, type LogFilters } from './types'

interface Chunk {
    id: number // maximum id
    size: number
    entries: LogEntity[]
    lastUsed: number
}

export type ClientFilter = (e: LogEntity) => boolean
export type FetchFn = (fromId: number, limit: number) => Promise<LogEntity[]>

const PAGE_SIZE = 100
const MAX_CHUNKS = 10
const debug = !true

export class LogBuffer {

    private chunks: Chunk[] = []
    private seq = 0
    private filter: ClientFilter = () => true
    private filters: LogFilters = { tags: [], tagFilters: new Map(), applyedTagFilters: {} }


    constructor(filters?: LogFilters) {
        console.log("Log buffer with", filters && logsFilterKey(filters))
        if (filters) {
            this.filters = filters

            const collected: ClientFilter[][] = []
            for (const [tag, map] of filters.tagFilters.entries()) {
                collected[tag] = []
                map.forEach(p => collected[tag].push(p))
            }
            console.log(collected, filters)

            this.filter = e => {
                if (filters.tags.length > 0 && !filters.tags.includes(e.tag)) return false
                const event = JSON.parse(e.message)
                if (e.tag in collected) {
                    for (const filter of collected[e.tag]) {
                        if (!filter(event)) return false
                    }
                }
                return true
            }
            // if (filters.tags.length > 0) this.filter = e => {
            //     if (!filters.tags.includes(e.tag)) return false
            //
            // }
            // console.log("Filters: ", filters.tags)
        }
    }

    private async fetch(fromId: number, limit: number) {
        const [data] = await Api.logs.search({
            id: fromId,
            limit,
            t1: 0, t2: 999999999999999,
            tags: this.filters.tags,
            query: "",
        })
        return data ?? []
    }

    private chunkId(id: number) {
        return Math.floor(id / PAGE_SIZE)
    }

    /** Update last used of chunk and init it of not exsist */
    private async touchChunk(chunk: number) {
        // TODO: remove lru chunks

        if (this.chunks[chunk] == null) {
            const starId = (chunk + 1) * PAGE_SIZE - 1
            this.chunks[chunk] = {
                id: starId,
                size: PAGE_SIZE,
                lastUsed: ++this.seq,
                entries: (await this.fetch(starId, PAGE_SIZE)).filter(c => c !== null && c !== undefined)
            }
            const c = this.chunks[chunk]
            c.entries.sort((e1, e2) => e1.globalId - e2.globalId)

            if (debug) {
                const ids = c.entries.map(e => e.globalId)
                const min = c.id - c.size + 1
                const max = c.id
                console.log(`Fetch chunk [${min},${max}]: ${ids[0]},${ids[ids.length - 1]}`, c.entries.map(e => e.globalId).reverse())
                if (ids[0] < min) console.error("Recived entity id too small")
                if (ids[ids.length - 1] > max) console.error("Recived entity id too small")
            }

            return this.chunks[chunk]
        }
        this.chunks[chunk].lastUsed = ++this.seq
        // console.log(`Update chunk [${this.chunks[chunk].id},${this.chunks[chunk].id + this.chunks[chunk].size - 1}]`)
        return this.chunks[chunk]
    }

    /** Update last used of chunks in range and init they of not exsist */
    private async touch(maxId: number, minId: number) {
        const endChunk = this.chunkId(maxId)
        for (let c = this.chunkId(minId); c < endChunk; c++) {
            this.touchChunk(c)
        }
    }

    /** Collect entities from given id to 0, returns [min -> max] */
    public async past(id: number, limit: number) {
        if (debug) console.log(`GET <= ${id} (${limit})`)
        const entries: LogEntity[] = []
        let cid = id // starting from latest
        let index = limit - 1 // cursor at end
        let allowedNonfull = 0
        while (true) {
            const chunkId = this.chunkId(cid)
            const chunk = await this.touchChunk(chunkId)
            cid -= chunk.size

            if (chunk.entries.length !== chunk.size) {
                if (++allowedNonfull > 1) {
                    if (debug) console.error("To many non full responces")
                }
            }
            for (let e = chunk.entries.length - 1; e >= 0; e--) {
                if (limit <= 0) {
                    if (debug) console.log(">", entries)
                    return entries
                }
                if (chunk.entries[e].globalId > id) continue // cut over
                if (!this.filter(chunk.entries[e])) continue
                entries[index--] = chunk.entries[e]
                limit--;
            }
            if (cid <= 0) {
                if (debug) console.log(">", entries)
                return index === -1 ? entries : entries.slice(index + 1)
            }
        }
    }

    /** Collect entities from given id to latest, returns [min -> max] */
    public async future(id: number, limit: number) {
        if (debug) console.log(`GET >= ${id} (${limit})`)
        const entries: LogEntity[] = []
        let cid = 0 // starting from first
        let index = 0 // cursor at start
        let allowedNonfull = 0
        while (true) {
            const chunkId = this.chunkId(cid)
            const chunk = await this.touchChunk(chunkId)
            cid += chunk.size

            if (chunk.entries.length !== chunk.size) {
                if (++allowedNonfull > 1) {
                    if (debug) console.error("To many non full responces")
                }
            }
            for (let e = 0; e < chunk.entries.length; e++) {
                if (limit <= 0) {
                    return entries
                }
                if (chunk.entries[e].globalId < id) continue
                if (!this.filter(chunk.entries[e])) continue
                entries[index++] = chunk.entries[e]
                limit--;
            }
            if (chunk.entries.length == 0) {
                return entries
            }
        }
    }

}
