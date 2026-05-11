import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import useIsMobile from '../hooks/useIsMobile.js';

const Operation = ({ character, onCharacterChange, addOperation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localCharacter, setLocalCharacter] = useState(character);
  const [menuOffsetX, setMenuOffsetX] = useState(0);
  const [useColumn, setUseColumn] = useState(false);
  const operationRef = useRef(null);
  const isMobile = useIsMobile();
  const buttonSize = isMobile ? 56 : 80;
  const buttonFont = isMobile ? 24 : 32;
  const menuGap = isMobile ? 14 : 20;

  useEffect(() => {
    if (!isExpanded) {
      setMenuOffsetX(0);
      setUseColumn(false);
      return undefined;
    }
    const recompute = () => {
      if (!operationRef.current || typeof window === 'undefined') return;
      const rect = operationRef.current.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const gridHalfWidth = buttonSize + menuGap / 2;
      const margin = 8;
      const viewportW = window.innerWidth;
      const gridOverflowsLeft = center - gridHalfWidth < margin;
      const gridOverflowsRight = center + gridHalfWidth > viewportW - margin;
      if (gridOverflowsLeft || gridOverflowsRight) {
        setUseColumn(true);
        setMenuOffsetX(0);
      } else {
        setUseColumn(false);
        setMenuOffsetX(0);
      }
    };
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [isExpanded, buttonSize, menuGap]);

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

  useEffect(() => {
    if (!isExpanded) return;

    const keyMap = {
      '+': '+',
      '-': '-',
      '*': '×',
      'x': '×',
      'X': '×',
      '/': '÷',
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        return;
      }
      const value = keyMap[event.key];
      if (value) {
        event.preventDefault();
        handleButtonClick(value);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

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
    transform: `translate(calc(-50% + ${menuOffsetX}px), -50%)`,
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
      <div
        ref={operationRef}
        className={`operation${isExpanded ? ' is-expanded' : ''}`}
        onClick={toggleMenu}
        style={{
          position: 'relative',
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div style={operationButtonStyle} className="operationButton">{localCharacter}</div>
        {isExpanded && (
          <div style={operationMenuStyle}>
            {useColumn ? (
              ['+', '-', '×', '÷'].map((op) => (
                <div
                  key={op}
                  style={operationMenuButtonStyle}
                  className="operationMenuButton"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleButtonClick(op);
                  }}
                >
                  {op}
                </div>
              ))
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
  );
};

export default Operation;