import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tldraw } from '@tldraw/tldraw';
import getRandomInt from '../utils/getRandomInt';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket } from '../lib/socket';
import BoardUpdateCard from '../components/BoardUpdateCard';
import useWhiteboardSync from "../hooks/useWhiteboardSync";
import { Toast } from 'primereact/toast';

// Importing utils
import getName from '../utils/getName';

// Importing css for render
import '@tldraw/tldraw/tldraw.css';

export default function WhiteboardRoom() {

    const { id: boardId } = useParams();
    const toastRef = useRef(null);
    const navigate = useNavigate();

    const [initialSnapshot, setInitialSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [boardTitle, setBoardTitle] = useState('Loading board...');
    const [collabInfo, setCollabInfo] = useState({ role: "editor" })
    const [editor, setEditor] = useState(null)
    const [saveStatus, setSaveStatus] = useState(false)
    const [userRole, setUserRole] = useState("")
    const [updateCards, setUpdateCards] = useState([])

    // Custom hook for whiteboard sync
    useWhiteboardSync(editor, connectSocket, boardId, setSaveStatus, userRole, setUpdateCards)

    const { user, session } = useAuth()

    // State to manage the share popup modal visibility
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Get board data and establish socket connection
    useEffect(() => {
        if (!session || !user) return

        let socketInstance = null
        let mounted = true

        const getBoardData = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/board/access/${boardId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer: ${session.access_token}`
                    }
                })

                const data = await res.json()
                console.log(data)

                if (!res.ok) {
                    console.log("you are unauthorized bitch")
                    navigate("/dashboard")
                    return
                }

                const { boardData, userRole } = data
                setUserRole(userRole)

                if (boardData) {
                    setBoardTitle(boardData.title)
                    const hasData = boardData.canvas_data && Object.keys(boardData.canvas_data).length > 0
                    setInitialSnapshot(hasData ? boardData.canvas_data : null)
                }

                socketInstance = connectSocket(session, boardId)

                const joinRoom = () => {
                    socketInstance.emit("join-room", { boardId, userId: user.id, userEmail: user.email })
                }

                if (socketInstance.connected) {
                    joinRoom()
                } else {
                    socketInstance.once("connect", joinRoom)
                }

                socketInstance.on("user-connected", ({ userId, userEmail }) => {
                    toastRef.current?.show({
                        severity: 'info',
                        summary: 'Collaborator Connected',
                        detail: `${getName(userEmail)} has joined the whiteboard session.`,
                        life: 3000
                    })
                })

                socketInstance.on("user-disconnect-notif", (userEmail) => {
                    toastRef.current?.show({
                        severity: "error",
                        summary: "Collaborater Left",
                        detail: `${getName(userEmail)} has left the whiteboard session`,
                        life: 3000
                    })
                })

                socketInstance.on("connect_error", (err) => {
                    console.log("Error aaya", err)
                })
            } catch (err) {
                console.error(err)
                navigate("/dashboard")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        getBoardData()

        return () => {
            mounted = false
            if (socketInstance) {
                socketInstance.off("user-connected")
                socketInstance.off("user-disconnect-notif")
                disconnectSocket({ boardId, userId: user.id })
            }
        }
    }, [boardId, session, user, navigate])

    const addCollaborators = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", collabInfo.email)
                .maybeSingle()

            if (error) throw error

            if (!data) throw new Error("User doesn't exist")

            const { data: cData, error: cError } = await supabase
                .from("collaborators")
                .insert([
                    {
                        whiteboard_id: boardId,
                        user_id: data.id,
                        role: collabInfo.role
                    }
                ])

            if (cError) throw cError
        }
        catch (err) {
            console.error(err)
        }
        finally {
            setIsShareOpen(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#f5f2eb] flex items-center justify-center font-sans text-neutral-600">
                <p className="text-sm font-medium animate-pulse">Assembling canvas grid...</p>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex flex-col bg-[#f5f2eb] select-none relative">
            <Toast ref={toastRef} />

            {/* Render Update Cards */}
            {updateCards?.map((card) => {
                return (
                    <BoardUpdateCard x={card.x} y={card.y} userName={card.userName} userColor={card.userColor} />
                )
            })}

            {/* Dynamic Top Bar utility section matching your clean design */}
            <header className="w-full bg-[#f5f2eb] border-b border-[#e4dec3]/60 px-4 py-3 flex items-center justify-between z-10 shrink-0">

                {/* Left section: Back button + Board title */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium flex items-center space-x-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <div className="h-4 w-[1px] bg-[#e4dec3]" />
                    <h1 className="text-sm font-medium text-neutral-900 truncate max-w-[240px]">
                        {boardTitle}
                    </h1>
                </div>

                {/* Right section: Save status + Share + Cloud Connected */}
                <div className="flex items-center space-x-3">

                    {/* Save status pill */}
                    <div className="px-3 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium shadow-sm flex items-center space-x-1.5 select-none">
                        {saveStatus ? (
                            <>
                                <svg className="w-3 h-3 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                <span>Saving</span>
                            </>
                        ) : (
                            <>
                                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                <span>Saved</span>
                            </>
                        )}
                    </div>

                    {/* Share Action Button */}
                    <button
                        onClick={() => setIsShareOpen(true)}
                        className="px-3 py-1.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors text-xs font-medium shadow-sm flex items-center space-x-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Share</span>
                    </button>

                    {/* Cloud connection indicator */}
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-neutral-400 font-medium">Cloud Connected</span>
                    </div>

                </div>
            </header>

            {/* The Interactive Infinite Canvas Engine CONTAINER */}
            <div className="flex-1 w-full relative">
                <Tldraw
                    initialSnapshot={initialSnapshot}
                    onMount={(mountedEditor) => setEditor(mountedEditor)}
                />
            </div>

            {/* Share Popup Form Modal Overlay */}
            {isShareOpen && (
                <div
                    onClick={() => setIsShareOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-fade-in"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#f5f2eb] border border-[#e4dec3] rounded-xl shadow-2xl max-w-md w-full p-6 relative"
                    >

                        {/* Close Modal Button */}
                        <button
                            onClick={() => setIsShareOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Share Form Content */}
                        <form onSubmit={addCollaborators}>
                            <h2 className="text-base font-semibold text-neutral-900 mb-4 tracking-tight">
                                Share
                            </h2>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="email"
                                    placeholder="Enter collaborator email"
                                    className="flex-1 bg-white border border-[#e4dec3] rounded-lg px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-500 transition-colors"

                                    onChange={(e) => setCollabInfo({ ...collabInfo, email: e.target.value })}
                                />

                                <select
                                    className="bg-white border border-[#e4dec3] rounded-lg px-2 py-2 text-sm text-neutral-700 focus:outline-none focus:border-neutral-500 transition-colors"
                                    defaultValue="editor"

                                    onChange={(e) => { setCollabInfo({ ...collabInfo, role: e.target.value }) }}
                                >
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                </select>

                                <button
                                    type="submit"
                                    className="bg-neutral-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}