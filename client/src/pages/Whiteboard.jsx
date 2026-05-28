import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tldraw } from '@tldraw/tldraw';
import { supabase } from '../lib/supabaseClient';
// import {connectSocket, disconnectSocket} from "../lib/socket"
import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/socketContext';
import { connectSocket, disconnectSocket } from '../lib/socket';
import useWhiteboardSync from "../hooks/useWhiteboardSync"

// Importing css for render
import '@tldraw/tldraw/tldraw.css';

export default function WhiteboardRoom() {
    const { id: boardId } = useParams();
    const navigate = useNavigate();

    const [initialSnapshot, setInitialSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [boardTitle, setBoardTitle] = useState('Loading board...');
    const [collabInfo, setCollabInfo] = useState({ role: "editor" })
    const [editor, setEditor] = useState(null)
    const [saveStatus, setSaveStatus] = useState("Saved")

    // const socketRef = useSocket()
    useWhiteboardSync(editor, connectSocket, boardId)

    const {user} = useAuth()

    // State to manage the share popup modal visibility
    const [isShareOpen, setIsShareOpen] = useState(false);

    //   Fetch initial board snapshot from Supabase
    useEffect(() => {
        async function fetchBoardData() {
            try {
                const { data, error } = await supabase
                    .from('whiteboards')
                    .select('title, canvas_data')
                    .eq('id', boardId)
                    .single();

                if (error) throw error;

                if (data) {
                    setBoardTitle(data.title);
                    // If canvas_data is empty or {} then pass null for a fresh start
                    const hasData = data.canvas_data && Object.keys(data.canvas_data).length > 0;
                    setInitialSnapshot(hasData ? data.canvas_data : null);
                }
            } catch (err) {
                console.error('Error fetching board:', err.message);
                // On access being denied by RLS policies, navigate back to the dashboard
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        }

        if (boardId) fetchBoardData();
    }, [boardId, navigate]);

    useEffect(() => {
        const socket = connectSocket()
        const joinRoom = () => {
        socket.emit("join-room", { boardId, userId: user.id });
        console.log("joined room", boardId);
    };

    // if already connected emit immediately, else wait for connection
    if (socket.connected) {
        joinRoom();
    } else {
        socket.once("connect", joinRoom);
    }
        return () => {
            socket.off("user-connected")
            disconnectSocket()
        }
    }, [boardId])

    const handleEditorMount = (editor) => {

    }

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
        <div className="w-screen h-screen flex flex-col bg-[#f5f2eb] select-none">

            {/* Dynamic Top Bar utility section matching your clean design */}
            <header className="w-full bg-[#f5f2eb] border-b border-[#e4dec3]/60 px-4 py-3 flex items-center justify-between z-10 shrink-0">
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

                {/* Notify user about saving the whiteboard */}
                <div>
                    {saveStatus}
                </div>

                <div className="flex items-center space-x-4">
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