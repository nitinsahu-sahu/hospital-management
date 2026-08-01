import { useCallback, useEffect, useRef, useState } from "react";
import { PatientInfoCard } from "../../components/consultation/PatientInfoCard";
import { RootState } from "../../redux/store/store";
import { useDispatch, useSelector } from "react-redux";
//@ts-ignore
import { getProceduresByPatientId, downloadProcedurePDF } from '../../redux/actions/procedure.actions';
import { PdfIcon } from '../../icons';

export interface SelectedPatient {
    _id: string;
    name: string;
    UH_ID: string;
    pic?: {
        url: string;
    };
    mobileNumber?: string;
    relative?: {
        _id?: string
    }
}

const ProcedureView = () => {
    const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
    const currentPatientIdRef = useRef<string | null>(null);
    const { procedures, loading } = useSelector((state: RootState) => state.procedure);
    const [expandedProcedureId, setExpandedProcedureId] = useState<string | null>(null);

    const dispatch = useDispatch();
    const previousPatientId = useRef<string | null>(null);

    const fetchPatientHistory = useCallback((patientId: string) => {
        if (patientId && patientId !== previousPatientId.current) {
            previousPatientId.current = patientId;
            dispatch(getProceduresByPatientId(patientId) as any);
        }
    }, [dispatch]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format procedure category for display
    const formatCategory = (category: string) => {
        const categories: Record<string, string> = {
            'iui': 'IUI',
            'cvs': 'CVS',
            'prp': 'PRP',
            'lbc': 'LBC',
            'amniocentesis': 'Amniocentesis'
        };
        return categories[category] || category.toUpperCase();
    };

    // Get category color
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'iui': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'cvs': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'prp': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'lbc': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'amniocentesis': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    };

    // Helper function to safely convert to number
    const toNumber = (value: string | number | undefined): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return Number(value) || 0;
        return 0;
    };

    // Handle patient selection from session storage
    useEffect(() => {
        const getPatientFromSession = () => {
            const patientId = sessionStorage.getItem('selectedPatientId');
            const patientUHID = sessionStorage.getItem('selectedPatientUHID');
            const patientData = sessionStorage.getItem('selectedPatient');

            if (patientId && patientUHID && patientData) {
                try {
                    const patient = JSON.parse(patientData);
                    if (currentPatientIdRef.current !== patient._id) {
                        currentPatientIdRef.current = patient._id;
                        fetchPatientHistory(patient._id);
                        setSelectedPatient(patient);
                    }
                } catch (error) {
                    if (currentPatientIdRef.current !== null) {
                        currentPatientIdRef.current = null;
                        setSelectedPatient(null);
                    }
                }
            } else {
                if (currentPatientIdRef.current !== null) {
                    currentPatientIdRef.current = null;
                    setSelectedPatient(null);
                }
            }
        };

        getPatientFromSession();
        const interval = setInterval(getPatientFromSession, 1000);
        window.addEventListener('storage', getPatientFromSession);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', getPatientFromSession);
        };
    }, []);

    const handleDownloadPDF = async (procedureId: any) => {
        try {
            await dispatch(downloadProcedurePDF(procedureId) as any);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Please try again.');
        }
    };

    const toggleProcedureDetails = (procedureId: string) => {
        setExpandedProcedureId(expandedProcedureId === procedureId ? null : procedureId);
    };

    return (
        <div>
            <PatientInfoCard
                selectedPatient={selectedPatient}
                isExistingConsultation={false}
                isLoading={false}
            />

            {/* Procedures List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading procedures...</p>
                </div>
            ) : !selectedPatient ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No patient selected</p>
                    <p className="text-sm mt-2">Please select a patient from the header to view their procedures</p>
                </div>
            ) : procedures?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">No procedures found</p>
                    <p className="text-sm mt-2">This patient has no procedures recorded yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {procedures?.map((procedure: any) => (
                        <div
                            key={procedure._id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 ease-in-out"
                        >
                            {/* Main Row */}
                           <div
    className="p-4 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
    onClick={() => toggleProcedureDetails(procedure._id)}
>
    <div className="flex items-center gap-4 flex-wrap justify-between">
        {/* Procedure Date */}
        <div className="min-w-[120px]">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(procedure.procedureDate || procedure.createdAt)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDateTime(procedure.createdAt)}
            </div>
        </div>

        {/* Procedure Count */}
        <div className="min-w-[80px]">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {procedure.procedures?.length || 0} Procedure{procedure.procedures?.length !== 1 ? 's' : ''}
            </span>
        </div>

        {/* Total Amount */}
        <div className="min-w-[120px]">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                ₹{toNumber(procedure.totalAmount).toLocaleString()}
            </span>
        </div>

        {/* Created By */}
        <div className="min-w-[120px]">
            <span className="text-sm text-gray-600 dark:text-gray-300">
                {procedure.createdBy?.name || 'N/A'}
            </span>
        </div>

        {/* PDF Button */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => handleDownloadPDF(procedure._id)}
                className="p-1.5 rounded-lg text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110"
                title="Download PDF"
            >
                <PdfIcon className="fill-green-500 dark:fill-gray-400 size-5" />
            </button>
        </div>
    </div>
</div>

                            {/* Expandable Details Section */}
                            <div
                                className={`transition-all duration-300 ease-in-out ${expandedProcedureId === procedure._id
                                    ? 'max-h-[5000px] opacity-100'
                                    : 'max-h-0 opacity-0'
                                    } overflow-hidden`}
                            >
                                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <div className="p-6 space-y-6">
                                        {/* Procedure List */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                Procedures Performed
                                            </h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-100 dark:bg-gray-800">
                                                        <tr>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Procedure Name
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Category
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Sub Type
                                                            </th>
                                                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Price
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {procedure.procedures?.map((proc: any, index: number) => (
                                                            <tr key={proc._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                    {proc.name}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(proc.category)}`}>
                                                                        {formatCategory(proc.category)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                    {proc.subType || 'N/A'}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                                                                    ₹{toNumber(proc.price).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="bg-gray-50 dark:bg-gray-800">
                                                        <tr>
                                                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                                                Total Amount
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                                                                ₹{toNumber(procedure.totalAmount).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Procedure Date</label>
                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {formatDate(procedure.procedureDate || procedure.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created By</label>
                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {procedure.createdBy?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Created At</label>
                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {formatDateTime(procedure.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                                                <p className="text-sm text-gray-900 dark:text-white mt-1">
                                                    {formatDateTime(procedure.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProcedureView;