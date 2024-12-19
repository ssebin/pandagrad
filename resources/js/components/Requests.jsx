import React, { useState, useEffect } from "react";
import { FaSearch } from 'react-icons/fa';
import { useUser } from './UserContext';
import "./Requests.css";
import UpdateDetailsModal from "./UpdateDetailsModal.jsx";
import { useNotifications } from "./NotificationContext";

const Requests = () => {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUpdate, setSelectedUpdate] = useState(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [showUnread, setShowUnread] = useState(false);
    const { notifications = [], fetchRequests, requests } = useNotifications();

    const userRole = user.role;

    useEffect(() => {
        const loadRequests = async () => {
            setIsLoading(true);
            await Promise.all([fetchRequests()]);
            setIsLoading(false);
        };
        loadRequests();
    }, []); // Run once when the component is mounted

    useEffect(() => {
        if (notifications.length) {
            fetchRequests();
        }
        //console.log("Notifications in Requests.jsx:", notifications);
    }, [notifications]);

    const formatDate = (date) => {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    const handleSearchInputChange = (e) => {
        setSearchKeyword(e.target.value.toLowerCase());
    };

    const handleRowClick = (update) => {
        setSelectedUpdate(update);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUpdate(null);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "status-pending";
            case "Approved":
                return "status-approved";
            case "Rejected":
                return "status-rejected";
            default:
                return "";
        }
    };

    // const filterRequests = (requests) => {
    //     return requests.filter((request) => {
    //         const matchesSearch = searchKeyword === "" ||
    //             (request.student_name && request.student_name.toLowerCase().includes(searchKeyword)) ||
    //             (request.update_name && request.update_name.toLowerCase().includes(searchKeyword)) ||
    //             (request.evidence && request.evidence.name && request.evidence.name.toLowerCase().includes(searchKeyword)) ||
    //             (request.status && request.status.toLowerCase().includes(searchKeyword));

    //         const matchesFilter = filterStatus === "" || request.status === filterStatus;
    //         return matchesSearch && matchesFilter;
    //     });
    // };

    const filterRequests = (requests) => {
        return requests.filter((request) => {
            const relatedNotification = Array.isArray(notifications)
                ? notifications.find((noti) => noti.progress_update_id === request.id)
                : undefined;

            const isUnread = relatedNotification?.read_at === null;

            const matchesSearch =
                searchKeyword === "" ||
                (request.student_name &&
                    request.student_name.toLowerCase().includes(searchKeyword)) ||
                (request.update_name &&
                    request.update_name.toLowerCase().includes(searchKeyword)) ||
                (request.evidence &&
                    request.evidence.name &&
                    request.evidence.name.toLowerCase().includes(searchKeyword)) ||
                (request.status && request.status.toLowerCase().includes(searchKeyword));

            const matchesFilter = filterStatus === "" || request.status === filterStatus;
            const matchesUnread = !showUnread || isUnread;

            return matchesSearch && matchesFilter && matchesUnread;
        });
    };

    const sortedRequests = filterRequests(requests).sort((a, b) => b.id - a.id);

    const totalPages = Math.ceil(filterRequests(requests).length / itemsPerPage);
    const paginatedRequests = sortedRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPageNumbers = () => {
        if (totalPages === 1) {
            return [1];
        }

        const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
        const maxPagesToShow = 2; // Number of pages to show at the start and end
        const visiblePages = [];

        // Always include the first page
        visiblePages.push(1);

        // Add '...' after the first page if currentPage is far from it
        if (currentPage > maxPagesToShow + 1) {
            visiblePages.push('...');
        }

        // Add pages around the current page
        const start = Math.max(2, currentPage - 1); // Ensure pages stay within bounds
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
            visiblePages.push(i);
        }

        // Add '...' before the last page if currentPage is far from it
        if (currentPage < totalPages - maxPagesToShow) {
            visiblePages.push('...');
        }

        // Always include the last page
        if (totalPages > 1) {
            visiblePages.push(totalPages);
        }

        return visiblePages;
    };

    //console.log("Notifications:", notifications);
    //console.log("Paginated Requests:", paginatedRequests);

    return (
        <div className="requests-container">
            <div className="header">
                <h1>Requests</h1>
                <div className="actions">
                    <div className="search-bar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchKeyword}
                            onChange={handleSearchInputChange}
                        />
                    </div>
                    <button
                        className="view-pending-button"
                        onClick={() => {
                            if (filterStatus === "Pending") {
                                setFilterStatus(""); // Clear the filter to show all
                            } else {
                                setFilterStatus("Pending"); // Apply the "Pending" filter
                            }
                            setCurrentPage(1); // Reset to the first page
                        }}
                    >
                        {filterStatus === "Pending" ? "View All" : "View Pending"}
                    </button>
                    <button
                        className="filter-button"
                        onClick={() => {
                            setShowUnread(!showUnread); // Toggle the unread filter
                            setCurrentPage(1); // Reset to the first page
                        }}
                    >
                        {showUnread ? "View All" : "View Unread"}
                    </button>
                </div>
            </div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Date</th>
                            <th>Student Name</th>
                            <th>Update</th>
                            <th>Evidence</th>
                            <th>Link</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRequests.map((request, index) => {

                            const relatedNotification = Array.isArray(notifications)
                                ? notifications.find((noti) => noti.progress_update_id === request.id)
                                : undefined;

                            const isRead = relatedNotification?.read_at !== null;

                            //console.log("Related Notification:", relatedNotification);
                            //console.log("Is Read:", isRead);
                            return (
                                <tr
                                    key={index}
                                    onClick={() => handleRowClick(request)}
                                    style={{
                                        backgroundColor: isRead ? "#f5f5f5" : "white", // Light gray if read, white otherwise
                                    }}
                                >
                                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td>{formatDate(request.date)}</td>
                                    <td>{request.student_name}</td>
                                    <td>{request.update_name}</td>
                                    <td>
                                        {request.evidence ? (
                                            <a
                                                href={`/storage/${request.evidence.path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {request.evidence.name}
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td>
                                        {request.link ? (
                                            <a
                                                href={request.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {request.link.length > 20
                                                    ? `${request.link.substring(0, 20)}...`
                                                    : request.link}
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(request.status)}`}>{request.status}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                >
                    First
                </button>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>
                {renderPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        className={currentPage === page ? "active" : ""}
                        disabled={page === '...'}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    Last
                </button>
            </div>
            {isModalOpen && (
                <UpdateDetailsModal
                    update={selectedUpdate}
                    onClose={handleCloseModal}
                    userRole={userRole}
                />
            )}
        </div>
    );
};

export default Requests;