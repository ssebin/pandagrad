import React, { useState } from 'react';
import CustomDropdown from './CustomDropdown';

import { faUniversity, faFileExport } from '@fortawesome/free-solid-svg-icons';

function Dropdowns() {
    const [selectedProgram, setSelectedProgram] = useState('MSE (ST)');
    const [selectedExport, setSelectedExport] = useState('Export');

    const programItems = ['MSE (ST)', 'MCS (AC)'];
    const exportItems = ['PDF', 'Excel'];

    return (
        <div className="dropdowns">
            <CustomDropdown
                label={selectedProgram}
                items={programItems}
                icon={faUniversity}
                onSelect={(item) => setSelectedProgram(item)}
            />
            <CustomDropdown
                label={selectedExport}
                items={exportItems}
                icon={faFileExport}   
                updateLabel={false}   
                onSelect={(item) => {
                    setSelectedExport(item);
                    // Handle export functionality here
                }}
            />
        </div>
    );
}

export default Dropdowns;