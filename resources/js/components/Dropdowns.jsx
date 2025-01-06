// import React, { useState } from 'react';
// import CustomDropdown from './CustomDropdown';
// import { useUser } from './UserContext';
// import { exportToPDF, exportToExcel } from './analyticsExport';
// import { statisticsData } from './Statistics';
// import { chartsData } from './Charts';

// import { faUniversity, faFileExport } from '@fortawesome/free-solid-svg-icons';

// function Dropdowns({ selectedProgram, onProgramChange, selectedSemester }) {
//     const [selectedExport, setSelectedExport] = useState('Export');

//     const programItems = ['MSE (ST)', 'MCS (AC)'];
//     const exportItems = ['PDF', 'Excel'];

//     const { user } = useUser();

//     return (
//         <div className="dropdowns">
//             {user.role == 'admin' && (
//                 <CustomDropdown
//                     label={selectedProgram}
//                     items={programItems}
//                     icon={faUniversity}
//                     onSelect={(item) => onProgramChange(item)}
//                 />
//             )}
//             <CustomDropdown
//                 label={selectedExport}
//                 items={exportItems}
//                 icon={faFileExport}
//                 updateLabel={false}
//                 onSelect={(item) => {
//                     if (item === 'PDF') {
//                         exportToPDF(selectedProgram, selectedSemester);
//                     } else if (item === 'Excel') {
//                         exportToExcel(statisticsData, chartsData, selectedProgram, selectedSemester);
//                     }
//                 }}
//             />
//         </div>
//     );
// }

// export default Dropdowns;

import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';
import { useUser } from './UserContext';
import { exportToPDF, exportToExcel } from './analyticsExport';
import { statisticsData } from './Statistics';
import { chartsData } from './Charts';

import { faUniversity, faFileExport } from '@fortawesome/free-solid-svg-icons';

function Dropdowns({ selectedProgram, onProgramChange, selectedSemester, programs, statistics, chartData }) {
    const [selectedExport, setSelectedExport] = useState('Export');

    const exportItems = ['PDF', 'Excel'];
    const programItems = programs.map((program) => program.name);

    const { user } = useUser();

    // Automatically set the program for coordinators
    useEffect(() => {
        if (user.role !== 'admin' && user.program_id) {
            const coordinatorProgram = programs.find((prog) => prog.id === user.program_id);
            if (coordinatorProgram && (!selectedProgram || selectedProgram.id !== coordinatorProgram.id)) {
                onProgramChange(coordinatorProgram); // Set the coordinator's program
            }
        }
    }, [user, programs, selectedProgram, onProgramChange]);

    return (
        <div className="dropdowns">
            {user.role == 'admin' && (
                <CustomDropdown
                    label={selectedProgram ? selectedProgram.name : 'Select Program'}
                    items={programItems}
                    icon={faUniversity}
                    onSelect={(itemName) => {
                        const selectedProg = programs.find((prog) => prog.name === itemName);
                        onProgramChange(selectedProg);
                    }}
                />
            )}
            <CustomDropdown
                label={selectedExport}
                items={exportItems}
                icon={faFileExport}
                updateLabel={false}
                onSelect={(item) => {
                    if (item === 'PDF') {
                        exportToPDF(selectedProgram, selectedSemester);
                    } else if (item === 'Excel') {
                        exportToExcel(statistics, chartData, selectedProgram, selectedSemester);
                    }
                }}
            />
        </div>
    );
}

export default Dropdowns;