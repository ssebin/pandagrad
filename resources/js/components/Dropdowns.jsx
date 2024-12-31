import React, { useState } from 'react';
import CustomDropdown from './CustomDropdown';
import { useUser } from './UserContext';
import { exportToPDF, exportToExcel } from './analyticsExport';
import { statisticsData } from './Statistics';
import { chartsData } from './Charts';

import { faUniversity, faFileExport } from '@fortawesome/free-solid-svg-icons';

function Dropdowns() {
    const [selectedProgram, setSelectedProgram] = useState('MSE (ST)');
    const [selectedExport, setSelectedExport] = useState('Export');

    const programItems = ['MSE (ST)', 'MCS (AC)'];
    const exportItems = ['PDF', 'Excel'];

    const { user } = useUser();

    return (
        <div className="dropdowns">
            {user.role == 'admin' && (
                <CustomDropdown
                    label={selectedProgram}
                    items={programItems}
                    icon={faUniversity}
                    onSelect={(item) => setSelectedProgram(item)}
                />
            )}
            <CustomDropdown
                label={selectedExport}
                items={exportItems}
                icon={faFileExport}
                updateLabel={false}
                onSelect={(item) => {
                    if (item === 'PDF') {
                        exportToPDF();
                    } else if (item === 'Excel') {
                        exportToExcel(statisticsData, chartsData);
                    }
                }}
            />
        </div>
    );
}

export default Dropdowns;