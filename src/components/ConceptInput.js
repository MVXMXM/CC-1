import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import '../App.css';
import RemoveIcon from '../assets/Remove.svg';
import useIsMobile from '../hooks/useIsMobile.js';

const ConceptInput = ({ value, onChange, onBlur, onDelete, currentEmoji, initialWidth = '316px', placeholder = 'add concept', id }) => {
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef(null);
    const isMobile = useIsMobile();
    const fontSize = isMobile ? 22 : 32;
    const emojiSize = isMobile ? 24 : 32;
    const paddingLeft = isMobile ? 56 : 70;
    const paddingRight = isMobile ? 44 : 56;
    const focusWidth = isMobile ? '110px' : '130px';
    const defaultInputWidth = initialWidth;
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const onResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const calculateTextWidth = useCallback((text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `${fontSize}px Helvetica`;
        const width = context.measureText(text).width;
        return width;
    }, [fontSize]);

    const updateWidth = useCallback((text) => {
        const sideInset = isMobile ? 32 : 80;
        const maxAllowed = Math.max(120, viewportWidth - sideInset);
        const chrome = paddingLeft + paddingRight;
        const minWidth = isMobile ? 100 : 120;

        if (!text.trim() && !isFocused) {
            const placeholderWidth = Math.ceil(calculateTextWidth(placeholder));
            const parsedDefault = parseInt(defaultInputWidth, 10) || 0;
            const fitsPlaceholder = placeholderWidth + chrome + 8;
            const target = Math.max(parsedDefault, fitsPlaceholder, minWidth);
            const capped = `${Math.min(target, maxAllowed)}px`;
            if (inputRef.current) {
                inputRef.current.style.width = capped;
            }
            return capped;
        }
        const textWidth = Math.ceil(calculateTextWidth(text));
        const calculatedWidth = textWidth + chrome + 8;
        const newWidth = Math.min(Math.max(minWidth, calculatedWidth), maxAllowed);
        if (inputRef.current) {
            inputRef.current.style.width = `${newWidth}px`;
        }
        return `${newWidth}px`;
    }, [calculateTextWidth, isFocused, defaultInputWidth, isMobile, viewportWidth, paddingLeft, paddingRight, placeholder]);

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
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        boxSizing: 'border-box',
        fontWeight: inputValue ? 500 : 300,
        maxWidth: '100%',
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
            e.target.style.width = defaultInputWidth;
        }
        onBlur(e.target.value);
    };

    return (
        <div style={{
            position: 'relative',
            display: 'inline-block',
            maxWidth: '100%',
            minWidth: 0,
        }}>
        <span
            aria-hidden="true"
            style={{
                position: 'absolute',
                left: isMobile ? '16px' : '24px',
                top: '52%',
                transform: 'translateY(-50%)',
                fontSize: `${emojiSize}px`
            }}
        >
            {currentEmoji}
        </span>
        <input
            ref={inputRef}
            className="conceptInput"
            type="text"
            aria-label={`Concept ${id}`}
            value={inputValue}
            onChange={handleChange}
            placeholder={isFocused && inputValue === '' ? '' : placeholder}
            onFocus={(e) => {
                setIsFocused(true);
                if (inputValue === '') {
                    e.target.placeholder = '';
                    e.target.style.width = focusWidth;
                }
            }}
            onBlur={handleBlur}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={inputStyle}
        />
        <button
            type="button"
            aria-label="Remove concept"
            onClick={() => onDelete(id)}
            style={{
                position: 'absolute',
                right: isMobile ? '12px' : '16px',
                top: '52%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
            }}
        >
            <img src={RemoveIcon} alt="" aria-hidden="true" style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px' }} />
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