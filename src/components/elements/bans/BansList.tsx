import { Api } from "@/api/gen/api"
import { ApiHooks } from "@/api/gen/api-hooks"
import HttpError from "@/components/ui/text/HttpError"
import clsx from "clsx"
import { useState, useCallback, useEffect } from "react"
import { useLocation } from "wouter"

import style from './BansList.module.scss'

export default function BansList({ selectedGroup: routeGroup }: { selectedGroup?: string }) {
    const [groups, groupsError, , setGroups] = ApiHooks.bans.useGroups()
    const [, setLocation] = useLocation()
    const [selectedGroup, setSelectedGroup] = useState<string | null>(routeGroup ?? null)
    const [cidrs, setCidrs] = useState<string[]>([])
    const [loadingCidrs, setLoadingCidrs] = useState(false)
    const [cidrsError, setCidrsError] = useState<{ code: number; message: string } | null>(null)

    const [addInput, setAddInput] = useState("")
    const [removeInput, setRemoveInput] = useState("")
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
        setTestInput("")
        setTestResult(null)
    }, [setLocation])

    const handleAdd = useCallback(async () => {
        if (!selectedGroup || !addInput.trim()) return
        setOperating(true)
        const [newSize, err] = await Api.bans.add({ group: selectedGroup, cidr: addInput.trim() })
        setOperating(false)
        if (err) {
            alert(err.message)
            return
        }
        setAddInput("")
        if (newSize !== null) {
            setGroups(prev => prev ? prev.map(g => g.name === selectedGroup ? { ...g, size: newSize } : g) : prev)
        }
        loadCidrs(selectedGroup)
    }, [selectedGroup, addInput, loadCidrs, setGroups])

    const handleRemove = useCallback(async (cidr: string) => {
        if (!selectedGroup) return
        setOperating(true)
        const [newSize, err] = await Api.bans.remove({ group: selectedGroup, cidr })
        setOperating(false)
        if (err) {
            alert(err.message)
            return
        }
        if (cidr === removeInput.trim()) {
            setRemoveInput("")
        }
        if (newSize !== null) {
            setGroups(prev => prev ? prev.map(g => g.name === selectedGroup ? { ...g, size: newSize } : g) : prev)
        }
        loadCidrs(selectedGroup)
    }, [selectedGroup, loadCidrs, setGroups, removeInput])

    const handleRemoveByText = useCallback(async () => {
        if (!selectedGroup || !removeInput.trim()) return
        if (!confirm(`Remove ${removeInput.trim()}?`)) return
        await handleRemove(removeInput.trim())
    }, [selectedGroup, removeInput, handleRemove])

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
                    <div className={style.inputGroup}>
                        <input
                            className={style.input}
                            placeholder="CIDR (e.g. 192.168.0.0/24)"
                            value={addInput}
                            onChange={e => setAddInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAdd()}
                            disabled={operating}
                        />
                        <button className={style.btn} onClick={handleAdd} disabled={operating || !addInput.trim()}>
                            Add
                        </button>
                    </div>
                    <div className={style.inputGroup}>
                        <input
                            className={style.input}
                            placeholder="CIDR to remove"
                            value={removeInput}
                            onChange={e => setRemoveInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleRemoveByText()}
                            disabled={operating}
                        />
                        <button className={clsx(style.btn, style.btnDanger)} onClick={handleRemoveByText} disabled={operating || !removeInput.trim()}>
                            Remove
                        </button>
                    </div>
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
