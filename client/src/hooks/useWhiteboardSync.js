import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../lib/socket";
import saveBoard from "../utils/saveBoard";
import { supabase } from "../lib/supabaseClient";
import getName from "../utils/getName";
import getRandomInt from "../utils/getRandomInt"
import { useAuth } from "../context/AuthContext";

const useWhiteboardSync = (editor, socketRef, boardId, setSaveStatus, userRole, setUpdateCards) => {

    const {user} = useAuth()

    editor?.updateInstanceState({
        isReadonly: userRole==='viewer'
    })

    useEffect(() => {

        if (!editor) return
        const loadBoardData = async () => {
            const { data, error } = await supabase
                .from("whiteboards")
                .select("canvas_data")
                .eq("id", boardId)
                .single()

            const snapshot = JSON.parse(data.canvas_data)
            editor.loadSnapshot(snapshot)
        }

        loadBoardData()
    }, [editor])

    useEffect(() => {

        // detect changes and emit the whiteboard-update event
        if (!editor) return

        const socket = connectSocket()

        console.log("hook connected to editor....")

        const cleanup = editor.store.listen((update) => {
            console.log(update)
            // Code to print board 1 second after user is still
            saveBoard(editor, boardId, setSaveStatus)

            const { added, updated, removed } = update.changes

            const changes = {
                added: Object.values(added).filter(r => r.typeName === "shape"),
                updated: Object.values(updated)
                    .filter(([, next]) => next.typeName === "shape")
                    .map(([prev, next]) => next),
                removed: Object.values(removed)
                    .filter(r => r.typeName === "shape")
                    .map(r => r.id),
            };

            const hasChanges =
                changes.added?.length > 0 ||
                changes.updated?.length > 0 ||
                changes.removed?.length > 0

            // Only emit if changes are local (not from remote merges)
            if (hasChanges && update.source === 'user') {
                socket.emit("whiteboard-update", { changes, boardId, userId: user.id })
            }

        }, { scope: "document" })

        //sync whiteboard across the room
        const handleRemoteUpdate = ({changes, userColor, userEmail}) => {

            // Function to handle update cards
            // const {added} = changes
            // if (added.length>0){
            //     console.log(changes.added)
            //     const cardId = getRandomInt();

            //     // get viewport coordinates from actual coordinates
            //     const pos = editor.pageToViewport({
            //         x: added[0].x,
            //         y: added[0].y
            //     })

            //     setUpdateCards(prev => [...prev, {
            //         id: cardId,
            //         x: Math.ceil(pos.x),
            //         y: Math.ceil(pos.y)
            //     }])

                // setTimeout(() => {
                //     setUpdateCards(prev => prev.filter(item => item.id!=cardId))
                // }, 2000);
            // }

            // Function to handle update cards
            const {added} = changes
            if (added.length>0){
                const cardId = crypto.randomUUID()

                // get viewport coordinates from actual coordinates
                const pos = editor.pageToViewport({
                    x: added[0].x,
                    y: added[0].y
                })

                setUpdateCards(prev => [...prev, {
                    id: cardId,
                    userName: getName(userEmail),
                    userColor: userColor,
                    x: Math.ceil(pos.x),
                    y: Math.ceil(pos.y)
                }])

                setTimeout(() => {
                    setUpdateCards(prev => prev.filter(card => card.id!==cardId))
                }, 2000)
            }

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