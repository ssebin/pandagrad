import React from 'react';
import styles from './addsemestermodal.module.css';

function BatchSummaryModal({ isOpen, summary, onClose }) {
    if (!isOpen || !summary) return null;

    const { successCount, errorCount, successfulEntries, errorDetails } = summary;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3 className={styles.h3heading}>Batch Upload Summary</h3>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Successful Entries</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={successCount}
                        readOnly
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Unsuccessful Entries</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={errorCount}
                        readOnly
                    />
                </div>

                {successfulEntries.length > 0 && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Successfully Added</label>
                        <textarea
                            className={styles.textarea}
                            value={successfulEntries
                                .map((student, index) => `${index + 1}. ${student.siswamail}`)
                                .join('\n')}
                            readOnly
                            rows={successfulEntries.length}
                        />
                    </div>
                )}


                {errorDetails.length > 0 && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Errors</label>
                        <textarea
                            className={styles.textarea}
                            value={errorDetails
                                .map(
                                    (error, index) =>
                                        `${index + 1}. ${error.split(' (')[0]}\n(${error.split(' (')[1]}` // Add newline before the parenthesis
                                )
                                .join('\n\n')} // Double newline between errors
                            readOnly
                            rows={errorDetails.length + 2}
                        />
                    </div>
                )}

                <div className={styles.buttons}>
                    <button className={styles.saveButton} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BatchSummaryModal;