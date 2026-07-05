import { create } from 'zustand';
import type { LogFilters, LogTagFilters, TagTypeMap } from './types';

export interface SmartFilterDefinition {
    label: string
    placeholder?: string
    tags: number[]
    createPredicate: (tag: number, search: any) => (event: any) => boolean
}

export type SplashDefinition = {
    [K in keyof TagTypeMap]?: (e: TagTypeMap[K]) => any | any[];
};

interface EqualityOptions {
    label: string
    placeholder?: string
    icon?: string
}

export function equality(options: EqualityOptions, definitions: SplashDefinition): SmartFilterDefinition {
    return {
        label: options.label,
        placeholder: options.placeholder,
        tags: Object.keys(definitions).map(k => parseInt(k)),
        createPredicate: (tag, search) => {
            const result = definitions[tag as keyof TagTypeMap]!
            return event => {
                const data = result(event)
                if (Array.isArray(data)) return data.includes(search)
                return data == search
            }
        }
    };
}

export const splash = {
    player: equality(
        {
            label: 'Player ID',
            placeholder: '1'
        },
        {
            1: (e) => e.player,
            2: (e) => e.player,
            3: (e) => e.player,
            4: (e) => [e.actor, e.target],
            5: (e) => [e.actor, e.target],
            6: (e) => e.player,
            7: (e) => e.player,
        }
    ),

    map: equality(
        {
            label: 'Map',
            placeholder: 'Archipelago'
        },
        {
            8: e => e.map,
            9: e => e.map,
        }
    )
} satisfies Record<string, SmartFilterDefinition>;
export type SplashFilterKey = keyof typeof splash;

interface LogFilterState {
    filters: LogFilters;

    toggleTag: (tag: number) => void;

    applySplashFilter: (key: SplashFilterKey, value: any | null, forceTags?: boolean) => void;
    clearAll: () => void;
}

export const useLogFilterStore = create<LogFilterState>((set) => ({
    filters: {
        tags: [],
        tagFilters: new Map(),
        applyedTagFilters: {}
    },

    toggleTag: (tag) => set((state) => ({
        filters: {
            ...state.filters,
            tags: state.filters.tags.includes(tag)
                ? state.filters.tags.filter(t => t !== tag)
                : [...state.filters.tags, tag],
        }
    })),

    applySplashFilter: (type: SplashFilterKey, search, forceTags = false) => set((state) => {
        const newTagFilters: LogTagFilters = new Map(state.filters.tagFilters);
        const applyed = { ...state.filters.applyedTagFilters }
        const key = `splash-${type}`;
        let tags = forceTags ? splash[type].tags : state.filters.tags

        if (search === null) { // null -> remove filters
            for (const tag of [...newTagFilters.keys()]) {
                const predicates = newTagFilters.get(tag);
                if (!predicates) continue;
                predicates.delete(key);
                if (predicates.size === 0) newTagFilters.delete(tag)
            }
            delete applyed[type]
            return { filters: { ...state.filters, tagFilters: newTagFilters, applyedTagFilters: applyed, tags } }
        }

        // Add new filters
        console.log(`Apply filter "${type}":`, search)
        applyed[type] = search
        splash[type].tags.forEach(tag => {
            let predicates = new Map(newTagFilters.get(tag))
            predicates.set(key, splash[type].createPredicate(tag, search))
            newTagFilters.set(tag, predicates)
        })
        console.log(newTagFilters)
        return {
            filters: { ...state.filters, tagFilters: newTagFilters, applyedTagFilters: applyed, tags },
        };
    }),

    clearAll: () => set({
        filters: { tags: [], tagFilters: new Map(), applyedTagFilters: {} },
    })
}));
