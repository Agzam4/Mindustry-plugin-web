import { Api, type MapSlotInfo } from "@/api/gen/api";
import Dnd from "@/components/ui/Dnd";
import style from './MapSlot.module.scss'
import Text from "@/components/ui/Text";
import clsx from "clsx";
import { useState } from "react";
import type { FileWithPath } from "react-dropzone";
import AuthorsSelect from "./AuthorsSelect";
import ContextMenuWrapper from "@/components/ui/context/ContextMenuWrapper";
import { ApiHooks } from "@/api/gen/api-hooks";


export default function MapSlot({ slot, onChange }: { slot: MapSlotInfo, onChange: (slot: MapSlotInfo) => void }) {

    const [events] = ApiHooks.events.useList()

    const [file, setFile] = useState<FileWithPath | null>(null)
    const approve = slot.editable && slot.canApprove && slot.status !== 'approved'
    const reject = slot.editable && slot.status !== 'rejected'


    const [sending, setSending] = useState(false)

    const handleUpload = async () => {
        if (!file) return;

        try {
            setSending(true);

            const response = await fetch(`/api/maps/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                    'Agzam4-Map-Slot': String(slot.id),
                },
                body: file,
            })

            const message = await response.text()
            try {
                const json = JSON.parse(message) as (MapSlotInfo | null)
                if (!json) throw new Error("Error");
                onChange(json)
                alert('OK!');
                setFile(null);
            } catch (e) {
                throw new Error(message)
            }
        } catch (error) {
            console.error(error);
            alert(error);
        } finally {
            setSending(false);
        }
    };

    const searchAuthorsApi = async (inputValue: string) => {
        const [response, error] = await Api.info.search({ query: inputValue, limit: 32 });
        if (error || !response) return [];
        return response.map(r => r.id);
    };

    const handleAuthorsChange = (newAuthors: number[]) => {
        (async () => {
            const [response, error] = await Api.maps.setMapCreators({ id: slot.id, authors: newAuthors })
            if (response) onChange(response);
            if (error) alert(error.message)
        })()
    };

    const colors: Record<string, string> = {
        "approved": "[lime]",
        "rejected": "[red]"
    }

    return <div className={style.container}>
        {
            slot.editable ?
                <div className={clsx(style.editable, style.name)}>
                    <ContextMenuWrapper items={[{
                        key: "rename",
                        label: "Rename",
                        action: async () => {
                            const name = prompt("New name")
                            if (!name) return
                            const [response, error] = await Api.maps.renameSlot({ id: slot.id, name })
                            if (response) onChange(response)
                            if (error) alert(error.message)
                        }
                    }]}><button className="no-button"><Text>{slot.name}</Text></button></ContextMenuWrapper></div> :
                <div className={style.name}><span><Text>{slot.name}</Text></span></div>
        }
        {(slot.status === 'build-in' || slot.status === 'custom') && <div><Text>[white]Type:[] {slot.status}</Text></div>}
        <div><Text>[white]Version:[] {slot.version}</Text></div>
        <div>
            <Text>
                [white]Status:
                {
                    slot.canManage ? <button onClick={() => {
                        (async () => {
                            const [response, error] = await Api.maps.setEnabledSlot({ id: slot.id, enabled: !slot.enabled })
                            if (response) onChange(response)
                            if (error) alert(error.message)
                        })()
                    }} className={clsx("no-button")}><Text>{slot.enabled ? "[green][enabled]" : "[red][disabled]"}</Text></button>
                        : <Text>{slot.enabled ? "[green] enabled" : "[red] disabled"}</Text>
                }
            </Text>
        </div>

        {
            (slot.status !== 'build-in' && slot.status !== 'custom') && <>
                <div className={style.name}><span>Upload</span></div>
                <div>
                    <Text>
                        [white]Review:{colors[slot.status] ?? "[]"} {slot.status}
                        {approve && <button onClick={() => {
                            (async () => {
                                const [response, error] = await Api.maps.approve({ id: slot.id })
                                if (response) onChange(response)
                                if (error) alert(error.message)
                            })()
                        }} className={clsx("no-button", style.approve)}>Approve</button>}
                        {reject && <button onClick={() => {
                            (async () => {
                                const [response, error] = await Api.maps.reject({ id: slot.id })
                                if (response) onChange(response)
                                if (error) alert(error.message)
                            })()
                        }} className={clsx("no-button", style.reject)}>Reject</button>}
                    </Text>
                </div>
                <div className={style.upload}><Dnd onFilesChange={fs => setFile(fs[0])} options={{ maxFiles: 1 }} /></div>
                <button disabled={file == null || sending} className={clsx("no-button", style.send)} onClick={handleUpload}>{sending ? "Sending..." : "Send"}</button>
                <button className={clsx("no-button", style.send)} onClick={() => {
                    (async () => {
                        const response = await fetch('/api/maps/download', {
                            method: "POST",
                            body: JSON.stringify({
                                id: slot.id
                            })
                        });
                        if (response.ok) {
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${slot.name}.msav`
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }
                    })()
                }}>Download</button>
            </>
        }

        {
            slot.editable && (
                <>
                    <div className={style.name}><span>Authors</span></div>
                    <AuthorsSelect
                        authors={slot.authors || []}
                        onChange={handleAuthorsChange}
                        apiSearchFn={searchAuthorsApi}
                    />
                </>
            )
        }
        <div className={style.name}><span>Override events</span></div>
        {
            events &&
            (
                slot.canManage ?
                    <div className={style.events}>
                        {slot.events.map((e, i) =>
                            <button onClick={async () => {
                                const [response, error] = await Api.maps.setEvent({ id: slot.id, event: events[i].key, status: [0, 1, -1][e + 1] })
                                if (response) onChange(response)
                                if (error) alert(error.message)
                            }} className={clsx("no-button", style.eventRow)}>
                                <div className={style.eventName}><Text>{events[i].name}:</Text></div>
                                <div><Text> {["[red]disabled", "default", "[green]enabled"][e + 1]}</Text></div>
                            </button>)}
                    </div>
                    :
                    <div className={style.events}>
                        {slot.events.map((e, i) => <div className={style.eventRow}>
                            <div className={style.eventName}><Text>{events[i].name}:</Text></div>
                            <div><Text> {["[red]disabled", "default", "[green]enabled"][e + 1]}</Text></div>
                        </div>)}
                    </div>

            )
        }
    </div >
}
