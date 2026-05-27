import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {

    const navigate = useNavigate()
    // State to check if "create whiteboard" popup form is visible
    const [isOpen, setIsOpen] = useState(false);
    const [boardName, setBoardName] = useState('');

    const {user} = useAuth()

    // List to store list of whiteboards
    const [boards, setBoards] = useState([]);

    const handleCreateBoard = async (e) => {
        e.preventDefault();

        try {
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
                throw new Error(error.message)
            }

            // Update list with the new created whiteboard
            if (data) {
                setBoards((prev) => [...data, ...prev])
            }
        }
        catch (err) {
            console.error(err)
        }

        setBoardName('');
        setIsOpen(false);
    };

    const openWhiteboard = (id) => {
        navigate(`/board/${id}`)
    }

    useEffect(() => {
        const getDashboardInfo = async () => {
            try{
                const {data, error} = await supabase
                .from("whiteboards")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", {ascending: false})

                if (error){
                    throw new Error(error.message)
                }

                console.log(data)
                setBoards(data)
            }
            catch(err){
                console.error(err)
            }
        }

        getDashboardInfo()
    }, [])

    return (
        <div className="min-h-screen w-full bg-[#f5f2eb] flex flex-col font-sans relative overflow-hidden"
            style={{
                backgroundImage: 'radial-gradient(#d1ccc0 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
            }}>

            {/* Header */}
            <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#e4dec3]/60">
                <div className="flex items-center space-x-2">
                    {/* Minimalist Logo Icon */}
                    <div className="w-6 h-6 rounded bg-neutral-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#f5f2eb] rotate-45" />
                    </div>
                    <h1 className="text-xl font-medium tracking-tight text-neutral-900">
                        Whiteboard
                    </h1>
                </div>

                {/* User Profile Placeholder */}
                <div className="w-8 h-8 rounded-full bg-neutral-200 border border-[#e4dec3] flex items-center justify-center text-xs font-medium text-neutral-600">
                    U
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col justify-between">

                {/* Welcome Section */}
                <div className="flex items-start justify-between w-full max-w-7xl">
                    <div className="space-y-2 max-w-md">
                        <h2 className="text-3xl font-light tracking-tight text-neutral-900">
                            Your creative canvas.
                        </h2>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Collaborate, map out flows, and sketch ideas in real-time with your team.
                        </p>
                    </div>

                    {/* Create button beside heading */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-[#f5f2eb] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create</span>
                    </button>
                </div>

                {/* Section showing ongoing whiteboards */}
                <div className="my-auto w-full py-8">
                    {boards.length === 0 ? (
                        /* Placeholder for no whiteboards */
                        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-[#d1ccc0]/60 rounded-2xl max-w-2xl w-full mx-auto bg-[#f5f2eb]/40 backdrop-blur-[2px]">
                            <div className="p-4 bg-white/80 rounded-full border border-[#e4dec3] shadow-sm mb-4">
                                <svg
                                    className="w-6 h-6 text-neutral-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <p className="text-sm text-neutral-600 font-medium mb-1">No active boards</p>
                            <p className="text-xs text-neutral-400 mb-6">Get started by building your first collaborative space.</p>

                            {/* Triggers popup visibility */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-[#f5f2eb] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Create new project</span>
                            </button>
                        </div>
                    ) : (
                        /* Active list landscape cards grid layout */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl w-full mx-auto">
                            {boards.map((board) => (
                                <div
                                    key={board.id}
                                    className="bg-white/80 backdrop-blur-[2px] border border-[#e4dec3] rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200"

                                    onClick={() => openWhiteboard(board.id)}
                                >
                                    <div className="space-y-1 pr-4 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                            {board.title}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            Created {new Date(board.created_at || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <button className="bg-neutral-900 hover:bg-neutral-800 text-[#f5f2eb] text-xs font-medium px-3 py-1.5 rounded-md transition-colors duration-200 shrink-0">
                                        Open
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subtle Footer info */}
                <footer className="text-center text-xs text-neutral-400 pt-6">
                    System connected to Supabase Auth backend.
                </footer>
            </main>

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
        </div>
    );
}