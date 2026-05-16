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
    const opNode = operationRef.current;
    setTimeout(() => {
      if (!opNode) return;
      const inputs = Array.from(
        document.querySelectorAll('.calculator input.conceptInput')
      );
      const next = inputs.find(
        (input) =>
          opNode.compareDocumentPosition(input) &
          Node.DOCUMENT_POSITION_FOLLOWING
      );
      if (next) next.focus();
    }, 0);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const operationButtonStyle = {
    zIndex: 900,
    width: isExpanded ? '10px' : `${buttonSize}px`,
    height: isExpanded ? '10px' : `${buttonSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    border: 0,
    padding: 0,
    borderRadius: `${buttonSize}px`,
    color: '#F15A22',
    textAlign: 'center',
    fontFamily: '"DM Sans"',
    fontSize: isExpanded ? '0px' : `${buttonFont}px`,
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 'normal',
    cursor: 'pointer',
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
    border: 0,
    padding: 0,
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

  const handleWrapperBlur = (e) => {
    if (!operationRef.current?.contains(e.relatedTarget)) {
      setIsExpanded(false);
    }
  };

  const renderMenuButton = (op) => (
    <button
      type="button"
      key={op}
      style={operationMenuButtonStyle}
      className="operationMenuButton"
      aria-label={`Operator ${op}`}
      onClick={(e) => {
        e.stopPropagation();
        handleButtonClick(op);
      }}
    >
      {op}
    </button>
  );

  return (
      <div
        ref={operationRef}
        className={`operation${isExpanded ? ' is-expanded' : ''}`}
        onBlur={handleWrapperBlur}
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
        <button
          type="button"
          className="operationButton"
          aria-haspopup="menu"
          aria-expanded={isExpanded}
          aria-label={`Operator ${localCharacter}, choose`}
          onClick={() => setIsExpanded(true)}
          onFocus={() => setIsExpanded(true)}
          style={operationButtonStyle}
        >
          {localCharacter}
        </button>
        {isExpanded && (
          <div role="menu" style={operationMenuStyle}>
            {useColumn ? (
              ['+', '-', '×', '÷'].map(renderMenuButton)
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'row', gap: `${menuGap}px` }}>
                  {renderMenuButton('+')}
                  {renderMenuButton('-')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: `${menuGap}px` }}>
                  {renderMenuButton('×')}
                  {renderMenuButton('÷')}
                </div>
              </>
            )}
          </div>
        )}
      </div>
  );
};

export default Operation;