// import React from 'react';
// import { Nav } from 'react-bootstrap';

// function Tabs({ selectedSemester, onSemesterChange }) {
//     return (
//         <div className="tabs-container">
//             <Nav
//                 variant="pills"
//                 activeKey={selectedSemester}
//                 onSelect={onSemesterChange}
//                 defaultActiveKey="sem1"
//                 className="tabs"
//             >
//                 <Nav.Item>
//                     <Nav.Link eventKey="sem1" className='tabs-item'>Sem 1, 2021/2022</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                     <Nav.Link eventKey="sem2" className='tabs-item'>Sem 2, 2021/2022</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                     <Nav.Link eventKey="sem3" className='tabs-item'>Sem 1, 2022/2023</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                     <Nav.Link eventKey="sem4" className='tabs-item'>Sem 2, 2022/2023</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                     <Nav.Link eventKey="sem5" className='tabs-item'>Sem 1, 2023/2024</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                     <Nav.Link eventKey="sem6" className='tabs-item'>Sem 2, 2023/2024</Nav.Link>
//                 </Nav.Item>
//                 <Nav.Item>
//                     <Nav.Link eventKey="sem7" className='tabs-item'>Sem 1, 2024/2025</Nav.Link>
//                 </Nav.Item>
//             </Nav>
//         </div>
//     );
// }

// export default Tabs;

import React from 'react';
import { Nav } from 'react-bootstrap';

function Tabs({ selectedSemester, onSemesterChange, intakes }) {

    return (
        <div className="tabs-container">
            <Nav
                variant="pills"
                activeKey={selectedSemester ? selectedSemester.id.toString() : null}
                onSelect={(selectedId) => {
                    const selectedIntake = intakes.find(
                        (intake) => intake.id.toString() === selectedId
                    );
                    onSemesterChange(selectedIntake);
                }}
                className="tabs"
            >
                {intakes.map((intake) => (
                    <Nav.Item key={intake.id}>
                        <Nav.Link eventKey={intake.id.toString()} className="tabs-item">
                            {`Sem ${intake.intake_semester}, ${intake.intake_year}`}
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>
        </div>
    );
}

export default Tabs;