import { Api, type ResolvedPlayerInfo } from "./gen/api";

type ResolveFn = (player: ResolvedPlayerInfo | null) => void;

class PlayerFetcher {

    private cache = new Map<number, ResolvedPlayerInfo>();
    private pending = new Map<number, ResolveFn[]>();
    private queueTimeout: number | null = null;

    async getPlayerInfo(id: number): Promise<ResolvedPlayerInfo | null> {
        if (this.cache.has(id)) {
            return this.cache.get(id)!;
        }

        if (this.pending.has(id)) {
            return new Promise((resolve) => {
                this.pending.get(id)!.push(resolve);
            });
        }

        return new Promise((resolve) => {
            this.pending.set(id, [resolve]);
            this.scheduleFetch();
        });
    }

    private scheduleFetch() {
        if (this.queueTimeout) return;

        this.queueTimeout = setTimeout(async () => {
            this.queueTimeout = null;

            const idsToFetch = Array.from(this.pending.keys());
            if (idsToFetch.length === 0) return;

            try {
                const [data, err] = await Api.info.resolvePlayer({ ids: idsToFetch });

                if (err || !data) throw new Error(err?.message);


                idsToFetch.forEach((id, index) => {
                    const playerInfo = data[index] || null;
                    if (playerInfo) {
                        this.cache.set(id, playerInfo);
                    }
                    const resolvers = this.pending.get(id);
                    if (resolvers) {
                        resolvers.forEach((res) => res(playerInfo));
                        this.pending.delete(id);
                    }
                });

            } catch (error) {
                console.error(error);
                idsToFetch.forEach((id) => {
                    const resolvers = this.pending.get(id);
                    if (resolvers) {
                        resolvers.forEach((res) => res(null));
                        this.pending.delete(id);
                    }
                });
            }
        }, 16);
    }
}

export const playerFetcher = new PlayerFetcher();
