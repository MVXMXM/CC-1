import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import '../App.css';
import RemoveIcon from '../assets/Remove.svg';

const ConceptInput = ({ value, onChange, onBlur, onDelete, currentEmoji, initialWidth = '316px', placeholder = 'add concept', id }) => {
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef(null);
    const defaultInputWidth = initialWidth;

    const calculateTextWidth = useCallback((text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '32px Helvetica';
        const width = context.measureText(text).width;
        return width;    
    }, []);

    const updateWidth = useCallback((text) => {
        if (!text.trim() && !isFocused) {
            if (inputRef.current) {
                inputRef.current.style.width = defaultInputWidth;
            }
            return defaultInputWidth;
        }
        const emojiWidth = 40;
        const padding = 64;
        const deleteButtonWidth = 24;
        const minWidth = 120;
        const textWidth = Math.ceil(calculateTextWidth(text));
        const calculatedWidth = textWidth + emojiWidth + padding + deleteButtonWidth;
        const newWidth = Math.max(minWidth, calculatedWidth);
        if (inputRef.current) {
            inputRef.current.style.width = `${newWidth}px`;
        }
        return `${newWidth}px`;
    }, [calculateTextWidth, isFocused, defaultInputWidth]);

    useEffect(() => {
        const newWidth = updateWidth(inputValue);
        if (inputRef.current) {
            inputRef.current.style.width = newWidth;
        }
    }, [inputValue, updateWidth]);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.width = initialWidth;
        }
    }, [initialWidth]);

    const inputStyle = {
        transition: 'width 0.1s, outline 0.05s',
        outline: (isFocused || isHovered) ? '2px solid #F15A22' : '0px solid #F15A22',
        paddingLeft: '70px',
        boxSizing: 'border-box',
        fontWeight: inputValue ? 500 : 300,
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        e.target.placeholder = inputValue === '' ? placeholder : '';
        if (inputValue === '') {
            e.target.style.width = '316px';
        }
        onBlur(e.target.value);
    };

    return (
        <div style={{ 
            position: 'relative', 
            display: 'inline-block' 
        }}>
        <span 
            role="img" 
            aria-label="emoji" 
            style={{ 
                position: 'absolute', 
                left: '24px',
                top: '52%', 
                transform: 'translateY(-50%)',
                fontSize: '32px' 
            }}
        >
            {currentEmoji}
        </span>
        <input
            ref={inputRef}
            className="conceptInput"
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder={isFocused && inputValue === '' ? '' : placeholder}
            onFocus={(e) => {
                setIsFocused(true);
                if (inputValue === '') {
                    e.target.placeholder = '';
                    e.target.style.width = '130px';
                }
            }}
            onBlur={handleBlur}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={inputStyle}
        />
        <button
            type="button"
            tabIndex={-1}
            onClick={() => onDelete(id)}
            style={{
                position: 'absolute',
                right: '16px',
                top: '52%', 
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
            }}
        >
            <img src={RemoveIcon} alt="Remove" style={{ width: '24px', height: '24px' }} />
        </button>
        </div>
    );
};

ConceptInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    currentEmoji: PropTypes.string.isRequired,
    initialWidth: PropTypes.string,
    placeholder: PropTypes.string,
    id: PropTypes.number.isRequired,
};

export default ConceptInput;