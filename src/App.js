import React, { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import ConceptInput from './components/ConceptInput.js';
import Operation from './components/Operation.js';
import Solution from './components/Solution.js'
import API from './API.js';
import CC1Logo from './assets/CC1.svg';
import GitLogo from './assets/GitHub.png';
import Gear from './assets/gear.svg';
import useIsMobile from './hooks/useIsMobile.js';

function App() {
  const [operations, setOperations] = useState([
    { id: 1, input: '', operation: '+' },
    { id: 2, input: '', operation: '=' }
  ]);
  const [calcEquation, setCalcEquation] = useState(false);
  const [aiSolution, setAiSolution] = useState('');
  const [solutionEmoji, setSolutionEmoji] = useState('');
  const prevOperationsRef = useRef();
  const tabNextConceptPendingRef = useRef(false);
  const [conceptEmojis, setConceptEmojis] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt4');
  const isMobile = useIsMobile();
  const conceptInitialWidth = isMobile ? '220px' : '316px';

  const handleCharacterChange = useCallback((id, newOperation) => {
    setOperations(prevOps => {
      return prevOps.map(op => {
        if (op.id === id) {
          return { ...op, operation: newOperation };
        }
        if (op.id === prevOps[prevOps.length - 1].id) {
          return { ...op, operation: '=' };
        }
        return op;
      });
    });
  }, []);

  const handleOperationAddition = useCallback(() => {
    setOperations(prev => {
      const newId = Math.max(...prev.map(op => op.id), 0) + 1;
      const mostRecentOperation = prev[prev.length - 1].operation;
      return [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], operation: mostRecentOperation },
        { id: newId + 1, input: '', operation: '=' }
      ];
    });
    
    setConceptEmojis(prev => {
      const newId = Math.max(...Object.keys(prev).map(Number), 0) + 1;
      return { 
        ...prev, 
        [newId + 1]: '🤔' 
      };
    });
  }, []);

  const handleGetConceptEmoji = useCallback(async (id, text) => {
    if (!text.trim()) return;
    try {
      const emoji = await API.getConceptEmoji(text);
      setConceptEmojis(prev => ({ ...prev, [id]: emoji }));
    } catch (error) {
      console.error('Error getting concept emoji:', error);
      setConceptEmojis(prev => ({ ...prev, [id]: '❓' }));
    }
  }, []);

  const handleInputChange = useCallback((id, value) => {
    setOperations(prev => prev.map(op => 
        op.id === id ? { ...op, input: value } : op
    ));
  }, []);

  const handleInputBlur = useCallback((id, value) => {
    const stringValue = String(value);
    if (stringValue.trim()) {
      handleGetConceptEmoji(id, stringValue);
    }
  }, [handleGetConceptEmoji]);

  const handleInputDelete = useCallback((id) => {
    setOperations(prev => {
      const index = prev.findIndex(op => op.id === id);
      if (index === -1) return prev;
      let newOperations = [...prev];
      if (newOperations.length > 2) {
        newOperations.splice(index, 1);
        newOperations = newOperations.map((op, i) => {
          if (i === newOperations.length - 1) {
            return { ...op, id: i + 1, operation: '=' };
          }
          return { ...op, id: i + 1, operation: i === index ? op.operation : prev[i].operation };
        });
      } else {
        newOperations = [{ id: 1, input: '', operation: '+' }];
      }
      return newOperations;
    });

    setConceptEmojis(prev => {
      const { [id]: deletedEmoji, ...rest } = prev;
      const updatedRest = Object.entries(rest).reduce((acc, [key, value], index) => {
        acc[index + 1] = value;
        return acc;
      }, {});
      return updatedRest;
    });
  }, []);

  useEffect(() => {
    const allInputsFilled = operations.every(op => op.input.trim() !== '');
    const inputsChanged = prevOperationsRef.current
      ? JSON.stringify(operations) !== JSON.stringify(prevOperationsRef.current)
      : true;

    if (allInputsFilled) {
      setCalcEquation(true);
      if (inputsChanged) {
        setAiSolution('');
        setSolutionEmoji('');
        setCalcEquation(false);
        setTimeout(() => setCalcEquation(true), 0);
      }
    } else {
      setCalcEquation(false);
      setAiSolution('');
      setSolutionEmoji('');
    }
    prevOperationsRef.current = JSON.parse(JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const settingsContainer = document.querySelector('.SettingsContainer');
      if (settingsOpen && settingsContainer && !settingsContainer.contains(event.target)) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsOpen]);

  useEffect(() => {
    const onMouseDownCapture = (e) => {
      const main = document.querySelector('main.mainContainer');
      const cal = document.querySelector('.calculator');
      if (e.target === main || e.target === cal) {
        if (!document.activeElement?.matches?.('input.conceptInput')) {
          tabNextConceptPendingRef.current = true;
        }
      } else {
        tabNextConceptPendingRef.current = false;
      }
    };

    const onKeyDown = (e) => {
      if (e.key !== 'Tab' || e.shiftKey) return;
      if (document.activeElement?.matches?.('input.conceptInput')) {
        tabNextConceptPendingRef.current = false;
        return;
      }

      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA') {
        tabNextConceptPendingRef.current = false;
        return;
      }
      if (tag === 'A' && el?.hasAttribute?.('href')) {
        tabNextConceptPendingRef.current = false;
        return;
      }

      const allowSteal =
        tag === 'BODY' || tag === 'HTML' || tabNextConceptPendingRef.current;
      if (!allowSteal) return;

      const first = document.querySelector('.calculator input.conceptInput');
      if (!first) return;
      e.preventDefault();
      tabNextConceptPendingRef.current = false;
      first.focus();
    };

    document.addEventListener('mousedown', onMouseDownCapture, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDownCapture, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const getEquationString = () => {
    return operations
      .map((op, index) => {
        if (index === operations.length - 1) {
          return String(op.input);
        }
        return `${String(op.input)} ${op.operation}`;
      })
      .join(' ')
      .trim();
  };

  const handleGetSolution = async () => {
    const equation = getEquationString();
    if (!equation.trim()) {
      console.error('Equation is empty');
      setAiSolution('Error: Equation is empty');
      return;
    }

    try {
      const aiResponse = await API.getSolution(equation, selectedModel);
      console.log(`${equation} = ${aiResponse}`);

      try {
        const emoji = await API.getConceptEmoji(aiResponse);
        setSolutionEmoji(emoji);
      } catch (emojiError) {
        console.error('Error getting solution emoji:', emojiError);
        setSolutionEmoji('');
      }

      setAiSolution(aiResponse);

      try {
        await API.saveEquation(equation, aiResponse);
        console.log('Equation saved');
      } catch (saveError) {
        console.error('Error saving equation:', saveError);
      }

    } catch (error) {
      console.error('Error getting AI solution:', error);
      setAiSolution('Error: Unable to get solution from AI');
      setSolutionEmoji('');
    }
  };

  return (
    <div className="App">
      <div className='Nav'>
        <img src={CC1Logo} alt="CC-1" className='Logo'/>
        "CONCEPT CALCULATOR"
        <div className="NavButtons">
          <div className="SettingsContainer" onClick={() => setSettingsOpen(!settingsOpen)}>
            <img src={Gear} alt="settings" className='Settings'/>
            {settingsOpen && (
              <div className="SettingsDropdown" onClick={(e) => e.stopPropagation()}>
                <div className="SettingsMenuItem" 
                     onClick={(event) => {
                       event.stopPropagation();
                       setSelectedModel('gpt4');
                       setSettingsOpen(false);
                       if (operations.every(op => op.input.trim() !== '')) {
                         handleGetSolution();
                       }
                     }}>
                  <input
                    type="radio" 
                    id="gpt4" 
                    name="model" 
                    checked={selectedModel === 'gpt4'}
                    onChange={() => {}}
                  />
                  <label htmlFor="gpt4">GPT-5.4 mini</label>
                </div>
                <div className="SettingsMenuItem" 
                     onClick={(event) => {
                       event.stopPropagation();
                       setSelectedModel('claude');
                       setSettingsOpen(false);
                       if (operations.every(op => op.input.trim() !== '')) {
                         handleGetSolution();
                       }
                     }}>
                  <input 
                    type="radio" 
                    id="claude" 
                    name="model"
                    checked={selectedModel === 'claude'}
                    onChange={() => {}}
                  />
                  <label htmlFor="claude">Claude Haiku 4.5</label>
                </div>
              </div>
            )}
          </div>
          <a href="https://github.com/MaximillianNYC/CC-1" target="_blank" rel="noopener noreferrer">
            <img src={GitLogo} alt="GitHub" className='Git'/>
          </a>
        </div>
      </div>
      <main className="mainContainer">
        <div className='calculator'>
          {operations.map((op, index) => (
            <React.Fragment key={op.id}>
              <ConceptInput
                key={`input-${op.id}`}
                id={op.id}
                value={op.input}
                onChange={(value) => handleInputChange(op.id, value)}
                onBlur={(value) => handleInputBlur(op.id, value)}
                onDelete={() => handleInputDelete(op.id)}
                currentEmoji={conceptEmojis[op.id] || "🤔"}
                initialWidth={conceptInitialWidth}
              />
              <Operation
                key={`operation-${op.id}`}
                className='operation'
                character={op.operation}
                onCharacterChange={(newOp) => handleCharacterChange(op.id, newOp)}
                addOperation={index === operations.length - 1 ? handleOperationAddition : undefined}
              />
            </React.Fragment>
          ))}
          <Solution
            calcEquation={calcEquation}
            aiSolution={aiSolution}
            solutionEmoji={solutionEmoji}
            getSolution={handleGetSolution}
          />
        </div>
      </main>
      <div className='Footer'>
          MADE BY <a href="https://www.maximillian.nyc" target="_blank" rel="noopener noreferrer">MAXIMILLIAN PIRAS</a>
      </div>
    </div>
  );
}

export default App;