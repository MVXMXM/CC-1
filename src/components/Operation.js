import React, { useState, useEffect } from 'react';
import '../App.css';
import useIsMobile from '../hooks/useIsMobile.js';

const Operation = ({ character, onCharacterChange, addOperation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localCharacter, setLocalCharacter] = useState(character);
  const isMobile = useIsMobile();
  const buttonSize = isMobile ? 56 : 80;
  const buttonFont = isMobile ? 24 : 32;
  const menuGap = isMobile ? 14 : 20;

  const toggleMenu = () => {
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    setLocalCharacter(character);
  }, [character]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && !event.target.closest('.operation')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleButtonClick = (value) => {
    setLocalCharacter(value);
    onCharacterChange(value);
    setIsExpanded(false);
    if (addOperation) {
      addOperation();
    }
  };

  const operationButtonStyle = {
    zIndex: 900,
    width: isExpanded ? '10px' : `${buttonSize}px`,
    height: isExpanded ? '10px' : `${buttonSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: `${buttonSize}px`,
    color: '#F15A22',
    textAlign: 'center',
    fontFamily: '"DM Sans"',
    fontSize: isExpanded ? '0px' : `${buttonFont}px`,
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 'normal',
    transition: 'width 0.3s ease, height 0.3s ease, font-size 0.3s ease'
  };

  const operationMenuStyle = {
    opacity: isExpanded ? '1' : '0',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: `${menuGap}px`,
    zIndex: '9999',
    transition: 'opacity 0.1s ease, height 0.15s ease, width 0.15s ease',
  };

  const operationMenuButtonStyle = {
    width: isExpanded ? `${buttonSize}px` : '0px',
    height: isExpanded ? `${buttonSize}px` : '0px',
    opacity: isExpanded ? '1' : '0',
    pointerEvents: isExpanded ? 'auto' : 'none',
    cursor: isExpanded ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: `${buttonSize}px`,
    color: '#F15A22',
    textAlign: 'center',
    fontFamily: '"DM Sans"',
    fontSize: `${buttonFont}px`,
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 'normal',
    boxShadow: '0px 0px 30px 0px rgba(0, 0, 0, 0.1)',
    transition: 'width 0.15s ease, height 0.15s ease'
  };

  return (
      <div className="operation" onClick={toggleMenu} style={{ position: 'relative' }}>
        <div style={operationButtonStyle} className="operationButton">{localCharacter}</div>
        {isExpanded && (
          <div style={operationMenuStyle}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: `${menuGap}px` }}>
              <div 
                style={operationMenuButtonStyle} className="operationMenuButton"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick('+');
                }}>
                  +
              </div>
              <div 
                style={operationMenuButtonStyle} className="operationMenuButton"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick('-');
                }}>
                  -
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: `${menuGap}px` }}>
              <div 
                  style={operationMenuButtonStyle} className="operationMenuButton"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleButtonClick('×');
                  }}>
                    ×
                </div>
                <div 
                  style={operationMenuButtonStyle} className="operationMenuButton"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleButtonClick('÷');
                  }}>
                    ÷
                </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default Operation;