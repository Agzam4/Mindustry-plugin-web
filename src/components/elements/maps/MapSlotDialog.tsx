import { BaseDialog } from "@/components/modals/BaseDialog";
import NiceModal, { useModal } from "@ebay/nice-modal-react";

export interface MapSlotDialogResult {

}

// export const MapSlotDialog = NiceModal.create(({ player }: { player: number }) => {
//     const modal = useModal();
//
//     const handleSelect = (playerData: MapSlotDialogResult) => {
//         modal.resolve(playerData);
//         modal.hide();
//     };
//
//     return (
//         <BaseDialog modal={modal} title={`${info?.name ?? "loading"} profile`} description='trace about player'>
//             {info && (
//                 <>
//                     <div className={style.title}>
//                         <Text>[accent]{info?.name}</Text>
//                     </div>
//
//                     <button onClick={() => handleSelect({ id: player, name: info.name })}>
//                     </button>
//                 </>
//             )}
//         </BaseDialog>
//     );
// });
