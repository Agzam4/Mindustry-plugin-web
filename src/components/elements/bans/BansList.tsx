import { Api } from "@/api/gen/api"
import { ApiHooks } from "@/api/gen/api-hooks"
import HttpError from "@/components/ui/text/HttpError"
import clsx from "clsx"
import { useState, useCallback, useEffect } from "react"
import { useLocation } from "wouter"

import style from './BansList.module.scss'

const parseCidrs = (text: string): string[] => {
    return [...new Set(text.split(/[\s,;]+/).map(p => p.trim()).filter(Boolean))]
}

export default function BansList({ selectedGroup: routeGroup }: { selectedGroup?: string }) {
    const [groups, groupsError, , setGroups] = ApiHooks.bans.useGroups()
    const [, setLocation] = useLocation()
    const [selectedGroup, setSelectedGroup] = useState<string | null>(routeGroup ?? null)
    const [cidrs, setCidrs] = useState<string[]>([])
    const [loadingCidrs, setLoadingCidrs] = useState(false)
    const [cidrsError, setCidrsError] = useState<{ code: number; message: string } | null>(null)

    const [addInput, setAddInput] = useState("")
    const [removeInput, setRemoveInput] = useState("")
    const [addResult, setAddResult] = useState<{ ok: boolean; text: string } | null>(null)
    const [removeResult, setRemoveResult] = useState<{ ok: boolean; text: string } | null>(null)
    const [testInput, setTestInput] = useState("")
    const [testResult, setTestResult] = useState<boolean | null>(null)
    const [operating, setOperating] = useState(false)

    const loadCidrs = useCallback(async (group: string) => {
        setLoadingCidrs(true)
        setCidrsError(null)
        setTestResult(null)
        const [data, err] = await Api.bans.get({ group, cidr: "" })
        setLoadingCidrs(false)
        if (err) {
            setCidrsError(err)
            setCidrs([])
        } else {
            setCidrs(data ? data.split("\n").filter(l => l.trim()) : [])
        }
    }, [])

    useEffect(() => {
        setSelectedGroup(routeGroup ?? null)
    }, [routeGroup])

    useEffect(() => {
        if (selectedGroup) {
            loadCidrs(selectedGroup)
        }
    }, [selectedGroup, loadCidrs])

    const handleSelectGroup = useCallback((name: string) => {
        setLocation(`/bans/${name}`, { replace: true })
        setSelectedGroup(name)
        setAddInput("")
        setRemoveInput("")
        setAddResult(null)
        setRemoveResult(null)
        setTestInput("")
        setTestResult(null)
    }, [setLocation])

    const updateGroupSize = useCallback((size: number | null) => {
        setGroups(prev => prev && size !== null ? prev.map(g => g.name === selectedGroup ? { ...g, size } : g) : prev)
    }, [selectedGroup, setGroups])

    const handleBulkAdd = useCallback(async () => {
        if (!selectedGroup) return
        const targets = parseCidrs(addInput)
        if (targets.length === 0) return
        setOperating(true)
        setAddResult(null)

        const toAdd = targets.filter(c => !cidrs.includes(c))
        if (toAdd.length === 0) {
            setAddResult({ ok: true, text: "All entered CIDRs are already in the list" })
            setOperating(false)
            return
        }

        let added = 0
        let failed = 0
        const failedCidrs: string[] = []
        let lastSize: number | null = null
        for (const c of toAdd) {
            const [size, err] = await Api.bans.add({ group: selectedGroup, cidr: c })
            if (err) {
                failed++
                failedCidrs.push(c)
                console.warn(err)
            } else {
                added++
                lastSize = size
            }
        }

        updateGroupSize(lastSize)
        loadCidrs(selectedGroup)
        setAddInput(failedCidrs.join("\n"))
        setAddResult({
            ok: failed === 0,
            text: failed === 0 ? `Added: ${added}` : `Added: ${added}, Failed: ${failed}`,
        })
        setOperating(false)
    }, [selectedGroup, addInput, cidrs, loadCidrs, updateGroupSize])

    const handleBulkRemove = useCallback(async () => {
        if (!selectedGroup) return
        const targets = parseCidrs(removeInput)
        if (targets.length === 0) return
        if (!confirm(`Remove ${targets.length} CIDR(s)?`)) return
        setOperating(true)
        setRemoveResult(null)

        const toRemove = targets.filter(c => cidrs.includes(c))
        if (toRemove.length === 0) {
            setRemoveResult({ ok: true, text: "None of the entered CIDRs are in the list" })
            setOperating(false)
            return
        }

        let removed = 0
        let failed = 0
        const failedCidrs: string[] = []
        let lastSize: number | null = null
        for (const c of toRemove) {
            const [size, err] = await Api.bans.remove({ group: selectedGroup, cidr: c })
            if (err) {
                failed++
                failedCidrs.push(c)
                console.warn(err)
            } else {
                removed++
                lastSize = size
            }
        }

        updateGroupSize(lastSize)
        loadCidrs(selectedGroup)
        setRemoveInput(failedCidrs.join("\n"))
        setRemoveResult({
            ok: failed === 0,
            text: failed === 0 ? `Removed: ${removed}` : `Removed: ${removed}, Failed: ${failed}`,
        })
        setOperating(false)
    }, [selectedGroup, removeInput, cidrs, loadCidrs, updateGroupSize])

    const handleRemove = useCallback(async (cidr: string) => {
        if (!selectedGroup) return
        setOperating(true)
        const [newSize, err] = await Api.bans.remove({ group: selectedGroup, cidr })
        setOperating(false)
        if (err) {
            alert(err.message)
            return
        }
        updateGroupSize(newSize)
        loadCidrs(selectedGroup)
    }, [selectedGroup, loadCidrs, updateGroupSize])

    const handleTest = useCallback(async () => {
        if (!selectedGroup || !testInput.trim()) return
        setOperating(true)
        const [result, err] = await Api.bans.test({ group: selectedGroup, ip: testInput.trim() })
        setOperating(false)
        if (err) {
            alert(err.message)
            return
        }
        setTestResult(result)
    }, [selectedGroup, testInput])

    if (groupsError) return <HttpError error={groupsError} />

    return <div className={style.container}>
        <div className={style.sidebar}>
            <div className={style.sidebarTitle}>Ban groups</div>
            {groups ? groups.map(g => (
                <div
                    key={g.name}
                    className={clsx(style.groupItem, selectedGroup === g.name && style.groupItemActive)}
                    onClick={() => handleSelectGroup(g.name)}
                >
                    <span className={style.groupName}>{g.name}</span>
                    <span className={style.groupBadge}>{g.size}</span>
                </div>
            )) : <div className={style.loading}>Loading...</div>}
        </div>
        <div className={style.main}>
            {selectedGroup ? <>
                <div className={style.mainHeader}>
                    <span className={style.mainTitle}>{selectedGroup}</span>
                </div>
                <div className={style.actions}>
                    <div className={style.actionBlock}>
                        <textarea
                            className={style.inputArea}
                            placeholder={"Multiple CIDRs, one per line (or comma/space separated).\n192.168.0.0/24\n10.0.0.0/8"}
                            value={addInput}
                            onChange={e => setAddInput(e.target.value)}
                            onKeyDown={e => (e.ctrlKey || e.metaKey) && e.key === "Enter" && handleBulkAdd()}
                            disabled={operating}
                        />
                        <div className={style.actionRow}>
                            <button className={style.btn} onClick={handleBulkAdd} disabled={operating || !addInput.trim()}>
                                Add
                            </button>
                            {addResult && <span className={clsx(style.resultMsg, addResult.ok ? style.resultOk : style.resultErr)}>{addResult.text}</span>}
                        </div>
                    </div>
                    <div className={style.actionBlock}>
                        <textarea
                            className={style.inputArea}
                            placeholder={"Multiple CIDRs to remove, one per line.\n192.168.0.0/24"}
                            value={removeInput}
                            onChange={e => setRemoveInput(e.target.value)}
                            onKeyDown={e => (e.ctrlKey || e.metaKey) && e.key === "Enter" && handleBulkRemove()}
                            disabled={operating}
                        />
                        <div className={style.actionRow}>
                            <button className={clsx(style.btn, style.btnDanger)} onClick={handleBulkRemove} disabled={operating || !removeInput.trim()}>
                                Remove
                            </button>
                            {removeResult && <span className={clsx(style.resultMsg, removeResult.ok ? style.resultOk : style.resultErr)}>{removeResult.text}</span>}
                        </div>
                    </div>
                    <div className={style.actionBlock}>
                        <div className={style.inputGroup}>
                            <input
                                className={style.input}
                                placeholder="IP to test"
                                value={testInput}
                                onChange={e => setTestInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleTest()}
                                disabled={operating}
                            />
                            <button className={style.btn} onClick={handleTest} disabled={operating || !testInput.trim()}>
                                Test
                            </button>
                            {testResult !== null && (
                                <span className={clsx(style.testResult, testResult ? style.testMatch : style.testNoMatch)}>
                                    {testResult ? "Match" : "No match"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className={style.cidrList}>
                    {cidrsError && <HttpError error={cidrsError} />}
                    {loadingCidrs && <div className={style.loading}>Loading CIDRs...</div>}
                    {!loadingCidrs && cidrs.length === 0 && (
                        <div className={style.empty}>No CIDRs in this group</div>
                    )}
                    {cidrs.map(c => (
                        <div key={c} className={style.cidrItem}>
                            <span className={style.cidrText}>{c}</span>
                            <button
                                className={style.cidrRemove}
                                onClick={() => confirm(`Remove ${c}?`) && handleRemove(c)}
                                disabled={operating}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            </> : <div className={style.empty}>Select a group to view its CIDRs</div>}
        </div>
    </div>
}