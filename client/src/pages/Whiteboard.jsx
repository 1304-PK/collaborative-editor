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

// Importing schemas
import { CollabInfoSchema } from '../schemas/whiteboard.schema';

// Importing utils
import getName from '../utils/getName';
import errorFormatter from '../utils/errorFormatter';

// Importing css for render
import '@tldraw/tldraw/tldraw.css';

export default function WhiteboardRoom() {

    // Socket ref
    const socketRef = useRef(null)

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
    useWhiteboardSync(editor, socketRef, boardId, setSaveStatus, userRole, setUpdateCards)

    const { user, session } = useAuth()

    // State to manage the share popup modal visibility
    const [isShareOpen, setIsShareOpen] = useState(false);

    const showErrorToast = (summary, detail) => {
        toastRef.current?.show({
            severity: 'error',
            summary,
            detail,
            life: 4000,
        })
    }

    const getBoardAccessErrorMessage = (data, status) => {
        const message = typeof data?.message === 'string' ? data.message : null

        if (message === 'User unauthorized') {
            return 'You do not have permission to view this whiteboard.'
        }
        if (message === 'Missing Authentication Token') {
            return 'Your session has expired. Please sign in again.'
        }
        if (message === "User doesn't exist") {
            return 'Your account could not be verified. Please sign in again.'
        }

        return message || `Unable to load this whiteboard (error ${status}).`
    }

    const getCollaboratorErrorMessage = (err) => {
        if (err?.message === "User doesn't exist") {
            return 'No account was found with that email address.'
        }
        if (err?.code === '23505') {
            return 'This person is already a collaborator on this board.'
        }
        return err?.message || 'Could not add collaborator. Please try again.'
    }

    // Get board data and establish socket connection
    useEffect(() => {
        if (!user || !session) return

        let mounted = true

        // ✅ Named handlers defined in effect scope
        // cleanup can always reference these regardless of async timing
        const handleUserConnected = ({ userEmail }) => {
            toastRef.current?.show({
                severity: 'info',
                summary: 'Collaborator Connected',
                detail: `${getName(userEmail)} has joined the whiteboard session.`,
                life: 3000
            })
        }

        const handleUserDisconnected = (userEmail) => {
            toastRef.current?.show({
                severity: "error",
                summary: "Collaborator Left",
                detail: `${getName(userEmail)} has left the whiteboard session`,
                life: 3000
            })
        }

        const handleConnectError = (err) => {
            showErrorToast(
                'Connection failed',
                err?.message || 'Could not connect to the collaboration server. Please refresh the page.'
            )
        }

        const getBoardData = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/board/access/${boardId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                })

                const data = await res.json()

                if (!res.ok) {
                    showErrorToast(
                        'Unable to open board',
                        getBoardAccessErrorMessage(data, res.status)
                    )
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

                // ✅ Check mounted before doing anything after await
                // Effect may have already cleaned up by the time this resolves
                if (!mounted) return

                const socket = connectSocket(session, boardId)
                socketRef.current = socket

                const joinRoom = () => {
                    socket.emit("join-room", { boardId })
                }

                if (socket.connected) {
                    joinRoom()
                } else {
                    socket.once("connect", joinRoom)
                }

                // ✅ Attach named handlers, not inline anonymous functions
                socket.on("user-connected", handleUserConnected)
                socket.on("user-disconnect-notif", handleUserDisconnected)
                socket.on("connect_error", handleConnectError)

            } catch (err) {
                showErrorToast(
                    'Unable to open board',
                    err?.message || 'Something went wrong while loading the whiteboard.'
                )
                navigate("/dashboard")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        getBoardData()

        return () => {
            mounted = false

            if (socketRef.current) {
                // ✅ Remove exactly these named handlers, not all listeners
                socketRef.current.off("user-connected", handleUserConnected)
                socketRef.current.off("user-disconnect-notif", handleUserDisconnected)
                socketRef.current.off("connect_error", handleConnectError)
                disconnectSocket({ boardId })
                socketRef.current = null
            }
        }
    }, [boardId, user?.id, navigate])

    const addCollaborators = async (e) => {
        e.preventDefault()
        console.log(collabInfo)
        try {
            
            const result = CollabInfoSchema.safeParse(collabInfo)
            if (!result.success){
                console.log(result)
                throw new Error(errorFormatter(result))
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/share/add-collaborator`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    email: collabInfo.email,
                    role: collabInfo.role,
                    whiteboard_id: boardId
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)

        }
        catch (err) {
            showErrorToast(
                'Error',
                err.message
            )
        }
        finally {
            setIsShareOpen(false)
        }
    }

    if (loading) {
        return (
            <>
                <Toast ref={toastRef} />
                <div className="min-h-screen w-full bg-[#f5f2eb] flex items-center justify-center font-sans text-neutral-600">
                    <p className="text-sm font-medium animate-pulse">Assembling canvas grid...</p>
                </div>
            </>
        );
    }

    return (
        <div className="w-screen h-screen flex flex-col bg-[#f5f2eb] select-none relative">
            <Toast ref={toastRef} />

            {/* Render Update Cards */}
            {updateCards?.map((card) => {
                console.log("card", card)

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