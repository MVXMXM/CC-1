import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import '../App.css';
import useIsMobile from '../hooks/useIsMobile.js';

const Solution = ({ calcEquation, aiSolution, solutionEmoji, getSolution }) => {
    const [showCalculation, setShowCalculation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const solutionRef = useRef(null);
    const isMobile = useIsMobile();
    const fontSize = isMobile ? 22 : 32;
    const defaultWidth = isMobile ? '120px' : '150px';
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
        return Math.ceil(context.measureText(text).width);
    }, [fontSize]);

    const updateWidth = useCallback((content) => {
        if (content === "???") return isMobile ? '40px' : '50px';
        if (content === "calculate") return isMobile ? '100px' : '130px';
        if (content === "loading") return isMobile ? '120px' : '150px';
        const sideInset = isMobile ? 64 : 112;
        const maxAllowed = Math.max(60, viewportWidth - sideInset);
        const padding = 8;
        const textWidth = calculateTextWidth(content);
        const calculatedWidth = textWidth + padding;
        const newWidth = Math.min(Math.max(calculatedWidth, 30), maxAllowed);
        return `${newWidth}px`;
    }, [calculateTextWidth, isMobile, viewportWidth]);

    useEffect(() => {
        setShowCalculation(false);
        setIsLoading(true);
        if (solutionRef.current) {
            solutionRef.current.style.width = updateWidth("loading");
        }
        const timeoutId = setTimeout(() => {
            const newResult = calcEquation ? "calculate" : "???";
            // Remove the setDisplayedResult call
            // setDisplayedResult(newResult);
            setIsLoading(false);
            if (solutionRef.current) {
                solutionRef.current.style.width = updateWidth(newResult);
            }
        }, 250);
        return () => clearTimeout(timeoutId);
    }, [calcEquation, updateWidth]);

    useEffect(() => {
        if (aiSolution) {
            setShowCalculation(true);
            setIsLoading(false);
            if (solutionRef.current) {
                const display = solutionEmoji ? `${solutionEmoji} ${aiSolution}` : aiSolution;
                solutionRef.current.style.width = updateWidth(display);
            }
        } else {
            setShowCalculation(false);
        }
    }, [aiSolution, solutionEmoji, updateWidth]);

    const runGetSolution = useCallback(() => {
        if (!calcEquation || showCalculation || isLoading) return;
        setIsLoading(true);
        if (solutionRef.current) {
            solutionRef.current.style.width = updateWidth("loading");
        }
        setTimeout(async () => {
            await getSolution();
            setIsLoading(false);
        }, 1000);
    }, [calcEquation, showCalculation, isLoading, getSolution, updateWidth]);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== 'Enter') return;
            if (!calcEquation || showCalculation || isLoading) return;
            const el = e.target;
            if (el?.tagName !== 'INPUT' || !el.classList.contains('conceptInput')) return;
            e.preventDefault();
            runGetSolution();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [calcEquation, showCalculation, isLoading, runGetSolution]);

    const solutionStyle = {
        transition: 'color 0.1s ease, background 0.3s ease, opacity 0.3s ease, transform 0.3s ease, width 0.3s ease',
        color: showCalculation ? '#000000' : (calcEquation ? '#ffffff' : '#959595'),
        background: showCalculation ? '#ffffff' : (calcEquation ? '#F15A22' : '#ffffff'),
        cursor: calcEquation && !showCalculation && !isLoading ? 'pointer' : 'not-allowed',
        fontWeight: showCalculation || calcEquation ? 500 : 300,
        width: solutionRef.current ? solutionRef.current.style.width : defaultWidth,
    };

    const getDisplayContent = () => {
        if (isLoading) {
            return (
                <>
                    <span role="img" aria-label="loading">⏳</span> loading
                </>
            );
        }
        if (showCalculation && aiSolution) {
            return solutionEmoji ? `${solutionEmoji} ${aiSolution}` : aiSolution;
        }
        if (calcEquation) {
            return (
                <>
                    calculate
                </>
            );
        }
        return (
            <>
                ???
            </>
        );
    };

    return (
        <div ref={solutionRef} className="solution" style={solutionStyle} onClick={runGetSolution}>
            {getDisplayContent()}
        </div>
    );
};

Solution.propTypes = {
    calcEquation: PropTypes.bool.isRequired,
    aiSolution: PropTypes.string,
    solutionEmoji: PropTypes.string,
    getSolution: PropTypes.func.isRequired,
};

export default Solution;