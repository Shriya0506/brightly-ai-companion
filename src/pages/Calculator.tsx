import React, { useState } from 'react';
import { Calculator as CalcIcon, MessageCircle } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 bg-gradient-to-r from-gray-400 to-blue-500 text-white">
          <button
            onClick={() => setShowChat(false)}
            className="mb-2 text-white/80 hover:text-white"
          >
            ← Back to Calculator
          </button>
        </div>
        <div className="flex-1">
          <ChatInterface 
            tabType="calculator"
            gradient="from-gray-400 to-blue-500"
            placeholder="Ask me about math problems, conversions, or calculations..."
          />
        </div>
      </div>
    );
  }

  const buttons = [
    ['C', 'CE', '⌫', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-400 to-blue-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalcIcon size={24} />
                <h1 className="text-xl font-bold">Calculator</h1>
              </div>
              <button
                onClick={() => setShowChat(true)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Chat with AI"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>

          {/* Display */}
          <div className="p-6 bg-gray-900 text-white">
            <div className="text-right">
              <div className="text-4xl font-light overflow-hidden">
                {display}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="p-4">
            {buttons.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 mb-2">
                {row.map((btn) => {
                  let buttonClass = "flex-1 h-16 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ";
                  
                  if (btn === '=') {
                    buttonClass += "col-span-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700";
                  } else if (['+', '-', '×', '÷'].includes(btn)) {
                    buttonClass += "bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600";
                  } else if (['C', 'CE', '⌫'].includes(btn)) {
                    buttonClass += "bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600";
                  } else {
                    buttonClass += "bg-gray-100 text-gray-800 hover:bg-gray-200";
                  }

                  if (btn === '0') {
                    return (
                      <button
                        key={btn}
                        className={`${buttonClass} col-span-2`}
                        onClick={() => inputNumber(btn)}
                      >
                        {btn}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={btn}
                      className={buttonClass}
                      onClick={() => {
                        if (btn === 'C') clear();
                        else if (btn === 'CE') clearEntry();
                        else if (btn === '⌫') setDisplay(display.slice(0, -1) || '0');
                        else if (btn === '.') inputDecimal();
                        else if (btn === '=') performCalculation();
                        else if (['+', '-', '×', '÷'].includes(btn)) inputOperation(btn);
                        else inputNumber(btn);
                      }}
                    >
                      {btn}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Quick Conversions */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Quick Conversions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowChat(true)}
                className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Steps → KM
              </button>
              <button
                onClick={() => setShowChat(true)}
                className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                Food → Calories
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;