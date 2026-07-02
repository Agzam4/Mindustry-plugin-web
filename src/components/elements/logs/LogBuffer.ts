import type { LogEntity } from '@/api/gen/api'

interface Chunk {
    id: number // maximum id
    size: number
    entries: LogEntity[]
    lastUsed: number
}

export type FetchFn = (fromId: number, limit: number) => Promise<LogEntity[]>

const PAGE_SIZE = 10
const MAX_CHUNKS = 10

export class LogBuffer {

    private chunks: Chunk[] = []
    private seq = 0
    private fetch: FetchFn

    constructor(fetch: FetchFn) {
        this.fetch = fetch
    }

    private chunkId(id: number) {
        return Math.floor(id / PAGE_SIZE)
    }

    /** Update last used of chunk and init it of not exsist */
    private async touchChunk(chunk: number) {
        // TODO: cache + remove lru chunks

        // if (this.chunks[chunk] == null) {
        const starId = (chunk + 1) * PAGE_SIZE
        this.chunks[chunk] = {
            id: starId,
            size: PAGE_SIZE,
            lastUsed: ++this.seq,
            entries: (await this.fetch(starId, PAGE_SIZE)).filter(c => c !== null && c !== undefined)
        }
        this.chunks[chunk].entries.sort((e1, e2) => e2.globalId - e1.globalId)

        console.log(`Fetch chunk [${this.chunks[chunk].id - this.chunks[chunk].size + 1},${this.chunks[chunk].id}]`, this.chunks[chunk].entries.map(e => e.globalId).reverse())
        console.log(this.chunks[chunk])
        return this.chunks[chunk]
        // }
        // this.chunks[chunk].lastUsed = ++this.seq
        // console.log(`Update chunk [${this.chunks[chunk].id},${this.chunks[chunk].id + this.chunks[chunk].size - 1}]`)
        // return this.chunks[chunk]
    }

    /** Update last used of chunks in range and init they of not exsist */
    private async touch(maxId: number, minId: number) {
        const endChunk = this.chunkId(maxId)
        for (let c = this.chunkId(minId); c < endChunk; c++) {
            this.touchChunk(c)
        }
    }

    /** Collect entities from given id to 0 */
    public async get(id: number, limit: number) {
        console.log(`GET [${id - limit},${id}]`)
        const entries: LogEntity[] = []
        let cid = id
        while (true) {
            const chunkId = this.chunkId(cid)
            console.log(chunkId * PAGE_SIZE)
            const chunk = await this.touchChunk(chunkId)
            cid -= chunk.size
            for (let e = 0; e < chunk.entries.length; e++) {
                if (limit <= 0) {
                    console.log(">", entries)

                    return entries
                }
                if (chunk.entries[e].globalId > id) continue
                entries.push(chunk.entries[e])
                limit--;
            }
            if (cid <= 0) {
                console.log(">", entries)
                return entries
            }
        }
    }

}
