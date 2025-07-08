import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../../constants/constants';
import { useAuth } from '../../context/authUtils';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [newRaffle, setNewRaffle] = useState<{
        title: string;
        host_name: string;
        description: string;
        starting_date: string;
        ending_date: string;
        target: string;
        category_id: string;
        organisation_id: string;
        fundraising_id: string;
        state_raffle_hosted: string;
        type: "raffle" | "fundraising";
        ticket_price: string;
        max_tickets: string;
        image1: File | null; // for file upload
        image2: File | null; // for file upload
        image3: File | null; // for file upload
        image4: File | null; // for file upload
    }>({
        title: "",
        host_name: "",
        description: "",
        starting_date: "",
        ending_date: "",
        target: "",
        category_id: "",
        organisation_id: "",
        fundraising_id: "",
        state_raffle_hosted: "",
        type: "raffle",
        ticket_price: "",
        max_tickets: "",
        image1: null, // for file upload
        image2: null, // for file upload
        image3: null, // for file upload
        image4: null, // for file upload
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orgName, setOrgName] = useState("");
    const [orgCoverImage, setOrgCoverImage] = useState<File | null>(null);
    const [orgCategoryId, setOrgCategoryId] = useState<string>("");
    const [orgNickName, setOrgNickName] = useState("");
    const [orgHandle, setOrgHandle] = useState("");
    const [orgWebsite, setOrgWebsite] = useState("");
    const [orgDescription, setOrgDescription] = useState("");
    const [orgStatus, setOrgStatus] = useState("active");
    const [orgCreating, setOrgCreating] = useState(false);
    const [orgError, setOrgError] = useState<string | null>(null);
    type Category = {
        id: number;
        category_name: string;
        // add other fields if needed
    };
    const [categories, setCategories] = useState<Category[]>([]);
    type Organisation = {
        id: number;
        organisation_name: string;
        // add other fields if needed
    };
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [step, setStep] = useState<1 | 2 | 2.5>(1);
    const [hostType, setHostType] = useState<"personal" | "organisation" | null>(null);

    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('token');
    const { user } = useAuth(); // user: { first_name, last_name, ... }

    const menuItems = [
        { label: "Home", href: "/" },
        { label: "Raffles", href: "/raffles" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "How it works", href: "/howitworks" },
    ];

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    const handleCreateRaffle = async () => {
        setCreating(true);
        setError(null);
        
        // Validation
        if (!newRaffle.title.trim()) {
            setError("Title is required");
            setCreating(false);
            return;
        }
        if (!newRaffle.host_name.trim()) {
            setError("Host name is required");
            setCreating(false);
            return;
        }
        if (!newRaffle.category_id) {
            setError("Please select a category");
            setCreating(false);
            return;
        }
        if (!newRaffle.ending_date) {
            setError("End date is required");
            setCreating(false);
            return;
        }
        if (newRaffle.type === "raffle") {
            if (!newRaffle.ticket_price || parseFloat(newRaffle.ticket_price) <= 0) {
                setError("Valid ticket price is required for raffles");
                setCreating(false);
                return;
            }
            if (!newRaffle.max_tickets || parseInt(newRaffle.max_tickets) <= 0) {
                setError("Valid maximum tickets is required for raffles");
                setCreating(false);
                return;
            }
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("You must be logged in to create a raffle");
                setCreating(false);
                return;
            }
            
            const formData = new FormData();
            formData.append("title", newRaffle.title);
            formData.append("host_name", newRaffle.host_name);
            formData.append("description", newRaffle.description);
            formData.append("starting_date", newRaffle.starting_date);
            formData.append("ending_date", newRaffle.ending_date);
            formData.append("target", newRaffle.target);
            formData.append("category_id", newRaffle.category_id);
            formData.append("type", newRaffle.type);
            if (newRaffle.type === "raffle") {
                formData.append("ticket_price", newRaffle.ticket_price);
                formData.append("max_tickets", newRaffle.max_tickets);
            }
            if (newRaffle.organisation_id) formData.append("organisation_id", newRaffle.organisation_id);
            if (newRaffle.fundraising_id) formData.append("fundraising_id", newRaffle.fundraising_id);
            if (newRaffle.state_raffle_hosted) formData.append("state_raffle_hosted", newRaffle.state_raffle_hosted);
            // Support up to 4 images
            if (newRaffle.image1) formData.append("image1", newRaffle.image1);
            if (newRaffle.image2) formData.append("image2", newRaffle.image2);
            if (newRaffle.image3) formData.append("image3", newRaffle.image3);
            if (newRaffle.image4) formData.append("image4", newRaffle.image4);

            console.log('API_BASE_URL:', API_BASE_URL);
            console.log('Sending request to:', `${API_BASE_URL}/raffles`);
            console.log('FormData entries:');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const res = await fetch(`${API_BASE_URL}/raffles`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            console.log('Response status:', res.status);
            console.log('Response URL:', res.url);
            console.log('Response headers:', res.headers);

            if (!res.ok) {
                const errText = await res.text();
                console.error('Error response:', errText);
                throw new Error(errText || `Failed to create raffle (${res.status})`);
            }

            const responseData = await res.json();
            console.log('Success response:', responseData);

            setShowCreateModal(false);
            setNewRaffle({
                title: "",
                host_name: "",
                description: "",
                starting_date: "",
                ending_date: "",
                target: "",
                category_id: "",
                organisation_id: "",
                fundraising_id: "",
                state_raffle_hosted: "",
                type: "raffle",
                ticket_price: "",
                max_tickets: "",
                image1: null,
                image2: null,
                image3: null,
                image4: null,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create raffle.");
        } finally {
            setCreating(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewRaffle({ ...newRaffle, image1: e.target.files[0] });
        }
    };

    const handleCreateOrganisation = async () => {
        setOrgCreating(true);
        setOrgError(null);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append("organisation_name", orgName);
            if (orgCoverImage) formData.append("cover_image", orgCoverImage);
            if (orgCategoryId) formData.append("category_id", orgCategoryId);
            if (orgNickName) formData.append("nick_name", orgNickName);
            if (orgHandle) formData.append("handle", orgHandle);
            if (orgWebsite) formData.append("website", orgWebsite);
            if (orgDescription) formData.append("description", orgDescription);
            if (orgStatus) formData.append("status", orgStatus);

            const res = await fetch(`${API_BASE_URL}/organisations`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to create organisation");
            setOrgName("");
            setOrgCoverImage(null);
            setOrgCategoryId("");
            setOrgNickName("");
            setOrgHandle("");
            setOrgWebsite("");
            setOrgDescription("");
            setOrgStatus("active");
            setShowOrgModal(false);
            // Refresh organisations list
            const orgRes = await fetch(`${API_BASE_URL}/organisations`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const orgs = await orgRes.json();
            setOrganisations(orgs);
            setStep(2); // Stay on org selection step
        } catch (err: unknown) {
            if (err instanceof Error) {
                setOrgError(err.message);
            } else {
                setOrgError("Failed to create organisation.");
            }
        } finally {
            setOrgCreating(false);
        }
    };

    useEffect(() => {
        if (showCreateModal) {
            // Fetch categories (always needed)
            fetch(`${API_BASE_URL}/categories`)
                .then(res => res.json())
                .then(setCategories)
                .catch(() => setCategories([]));

            // Only fetch organisations if hostType is "organisation"
            if (hostType === "organisation") {
                const token = localStorage.getItem('token');
                fetch(`${API_BASE_URL}/organisations`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(setOrganisations)
                    .catch(() => setOrganisations([]));
            }
        }
    }, [showCreateModal, hostType]);

    // Reset step when modal closes
    useEffect(() => {
        if (!showCreateModal) {
            setStep(1);
            setHostType(null);
        }
    }, [showCreateModal]);

    return (
        <header className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 z-50">
            <nav className="flex justify-between items-center">
                <div className="text-lg font-bold">Funditzone</div>
                {/* Desktop Menu */}
                <ul className="hidden md:flex space-x-4">
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <a href={item.href} className="hover:text-gray-400">
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="hidden md:flex items-center space-x-4">
                    {/* Desktop Buttons */}
                    {!isAuthenticated && (
                        <>
                            <a href="/register" className="bg-btn-primary hover:bg-btn-secondary text-white font-bold py-2 px-4 rounded text-center">
                                Sign Up
                            </a>
                            <a href="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-center">
                                Sign In
                            </a>
                        </>
                    )}
                    {isAuthenticated && (
                        <>
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Raffle
                            </button>
                            <button
                                className="bg-btn-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                                onClick={() => navigate('/dashboard')}
                            >
                                Dashboard
                            </button>
                        </>
                    )}
                </div>
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                    aria-expanded={isMobileMenuOpen}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </button>
            </nav>
            {/* Mobile Navbar */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute left-0 w-full bg-gray-800 text-white p-4 z-50">
                    <ul className="flex flex-col space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className="hover:text-gray-400"
                                    onClick={handleLinkClick}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col space-y-2 mt-4">
                        {!isAuthenticated && (
                            <>
                                <a
                                    href="/register"
                                    className="bg-btn-primary hover:bg-btn-secondary text-white font-bold py-2 px-4 rounded text-center"
                                    onClick={handleLinkClick}
                                >
                                    Sign Up
                                </a>
                                <a
                                    href="/login"
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-center"
                                    onClick={handleLinkClick}
                                >
                                    Sign In
                                </a>
                            </>
                        )}
                        {isAuthenticated && (
                            <>
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center"
                                    onClick={() => { setShowCreateModal(true); setIsMobileMenuOpen(false); }}
                                >
                                    Create Raffle
                                </button>
                                <button
                                    className="bg-btn-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                                    onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                                >
                                    Dashboard
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Create Raffle Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Modal Overlay */}
                    <div
                        className="absolute inset-0 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowCreateModal(false)}
                        aria-label="Close modal"
                    />
                    {/* Modal Content */}
                    <div
                        className="relative bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-200 z-10 animate-fade-in"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Step 1: Host Type Selection */}
                        {step === 1 && (
                            <>
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Host Your Raffle</h2>
                                <div className="flex flex-col gap-4">
                                    <button
                                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                                        onClick={() => {
                                            setHostType("personal");
                                            setStep(2);
                                            setNewRaffle(r => ({
                                                ...r,
                                                organisation_id: "",
                                                host_name: user ? `${user.first_name} ${user.last_name}` : "",
                                            }));
                                        }}
                                    >
                                        Personal Account
                                    </button>
                                    <button
                                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                                        onClick={() => { setHostType("organisation"); setStep(2); }}
                                    >
                                        Organisation
                                    </button>
                                    <button
                                        className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 2: Organisation Selection */}
                        {step === 2 && hostType === "organisation" && (
                            <>
                                <h2 className="text-xl font-bold mb-4 text-gray-900 text-center">Select Organisation</h2>
                                <select
                                    className="w-full mb-4 p-2 border rounded-lg text-black"
                                    value={newRaffle.organisation_id}
                                    onChange={e => setNewRaffle({ ...newRaffle, organisation_id: e.target.value })}
                                >
                                    <option value="">Select Organisation</option>
                                    {organisations.map((org: Organisation) => (
                                        <option key={org.id} value={org.id}>{org.organisation_name}</option>
                                    ))}
                                </select>
                                <button
                                    className="w-full mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                                    onClick={() => setShowOrgModal(true)}
                                >
                                    + Create New Organisation
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                                        onClick={() => { if (newRaffle.organisation_id) setStep(2.5); }}
                                        disabled={!newRaffle.organisation_id}
                                    >
                                        Continue
                                    </button>
                                    <button
                                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                                        onClick={() => setStep(1)}
                                    >
                                        Back
                                    </button>
                                </div>
                                {/* Organisation Creation Popup */}
                                {showOrgModal && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                                        <div
                                            className="absolute inset-0 backdrop-blur-sm transition-opacity"
                                            onClick={() => setShowOrgModal(false)}
                                        />
                                        <div
                                            className="relative bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-200 z-10 animate-fade-in"
                                            onClick={e => e.stopPropagation()}
                                            role="dialog"
                                            aria-modal="true"
                                        >
                                            {/* ...organisation creation form... */}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Step 2/2.5: Raffle Form */}
                        {(step === 2 && hostType === "personal") || (step === 2.5 && hostType === "organisation") ? (
                            <>
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Create New Raffle</h2>
                                {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
                                <form
                                    className="flex flex-col gap-3"
                                    onSubmit={e => { e.preventDefault(); handleCreateRaffle(); }}
                                >
                                    <input
                                        className="w-full p-2 border rounded-lg text-black"
                                        placeholder="Title"
                                        value={newRaffle.title}
                                        onChange={e => setNewRaffle({ ...newRaffle, title: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="w-full p-2 border rounded-lg text-black"
                                        placeholder="Host Name"
                                        value={newRaffle.host_name}
                                        onChange={e => setNewRaffle({ ...newRaffle, host_name: e.target.value })}
                                        required
                                        disabled={hostType === "personal"} // <-- disable if personal account
                                    />
                                    <textarea
                                        className="w-full p-2 border rounded-lg text-black resize-none"
                                        placeholder="Description"
                                        value={newRaffle.description}
                                        onChange={e => setNewRaffle({ ...newRaffle, description: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                    
                                    {/* Campaign Type Selection */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                className={`p-3 border rounded-lg text-center transition-all ${
                                                    newRaffle.type === 'raffle' 
                                                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                                onClick={() => setNewRaffle({ ...newRaffle, type: 'raffle' })}
                                            >
                                                <div className="font-medium">Raffle</div>
                                                <div className="text-xs text-gray-600">Sell tickets for prizes</div>
                                            </button>
                                            <button
                                                type="button"
                                                className={`p-3 border rounded-lg text-center transition-all ${
                                                    newRaffle.type === 'fundraising' 
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                                onClick={() => setNewRaffle({ ...newRaffle, type: 'fundraising' })}
                                            >
                                                <div className="font-medium">Fundraising</div>
                                                <div className="text-xs text-gray-600">Accept donations</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Raffle-specific fields */}
                                    {newRaffle.type === 'raffle' && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="p-2 border rounded-lg text-black"
                                                    placeholder="Ticket Price ($)"
                                                    value={newRaffle.ticket_price}
                                                    onChange={e => setNewRaffle({ ...newRaffle, ticket_price: e.target.value })}
                                                    min="0.01"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    className="p-2 border rounded-lg text-black"
                                                    placeholder="Max Tickets (optional)"
                                                    value={newRaffle.max_tickets}
                                                    onChange={e => setNewRaffle({ ...newRaffle, max_tickets: e.target.value })}
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            className="w-1/2 p-2 border rounded-lg text-black"
                                            value={newRaffle.starting_date}
                                            onChange={e => setNewRaffle({ ...newRaffle, starting_date: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="date"
                                            className="w-1/2 p-2 border rounded-lg text-black"
                                            value={newRaffle.ending_date}
                                            onChange={e => setNewRaffle({ ...newRaffle, ending_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <select
                                        className="w-full p-2 border rounded-lg text-black"
                                        value={newRaffle.category_id}
                                        onChange={e => setNewRaffle({ ...newRaffle, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat: Category) => (
                                            <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full p-2 border rounded-lg text-black"
                                        placeholder="Target Amount"
                                        value={newRaffle.target}
                                        onChange={e => setNewRaffle({ ...newRaffle, target: e.target.value })}
                                        required
                                    />
                                    <label className="block">
                                        <span className="text-gray-700 text-sm">Image 1 (optional)</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full mt-1 p-2 border rounded-lg text-black"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-semibold transition"
                                            onClick={() => setShowCreateModal(false)}
                                            disabled={creating}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                                            disabled={creating}
                                        >
                                            {creating ? "Creating..." : "Create"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Create Organisation Modal */}
            {showOrgModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Modal Overlay */}
                    <div
                        className="absolute inset-0 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowOrgModal(false)}
                        aria-label="Close modal"
                    />
                    {/* Modal Content */}
                    <div
                        className="relative bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gray-200 z-10 animate-fade-in"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Create Organisation</h2>
                        {orgError && <div className="text-red-600 mb-4 text-center">{orgError}</div>}
                        <form
                            className="flex flex-col gap-3"
                            onSubmit={e => { e.preventDefault(); handleCreateOrganisation(); }}
                        >
                            <input
                                className="w-full p-2 border rounded-lg text-black"
                                placeholder="Organisation Name"
                                value={orgName}
                                onChange={e => setOrgName(e.target.value)}
                                required
                            />
                            <label className="block">
                                <span className="text-gray-700 text-sm">Cover Image (optional)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full mt-1 p-2 border rounded-lg text-black"
                                    onChange={e => setOrgCoverImage(e.target.files?.[0] || null)}
                                />
                            </label>
                            <select
                                className="w-full p-2 border rounded-lg text-black"
                                value={orgCategoryId}
                                onChange={e => setOrgCategoryId(e.target.value)}
                            >
                                <option value="">Select Category (optional)</option>
                                {categories.map((cat: Category) => (
                                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                ))}
                            </select>
                            <input
                                className="w-full p-2 border rounded-lg text-black"
                                placeholder="Nick Name (optional)"
                                value={orgNickName}
                                onChange={e => setOrgNickName(e.target.value)}
                            />
                            <input
                                className="w-full p-2 border rounded-lg text-black"
                                placeholder="Handle (optional)"
                                value={orgHandle}
                                onChange={e => setOrgHandle(e.target.value)}
                            />
                            <input
                                className="w-full p-2 border rounded-lg text-black"
                                placeholder="Website (optional)"
                                value={orgWebsite}
                                onChange={e => setOrgWebsite(e.target.value)}
                            />
                            <textarea
                                className="w-full p-2 border rounded-lg text-black resize-none"
                                placeholder="Description (optional)"
                                value={orgDescription}
                                onChange={e => setOrgDescription(e.target.value)}
                                rows={2}
                            />
                            <select
                                className="w-full p-2 border rounded-lg text-black"
                                value={orgStatus}
                                onChange={e => setOrgStatus(e.target.value)}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-semibold transition"
                                    onClick={() => setShowOrgModal(false)}
                                    disabled={orgCreating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                                    disabled={orgCreating}
                                >
                                    {orgCreating ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;