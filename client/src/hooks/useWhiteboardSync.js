import { useEffect } from "react";
// import { useSocket } from "../context/socketContext";
import { connectSocket, disconnectSocket } from "../lib/socket";

const useWhiteboardSync = (editor, socketRef, boardId) => {

    useEffect(() => {

        // detect changes and emit the whiteboard-update event
        if (!editor) return

        const socket = connectSocket()

        console.log("hook connected to editor....")

        const cleanup = editor.store.listen((update) => {
            const {added, updated, removed} = update.changes
            
            const changes = {
                added:   Object.values(added).filter(r => r.typeName === "shape"),
                updated: Object.values(updated)
                             .filter(([, next]) => next.typeName === "shape")
                             .map(([prev, next]) => next),
                removed: Object.values(removed)
                             .filter(r => r.typeName === "shape")
                             .map(r => r.id),
            };

            const hasChanges = 
            changes.added?.length>0 ||
            changes.updated?.length > 0 ||
            changes.removed?.length > 0

            if (hasChanges){
                socket.emit("whiteboard-update", {changes, boardId})
            }

        }, {scope: "document"})

        //sync whiteboard across the room
        const handleRemoteUpdate = (changes) => {
            editor.store.mergeRemoteChanges(() => {
                const { added, updated, removed } = changes;

                if (added.length > 0) {
                    editor.store.put(added);
                }
                if (updated.length > 0) {
                    editor.store.put(updated);
                }
                if (removed.length > 0) {
                    editor.store.remove(removed);
                }
            })
        }

        socket.on("whiteboard-update", handleRemoteUpdate)

        return () => {
            cleanup()
            socket.off("whiteboard-update", handleRemoteUpdate)
        }
    }, [editor, socketRef, boardId])
}

export default useWhiteboardSync