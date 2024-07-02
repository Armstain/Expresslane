

import React from 'react';
import PropTypes from 'prop-types';

const LocationModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={overlayStyles}>
            <div className="modal-content" style={contentStyles}>
                <button className="modal-close" style={closeButtonStyles} onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

LocationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const contentStyles = {
    backgroundColor: '#fff',
    borderRadius: '5px',
    padding: '20px',
    position: 'relative',
    width: '90%',
    maxWidth: '600px',
};

const closeButtonStyles = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
};

export default LocationModal;
