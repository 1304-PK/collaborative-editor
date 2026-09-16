import { useEffect, useState } from "react";
import saveBoard from "../utils/saveBoard";
import { supabase } from "../lib/supabaseClient";
import getName from "../utils/getName";
import getRandomInt from "../utils/getRandomInt"
import { useAuth } from "../context/AuthContext";

const useWhiteboardSync = (editor, socketRef, boardId, setSaveStatus, userRole, setUpdateCards) => {

    const { user } = useAuth()



    useEffect(() => {

        if (!editor) return

        editor?.updateInstanceState({
            isReadonly: userRole === 'viewer'
        })

        const loadBoardData = async () => {
            const { data, error } = await supabase
                .from("whiteboards")
                .select("canvas_data")
                .eq("id", boardId)
                .single()

            if (Object.keys(data.canvas_data).length === 0) return

            const snapshot = typeof data.canvas_data === 'string'
                ? JSON.parse(data.canvas_data)
                : data.canvas_data;
            editor.loadSnapshot(snapshot)
        }

        loadBoardData()
    }, [editor])

    useEffect(() => {

        // detect changes and emit the whiteboard-update event
        if (!editor) return
        if (!socketRef?.current) return

        const socket = socketRef.current

        console.log("hook connected to editor....")

        let timer = null, lastEmit = 0;
        let buffer = { added: [], updated: {}, removed: [] };

        const sendUpdates = () => {
            const hasPayload =
                buffer.added.length > 0 ||
                Object.keys(buffer.updated).length > 0 ||
                buffer.removed.length > 0;

            if (hasPayload) {
                socket.emit(
                    "whiteboard-update",
                    {
                        changes: {
                            added: buffer.added,
                            updated: Object.values(buffer.updated),
                            removed: buffer.removed
                        },
                        boardId,
                        userId: user.id
                    },
                    (response) => {
                        if (!response?.ok) {
                            console.log(response?.error);
                        }
                    }
                );
            }

            buffer = { added: [], updated: {}, removed: [] };
            lastEmit = Date.now();
            timer = null;
        };

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
                buffer.added.push(...changes.added);
                changes.updated.forEach(s => buffer.updated[s.id] = s);
                buffer.removed.push(...changes.removed);

                if (Date.now() - lastEmit >= 200) {
                    clearTimeout(timer);
                    sendUpdates();
                } else if (!timer) {
                    timer = setTimeout(sendUpdates, 200);
                }
            }

        }, { scope: "document" })

        //sync whiteboard across the room
        let cardTimers = {};

        const handleRemoteUpdate = ({ changes, userColor, userEmail }) => {
            const { added, updated, removed } = changes;
            const target = added?.[0] || updated?.[0] || editor.getShape(removed?.[0]);
            const targetCoords = target ? { x: target.x, y: target.y } : null;

            // 1. Merge canvas changes immediately for smooth live movement
            editor.store.mergeRemoteChanges(() => {
                if (added?.length > 0) {
                    editor.store.put(added);
                }
                if (updated?.length > 0) {
                    editor.store.put(updated);
                }
                if (removed?.length > 0) {
                    editor.store.remove(removed);
                }
            });

            // 2. Debounce the notification card: only show at final position when movement stops
            if (targetCoords) {
                if (cardTimers[userEmail]) {
                    clearTimeout(cardTimers[userEmail]);
                }

                cardTimers[userEmail] = setTimeout(() => {
                    const cardId = crypto.randomUUID();
                    const pos = editor.pageToViewport(targetCoords);

                    setUpdateCards(prev => [
                        ...prev.filter(c => c.userName !== getName(userEmail)),
                        {
                            id: cardId,
                            userName: getName(userEmail),
                            userColor: userColor,
                            x: Math.ceil(pos.x),
                            y: Math.ceil(pos.y)
                        }
                    ]);

                    setTimeout(() => {
                        setUpdateCards(prev => prev.filter(card => card.id !== cardId));
                    }, 2000);

                    delete cardTimers[userEmail];
                }, 300);
            }
        };

        socket.on("whiteboard-sync", handleRemoteUpdate)

        return () => {
            cleanup()
            if (timer) clearTimeout(timer)
            Object.values(cardTimers).forEach(clearTimeout)
            socket.off("whiteboard-sync", handleRemoteUpdate)
        }
    }, [editor, socketRef, boardId])
}

export default useWhiteboardSync