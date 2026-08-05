import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';
import treeBackground from '../assets/tree_background.jpg';
import { getOwnedBoards } from '../utils/getBoards';

// Importing schemas
import { WhiteboardSchema } from '../schemas/whiteboard.schema';
import errorFormatter from "../utils/errorFormatter"

export default function Dashboard() {

    const navigate = useNavigate();
    // State to check if "create whiteboard" popup form is visible
    const [isOpen, setIsOpen] = useState(false);
    const [boardName, setBoardName] = useState('');

    const { user } = useAuth()

    // List to store list of owned whiteboards
    const [boards, setBoards] = useState([]);
    // List to store list of shared whiteboards
    const [sharedBoards, setSharedBoards] = useState([]);

    // Kebab menu + board action modal state
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [collaborators, setCollaborators] = useState([]);
    const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
    const renameDialogRef = useRef(null);
    const deleteDialogRef = useRef(null);
    const collaboratorsDialogRef = useRef(null);
    const toastRef = useRef(null);

    // Open rename dialog
    const openRename = (board) => {
        setSelectedBoard(board);
        setRenameValue(board.title);
        setOpenMenuId(null);
        setIsRenameOpen(true);
    };

    // Open delete dialog
    const openDelete = (board) => {
        setSelectedBoard(board);
        setOpenMenuId(null);
        setIsDeleteOpen(true);
    };

    // Open collaborators dialog
    const openCollaborators = (board) => {
        setSelectedBoard(board);
        setOpenMenuId(null);
        setIsCollaboratorsOpen(true);
    };

    // Sync <dialog> open/close with state
    useEffect(() => {
        if (isRenameOpen) renameDialogRef.current?.showModal();
        else renameDialogRef.current?.close();
    }, [isRenameOpen]);

    useEffect(() => {
        if (isDeleteOpen) deleteDialogRef.current?.showModal();
        else deleteDialogRef.current?.close();
    }, [isDeleteOpen]);

    useEffect(() => {
        if (isCollaboratorsOpen) {
            collaboratorsDialogRef.current?.showModal();
            if (selectedBoard?.id) {
                fetchCollaborators(selectedBoard.id);
            }
        }
        else {
            collaboratorsDialogRef.current?.close();
        }
    }, [isCollaboratorsOpen, selectedBoard?.id]);

    // Function to create whiteboard
    const handleCreateBoard = async (e) => {
        e.preventDefault();

        try {

            const result = WhiteboardSchema.safeParse({boardName: boardName})
            if (!result.success){
                throw new Error(errorFormatter(result))
            }

            const { data, error } = await supabase
                .from("whiteboards")
                .insert([
                    {
                        title: boardName,
                        owner_id: user.id
                    }
                ])
                .select()

            if (error) {
                throw error
            }

            // Update list with the new created whiteboard
            if (data) {
                setBoards((prev) => [...data, ...prev])
            }
        }
        catch (err) {
            
            toastRef.current?.show({
                severity: 'error',
                summary: "Couldn't create board",
                detail: err.message,
                life: 3000
            })
        }

        setBoardName('');
        setIsOpen(false);
    };

    // Function to delete Whiteboard
    const deleteBoard = async (e) => {
        e.preventDefault()

        try {
            const { error } = await supabase
                .from("whiteboards")
                .delete()
                .eq("id", selectedBoard.id)

            if (error) throw error

            const updatedData = await getOwnedBoards(user.id)
            setBoards(updatedData)
        }
        catch (err) {
            
            toastRef.current?.show({
                severity: 'error',
                summary: 'Delete failed',
                detail: "Couldn't delete board",
                life: 3000
            })
        }
        finally {
            setIsDeleteOpen(false)
        }
    }

    // Function to rename whiteboard
    const renameBoard = async (e) => {
        e.preventDefault()

        try {

            const result = WhiteboardSchema.safeParse({boardName: renameValue})
            if (!result.success){
                throw new Error(errorFormatter(result))
            }

            const { data, error } = await supabase
                .from("whiteboards")
                .update({ "title": renameValue })
                .eq("id", selectedBoard.id)

            if (error) throw error

            const updatedData = await getOwnedBoards(user.id)
            setBoards(updatedData)
        }
        catch (err) {
            
            toastRef.current?.show({
                severity: 'error',
                summary: "Couldn't rename board",
                detail: err.message,
                life: 3000
            })
        }
        finally {
            setIsRenameOpen(false)
        }
    }

    // Fetch collaborators for the selected board
    const fetchCollaborators = async (boardId) => {
        setIsLoadingCollaborators(true);
        try {
            // Step 1: Fetch collaborators from the collaborators table
            const { data: collabData, error: collabError } = await supabase
                .from("collaborators")
                .select("role, user_id")
                .eq("whiteboard_id", boardId)
                .in("role", ["viewer", "editor"]);

            if (collabError) throw collabError;

            if (!collabData || collabData.length === 0) {
                setCollaborators([]);
                return;
            }

            // Step 2: Fetch corresponding profiles to get their email addresses
            const userIds = collabData.map(c => c.user_id);
            const { data: profilesData, error: profilesError } = await supabase
                .from("profiles")
                .select("id, email")
                .in("id", userIds);

            if (profilesError) throw profilesError;

            // Map user profiles by id for fast lookup
            const profilesMap = {};
            profilesData?.forEach(profile => {
                profilesMap[profile.id] = profile;
            });

            // Combine the collaborator role/user_id with profile email
            const combined = collabData.map(collab => ({
                role: collab.role,
                user_id: collab.user_id,
                profiles: profilesMap[collab.user_id] || null
            }));

            setCollaborators(combined);
        }
        catch (err) {
            ;
            toastRef.current?.show({
                severity: 'error',
                summary: 'Load failed',
                detail: "Couldn't load collaborators",
                life: 3000
            });
        }
        finally {
            setIsLoadingCollaborators(false);
        }
    };

    // Delete collaborator
    const deleteCollaborator = async (collaboratorUserId) => {
        try {
            const { error } = await supabase
                .from("collaborators")
                .delete()
                .eq("whiteboard_id", selectedBoard.id)
                .eq("user_id", collaboratorUserId);

            if (error) throw error;
            setCollaborators((prev) => prev.filter(c => c.user_id !== collaboratorUserId));
        }
        catch (err) {
            ;
            toastRef.current?.show({
                severity: 'error',
                summary: 'Remove failed',
                detail: "Couldn't remove collaborator",
                life: 3000
            });
        }
    };

    // Navigate to whiteboard
    const openWhiteboard = (id) => {
        navigate(`/board/${id}`)
    }

    // Logout function
    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (err) {
            toastRef.current?.show({
                    severity: 'error',
                    summary: 'LogOut failed',
                    detail: "Couldn't LogOut",
                    life: 3000
                })
        }
    };

    useEffect(() => {
        const getDashboardInfo = async () => {
            try {
                // Fetch both owned boards and shared boards in parallel
                const [ownedRes, sharedRes] = await Promise.all([
                    supabase
                        .from("whiteboards")
                        .select("id, title")
                        .eq("owner_id", user.id)
                        .order("created_at", { ascending: false }),
                    supabase
                        .from("collaborators")
                        .select(`
                            role,
                            whiteboards (
                                id,
                                title,
                                created_at
                            )
                        `)
                        .eq("user_id", user.id)
                ]);

                if (ownedRes.error) throw ownedRes.error;
                if (sharedRes.error) throw sharedRes.error;

                setBoards(ownedRes.data);

                // Format the nested inner join payload cleanly for structural parsing
                const formattedShared = (sharedRes.data || [])
                    .filter(item => item.whiteboards !== null)
                    .map(item => ({
                        id: item.whiteboards.id,
                        title: item.whiteboards.title,
                        created_at: item.whiteboards.created_at,
                        role: item.role
                    }));

                setSharedBoards(formattedShared);
            }
            catch (err) {
                
                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Load failed',
                    detail: "Couldn't load dashboard",
                    life: 3000
                })
            }
        }

        if (user?.id) getDashboardInfo();
    }, [user?.id])

    return (
        <div className="min-h-screen w-full flex flex-col font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${treeBackground})`
            }}>

            <Toast ref={toastRef} />

            {/* Soft white overlay with backdrop blur */}
            <div className="absolute inset-0 bg-[#ffffff2f] backdrop-blur-md z-0" />

            <div className="relative z-10 flex-1 flex flex-col w-full">

                {/* Header */}
                <header className="w-full bg-white/20 backdrop-blur-md border-b border-black/10">
                    <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                            {/* Minimalist Logo Icon */}
                            <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rotate-45" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-black">
                                Whiteboard
                            </h1>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* User Avatar */}
                            <div
                                className="w-8 h-8 rounded-full bg-black/10 border border-black/20 flex items-center justify-center text-xs font-bold text-black cursor-pointer"
                            >
                                {user.email[0].toUpperCase()}
                            </div>

                            {/* Log Out Button with Red Border and Exit Symbol */}
                            <button
                                onClick={handleLogout}
                                title="Log Out"
                                className="w-fit gap h-8 rounded-lg border border-red-500 hover:bg-red-500/10 text-red-500 flex items-center justify-center gap-1 px-2 transition-all duration-200 active:scale-95 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" /> Log out
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col">

                    {/* Welcome Section */}
                    <div className="flex items-start justify-between w-full max-w-7xl mb-12">
                        <div className="space-y-2 max-w-md">
                            <h2 className="text-3xl font-light tracking-tight text-black">
                                Your creative canvas.
                            </h2>
                            <p className="text-sm text-black leading-relaxed">
                                Collaborate, map out flows, and sketch ideas in real-time with your team.
                            </p>
                        </div>

                        {/* Create button beside heading */}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="inline-flex items-center space-x-2 bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create</span>
                        </button>
                    </div>

                    {/* Landscape Workspace Sections */}
                    <div className="w-full space-y-12 flex-1 flex flex-col justify-center">

                        {/* SECTION 1: MY BOARDS */}
                        <div className="w-full space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-black">My Boards</h3>
                            {boards.length === 0 ? (
                                /* Placeholder for no whiteboards */
                                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl max-w-2xl w-full mx-auto bg-[#101010] backdrop-blur-[2px] shadow-lg">
                                    <div className="p-3 bg-white/10 rounded-full border border-white/20 shadow-sm mb-3">
                                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-white font-medium mb-1">No active boards</p>
                                    <p className="text-xs text-white/50 mb-4">Get started by building your first collaborative space.</p>
                                    <button
                                        onClick={() => setIsOpen(true)}
                                        className="inline-flex items-center space-x-2 bg-white hover:bg-neutral-200 text-[#101010] px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm active:scale-[0.98]"
                                    >
                                        <span>Create new project</span>
                                    </button>
                                </div>
                            ) : (
                                /* Active list landscape cards grid layout */
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                    {boards.map((board) => (
                                        <div
                                            key={board.id}
                                            className="bg-[#101010] border border-dashed border-white/25 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:shadow-lg transition-all duration-200"
                                        >
                                            {/* Top row: title + date + kebab */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-0.5 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {board.title}
                                                    </p>
                                                    <p className="text-xs text-white/50">
                                                        Created {new Date(board.created_at || Date.now()).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {/* Kebab menu */}
                                                <div className="relative shrink-0">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === board.id ? null : board.id); }}
                                                        className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {/* Dropdown */}
                                                    {openMenuId === board.id && (
                                                        <div
                                                            className="absolute right-0 top-7 z-20 w-44 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => openRename(board)}
                                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 text-white/60" />
                                                                Rename board
                                                            </button>
                                                            <div className="h-px bg-white/10" />
                                                            <button
                                                                onClick={() => openCollaborators(board)}
                                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                                                            >
                                                                <Users className="w-3.5 h-3.5 text-white/60" />
                                                                Edit collaborators
                                                            </button>
                                                            <div className="h-px bg-white/10" />
                                                            <button
                                                                onClick={() => openDelete(board)}
                                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete board
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom row: Open button */}
                                            <button
                                                onClick={() => openWhiteboard(board.id)}
                                                className="w-full bg-white hover:bg-neutral-200 text-[#101010] text-xs font-semibold px-3 py-1.5 rounded-md transition-colors duration-200"
                                            >
                                                Launch
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* SECTION 2: SHARED WITH ME */}
                        <div className="w-full space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-black">Shared with me</h3>
                            {sharedBoards.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl max-w-2xl w-full mx-auto bg-[#101010] backdrop-blur-[2px] text-center shadow-lg">
                                    <p className="text-sm text-white font-medium">No external shared spaces</p>
                                    <p className="text-xs text-white/50 mt-1 px-4">When others invite you to their workspace rooms, they'll show up here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                    {sharedBoards.map((board) => (
                                        <div
                                            key={board.id}
                                            className="bg-[#101010] border border-dashed border-white/25 rounded-xl p-4 flex items-center justify-between shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                                            onClick={() => openWhiteboard(board.id)}
                                        >
                                            <div className="space-y-2 pr-4 min-w-0">
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {board.title}
                                                    </p>
                                                    <p className="text-xs text-white/50">
                                                        Created {new Date(board.created_at || Date.now()).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {/* Role badge marker */}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${board.role === 'editor'
                                                    ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                                                    : 'bg-white/10 text-white border-white/20'
                                                    }`}>
                                                    {board.role}
                                                </span>
                                            </div>
                                            <button className="bg-white hover:bg-neutral-200 text-[#101010] text-xs font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 shrink-0">
                                                Launch
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Subtle Footer info */}
                    <footer className="text-center text-xs text-black font-semibold pt-12 mt-auto">
                        WhiteBoard
                    </footer>
                </main>

            </div>

            {/* POPUP MODAL COMPONENT */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    {/* Darkened Backdrop Overlay */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsOpen(false)} // Clicking outside the form closes it
                    />

                    {/* Form Container */}
                    <div className="relative w-full max-w-md bg-[#f5f2eb] border border-[#e4dec3] rounded-xl p-6 shadow-2xl z-10 space-y-4">

                        {/* Top Close Button cross mark */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Modal Heading */}
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium text-neutral-900">Create a whiteboard</h3>
                            <p className="text-xs text-neutral-500">Give your project space a distinct title to get rolling.</p>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateBoard} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="boardName" className="text-xs font-medium text-neutral-500 block">
                                    Name of whiteboard
                                </label>
                                <input
                                    id="boardName"
                                    type="text"
                                    required
                                    value={boardName}
                                    onChange={(e) => setBoardName(e.target.value)}
                                    placeholder="e.g., Q3 System Architecture, UI Wireframe"
                                    className="w-full bg-white/70 border border-[#d1ccc0] rounded-lg px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors duration-200"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 border border-[#d1ccc0] text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-neutral-900 hover:bg-neutral-800 text-[#f5f2eb] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                >
                                    Create
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {/* ── RENAME DIALOG ─────────────────────────── */}
            <dialog
                ref={renameDialogRef}
                onClose={() => setIsRenameOpen(false)}
                className="fixed inset-0 m-auto w-full max-w-md rounded-xl border border-[#e4dec3] bg-[#f5f2eb] p-6 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            >
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium text-neutral-900">Rename board</h3>
                        <p className="text-xs text-neutral-500">Enter a new name for <span className="font-semibold text-neutral-700">{selectedBoard?.title}</span>.</p>
                    </div>

                    <form
                        method="dialog"
                        onSubmit={renameBoard}
                        className="space-y-4"
                    >
                        <div className="space-y-1.5">
                            <label htmlFor="renameInput" className="text-xs font-medium text-neutral-500 block">
                                New name
                            </label>
                            <input
                                id="renameInput"
                                type="text"
                                required
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                placeholder="e.g., Q3 System Architecture"
                                className="w-full bg-white/70 border border-[#d1ccc0] rounded-lg px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors duration-200"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsRenameOpen(false)}
                                className="px-4 py-2 border border-[#d1ccc0] text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-neutral-900 hover:bg-neutral-800 text-[#f5f2eb] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                Rename
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* ── DELETE DIALOG ─────────────────────────── */}
            <dialog
                ref={deleteDialogRef}
                onClose={() => setIsDeleteOpen(false)}
                className="fixed inset-0 m-auto w-full max-w-md rounded-xl border border-[#e4dec3] bg-[#f5f2eb] p-6 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            >
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium text-neutral-900">Delete board</h3>
                        <p className="text-xs text-neutral-500">
                            Are you sure you want to delete <span className="font-semibold text-neutral-700">{selectedBoard?.title}</span>? This action cannot be undone.
                        </p>
                    </div>

                    <form
                        method="dialog"
                        onSubmit={deleteBoard}
                        className="space-y-4"
                    >
                        <div className="flex justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 border border-[#d1ccc0] text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* ── EDIT COLLABORATORS DIALOG ───────────────── */}
            <dialog
                ref={collaboratorsDialogRef}
                onClose={() => setIsCollaboratorsOpen(false)}
                className="fixed inset-0 m-auto w-full max-w-md rounded-xl border border-[#e4dec3] bg-[#f5f2eb] p-6 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium text-neutral-900">Edit collaborators</h3>
                            <p className="text-xs text-neutral-500">
                                Manage access for <span className="font-semibold text-neutral-700">{selectedBoard?.title}</span>.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCollaboratorsOpen(false)}
                            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {isLoadingCollaborators ? (
                        <div className="py-8 text-center text-xs text-neutral-500 animate-pulse">
                            Loading collaborators...
                        </div>
                    ) : collaborators.length === 0 ? (
                        <div className="py-8 text-center text-xs text-neutral-500 border border-dashed border-[#d1ccc0] rounded-lg bg-white/30">
                            No collaborators found.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {collaborators.map((collab) => (
                                <div
                                    key={collab.user_id}
                                    className="flex items-center justify-between p-3 bg-white/50 border border-[#e4dec3]/60 rounded-lg"
                                >
                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 truncate pr-2">
                                            {collab.profiles?.email || "Unknown user"}
                                        </p>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${collab.role === 'editor'
                                                ? 'bg-blue-950/10 text-blue-800 border-blue-200'
                                                : 'bg-neutral-200/50 text-neutral-700 border-neutral-300'
                                            }`}>
                                            {collab.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteCollaborator(collab.user_id)}
                                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Remove collaborator"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setIsCollaboratorsOpen(false)}
                            className="px-4 py-2 border border-[#d1ccc0] text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </dialog>

        </div>
    );
}