import { useEffect, useState } from 'react';
//@ts-ignore
import { getCustomizationInv, deleteCustomizationInv, updateCustomizationInv } from '../../redux/actions/customization.action';
import { RootState } from '../../redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { EditIcon, TrashBinIcon } from '../../icons';
import Alert from '../../components/ui/alert/Alert';

interface Investigation {
    _id: string;
    name: string;
    code: string;
    category: string;
    price: number;
    isActive: boolean;
    description?: string; // Added description field (optional)
    createdAt: string;
    updatedAt: string;
}

const InvestigationCustomizeView = () => {
    const dispatch = useDispatch();
    const { investigationsCustom } = useSelector((state: RootState) => state.customization);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Edit states (without Modal)
    const [editingInvestigation, setEditingInvestigation] = useState<Investigation | null>(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        code: '',
        category: '',
        price: 0,
        description: '' // Added description field
    });

    // Delete states (without Modal)
    const [deletingInvestigation, setDeletingInvestigation] = useState<Investigation | null>(null);

    // Load data on mount
    useEffect(() => {
        loadCustomization();
    }, []);

    const loadCustomization = async () => {
        setLoading(true);
        try {
            await dispatch(getCustomizationInv({ category: "all", search: "", isActive: "" }) as any);
        } catch (error) {
            console.error("Error loading investigations:", error);
            setErrorMessage('Failed to load investigations');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Filter investigations based on search and category
    const filteredInvestigations = investigationsCustom?.filter((item: Investigation) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }) || [];

    // Get unique categories for filter
    const categories: string[] = ['all', ...new Set(
        investigationsCustom?.map((item: Investigation) => item.category) || []
    )] as string[];

    // Handle delete
    const handleDelete = async () => {
        if (!deletingInvestigation) return;

        try {
            setLoading(true);
            const result = await dispatch(deleteCustomizationInv(deletingInvestigation._id) as any);

            if (result?.type === 'DELETE_INV_CUS_SUCCESS') {
                setSuccessMessage(`${deletingInvestigation.name} deleted successfully!`);
                setDeletingInvestigation(null);
                await loadCustomization();
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setErrorMessage('Failed to delete investigation');
                setTimeout(() => setErrorMessage(''), 5000);
            }
        } catch (error) {
            console.error('Error deleting investigation:', error);
            setErrorMessage('Error deleting investigation');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Handle toggle status with switch
    const handleToggleStatus = async (investigation: Investigation) => {
        try {
            setLoading(true);
            const updatedData = {
                ...investigation,
                isActive: !investigation.isActive
            };

            const result = await dispatch(updateCustomizationInv(investigation._id, updatedData) as any);

            if (result?.type === 'UPDATE_INV_CUS_SUCCESS') {
                setSuccessMessage(`${investigation.name} ${!investigation.isActive ? 'activated' : 'deactivated'} successfully!`);
                await loadCustomization();
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setErrorMessage('Failed to update status');
                setTimeout(() => setErrorMessage(''), 5000);
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            setErrorMessage('Error updating status');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (investigation: Investigation) => {
        setEditingInvestigation(investigation);
        setEditFormData({
            name: investigation.name,
            code: investigation.code,
            category: investigation.category,
            price: investigation.price,
            description: investigation.description || '' // Added description
        });
    };

    // Check if category requires description
    const requiresDescription = (category: string) => {
        return category === 'procedure' || category === 'iui';
    };

    // Get category label for dynamic messages
    const getCategoryLabel = (category: string) => {
        if (category === 'procedure') return 'Procedure';
        if (category === 'iui') return 'IUI (Intrauterine Insemination)';
        return '';
    };

    // Handle update submit
    const handleUpdateSubmit = async () => {
        if (!editingInvestigation) return;

        // Validate description if category is procedure or iui
        if (requiresDescription(editFormData.category) && !editFormData.description.trim()) {
            setErrorMessage(`Description is required for ${getCategoryLabel(editFormData.category)} tests`);
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        }

        if (requiresDescription(editFormData.category) && editFormData.description.trim().length < 10) {
            setErrorMessage(`Description must be at least 10 characters for ${getCategoryLabel(editFormData.category)} tests`);
            setTimeout(() => setErrorMessage(''), 5000);
            return;
        }

        try {
            setLoading(true);
            const updatedData = {
                ...editingInvestigation,
                ...editFormData,
                description: requiresDescription(editFormData.category) ? editFormData.description.trim() : ''
            };

            const result = await dispatch(updateCustomizationInv(editingInvestigation._id, updatedData) as any);
            console.log(result);

            if (result?.type === 'UPDATE_INV_CUS_SUCCESS') {
                setSuccessMessage('Investigation updated successfully!');
                setEditingInvestigation(null);
                await loadCustomization();
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setErrorMessage('Failed to update investigation');
                setTimeout(() => setErrorMessage(''), 5000);
            }
        } catch (error) {
            console.error('Error updating investigation:', error);
            setErrorMessage('Error updating investigation');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingInvestigation(null);
        setEditFormData({
            name: '',
            code: '',
            category: '',
            price: 0,
            description: ''
        });
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
        setDeletingInvestigation(null);
    };

    // Get category badge color
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'pndt': 'bg-purple-100 text-purple-800',
            'pelvic': 'bg-blue-100 text-blue-800',
            'fm': 'bg-green-100 text-green-800',
            'gbt': 'bg-yellow-100 text-yellow-800',
            'rbt': 'bg-red-100 text-red-800',
            'procedure': 'bg-indigo-100 text-indigo-800',
            'iui': 'bg-pink-100 text-pink-800' // Added IUI color
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    // Check if selected category requires description
    const showDescriptionField = requiresDescription(editFormData.category);

    return (
        <>
            <PageMeta
                title="Investigation Customization | Admin"
                description="Manage investigation customization"
            />
            <PageBreadcrumb pageTitle="Investigation Customization" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                {/* Messages */}
                {successMessage && (
                    <div className='mb-6'>
                        <Alert
                            variant="success"
                            title="Success"
                            message={successMessage}
                            showLink={false}
                        />
                    </div>
                )}
                {errorMessage && (
                    <div className='mb-6'>
                        <Alert
                            variant="error"
                            title="Error"
                            message={errorMessage}
                            showLink={false}
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            {categories?.map((category) => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-2 py-3">S.No</th>
                                <th scope="col" className="px-2 py-3">Name</th>
                                <th scope="col" className="px-2 py-3">Code</th>
                                <th scope="col" className="px-2 py-3">Category</th>
                                <th scope="col" className="px-2 py-3">Price</th>
                                <th scope="col" className="px-2 py-3">Status</th>
                                <th scope="col" className="px-2 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInvestigations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        No investigations found
                                    </td>
                                </tr>
                            ) : (
                                filteredInvestigations.map((item: Investigation, index: number) => (
                                    <tr
                                        key={item._id}
                                        className={`bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                                            item.isActive
                                                ? 'border-l-4 border-l-green-500'
                                                : 'border-l-4 border-l-red-500'
                                        }`}
                                    >
                                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                                            {index + 1}
                                        </td>
                                        <td className="px-2 py-4 text-sm text-gray-900 dark:text-white">
                                            {item.name}
                                        </td>
                                        <td className="px-2 py-4">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded">
                                                {item.code}
                                            </span>
                                        </td>
                                        <td className="px-2 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(item.category)}`}>
                                                {item.category.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-2 py-4 font-medium text-gray-900 dark:text-white">
                                            ₹{item.price}
                                        </td>
                                        <td className="px-2 py-4">
                                            {/* Toggle Switch */}
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={item.isActive}
                                                    onChange={() => handleToggleStatus(item)}
                                                    disabled={loading}
                                                />
                                                <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                </div>
                                            </label>
                                        </td>
                                        <td className="px-2 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingInvestigation(item)}
                                                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashBinIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Total count */}
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Total: {filteredInvestigations.length} investigations
                </div>
            </div>

            {/* Edit Form - Modal */}
            {editingInvestigation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Edit Investigation
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Code
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.code}
                                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    value={editFormData.category}
                                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pndt">PNDT</option>
                                    <option value="pelvic">Pelvic</option>
                                    <option value="fm">FM</option>
                                    <option value="gbt">GBT</option>
                                    <option value="rbt">RBT</option>
                                    <option value="procedure">Procedure</option>
                                    <option value="iui">IUI (Intrauterine Insemination)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.price}
                                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Description Field - Only visible when Procedure or IUI is selected */}
                            {showDescriptionField && (
                                <div>
                                    <div className={`rounded-lg p-3 mb-3 ${
                                        editFormData.category === 'procedure' 
                                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                                            : 'bg-pink-50 dark:bg-pink-900/20'
                                    }`}>
                                        <p className={`text-xs ${
                                            editFormData.category === 'procedure' 
                                                ? 'text-blue-700 dark:text-blue-300' 
                                                : 'text-pink-700 dark:text-pink-300'
                                        }`}>
                                            <span className="font-semibold">
                                                ℹ️ {getCategoryLabel(editFormData.category)} Test
                                            </span> - Description is required for {getCategoryLabel(editFormData.category).toLowerCase()} tests.
                                        </p>
                                    </div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        placeholder={`Describe the ${editFormData.category} in detail...`}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-y"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Minimum 10 characters required
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation - Modal */}
            {deletingInvestigation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Delete Investigation
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Are you sure you want to delete <strong>{deletingInvestigation.name}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InvestigationCustomizeView;