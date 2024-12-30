import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

function CustomDropdown({ label, items, onSelect, updateLabel = true, icon }) {
    const [open, setOpen] = useState(false);
    const [currentLabel, setCurrentLabel] = useState(label);
    const ref = useRef();

    const handleToggle = () => {
        setOpen(!open);
    };

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setOpen(false);
        }
    };

    const handleItemClick = (item) => {
        onSelect(item);
        if (updateLabel) {
            setCurrentLabel(item);
        }
        setOpen(false);
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="custom-dropdown" ref={ref}>
            <button className="dropdown-toggle" onClick={handleToggle}>
                {icon && <FontAwesomeIcon icon={icon} className="left-icon" />}
                {currentLabel}
                <FontAwesomeIcon icon={faAngleDown} className="dropdown-arrow" />
            </button>
            {open && (
                <ul className="dropdown-menu">
                    {items.map((item, index) => (
                        <li key={index}>
                            <button
                                className="dropdown-item"
                                onClick={() => handleItemClick(item)}
                            >
                                {item}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CustomDropdown;