import React, { useEffect, useState } from 'react';
import Display from './Display';
import Button from './Button';

const Calculator = () => {
    const [displayValue, setDisplayValue] = useState('0');
    const [operator, setOperator] = useState(null);
    const [firstValue, setFirstValue] = useState(null);
    const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);
    const [operationSequence, setOperationSequence] = useState('');
    const [responseTime, setResponseTime] = useState(null);

    const handleButtonClick = (value) => {
        if (value === 'AC') {
            setDisplayValue('0');
            setOperator(null);
            setFirstValue(null);
            setWaitingForSecondValue(false);
            setOperationSequence('');
            return;
        }

        if (value === 'Del' && operationSequence === '') {
            // No hacer nada si se intenta eliminar el resultado
            return;
        }

        if (value === 'Del') {
            // Si hay una secuencia de operaciones, eliminar el último carácter
            const newOperationSequence = operationSequence.slice(0, -1);
            setOperationSequence(newOperationSequence);

            // Actualizar displayValue para reflejar la nueva secuencia de operaciones
            const lastOperatorIndex = Math.max(
                newOperationSequence.lastIndexOf('+'),
                newOperationSequence.lastIndexOf('-'),
                newOperationSequence.lastIndexOf('x'),
                newOperationSequence.lastIndexOf('/')
            );
            const newDisplayValue = newOperationSequence.slice(lastOperatorIndex + 1);
            setDisplayValue(newDisplayValue === '' ? '0' : newDisplayValue);

            // Actualizar firstValue para reflejar la nueva secuencia de operaciones
            const newFirstValue = newOperationSequence.slice(0, lastOperatorIndex);
            setFirstValue(newFirstValue === '' ? null : parseFloat(newFirstValue));
            return;
        }

        // Añadir el valor a la secuencia de operaciones
        setOperationSequence(operationSequence + value);

        if (['+', '-', 'x', '/'].includes(value)) {
            if (firstValue === null) {
                setFirstValue(parseFloat(displayValue));
            } else if (operator) {
                performOperation(firstValue, parseFloat(displayValue), operator)
                    .then(result => {
                        setFirstValue(result);
                        setDisplayValue(String(result));
                    })
                    .catch(error => {
                        console.error(`An error occurred: ${error.message}`);
                    });
            }
            setWaitingForSecondValue(true);
            setOperator(value);
            return;
        }

        if (value === '=') {
            if (operator && firstValue !== null) {
                performOperation(firstValue, parseFloat(displayValue), operator)
                    .then(result => {
                        setFirstValue(null);
                        setDisplayValue(String(result));
                        setOperator(null);
                        setOperationSequence('');
                    })
                    .catch(error => {
                        console.error(`An error occurred: ${error.message}`);
                    });
            }
            return;
        }


        if (value === '=') {
            if (operator && firstValue !== null) {
                const result = performOperation(firstValue, parseFloat(displayValue), operator);
                setFirstValue(null);
                setDisplayValue(String(result));
                setOperator(null);
                setOperationSequence('');
            }
            return;
        }

        if (!isNaN(value) || value === '.') { // Si es un número o un punto decimal
            if (waitingForSecondValue) {
                setDisplayValue(value);
                setWaitingForSecondValue(false);
            } else {
                // Asegurarse de que solo hay un punto decimal en displayValue
                if (value === '.' && displayValue.includes('.')) {
                    return;
                }
                setDisplayValue(displayValue === '0' && value !== '.' ? value : displayValue + value);
            }
        }

    };


    const performOperation = async (first, second, operator) => {
        let url = '';
        switch (operator) {
            case '+':
                url = 'http://localhost:2004/math/add';
                break;
            case '-':
                url = 'http://localhost:2004/math/subtract';
                break;
            case 'x':
                url = 'http://localhost:2004/math/multiply';
                break;
            case '/':
                url = 'http://localhost:2004/math/divide';
                break;
            default:
                return second;
        }

        try {
            const startTime = performance.now();
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    num1: first,
                    num2: second,
                }),
            });

            const endTime = performance.now();
            const responseTime = endTime - startTime;
            setResponseTime(responseTime);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            const resulNumber = Number(result);
            return resulNumber;
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
            return second;
        }
    };

//
    //useEffect(() => {
    //    const makeRequest = async (num1, num2, operator) => {
    //      const response = await fetch(`http://localhost:2004/math/${operator}`, {
    //        method: 'POST',
    //        headers: {
    //          'Content-Type': 'application/json',
    //        },
    //        body: JSON.stringify({
    //          num1,
    //          num2,
    //        }),
    //      });
    //
    //      if (!response.ok) {
    //        throw new Error(`HTTP error! status: ${response.status}`);
    //      }
    //
    //      const result = await response.text();
    //      return Number(result);
    //    };
    //
    //    const makeMultipleRequests = async (operator) => {
    //      const promises = [];
    //      for (let i = 0; i < 120; i++) {
    //        const num1 = Math.floor(Math.random() * 100);
    //        const num2 = Math.floor(Math.random() * 100);
    //        promises.push(makeRequest(num1, num2, operator));
    //      }
    //      const results = await Promise.all(promises);
    //      console.log(`Se realizaron ${results.length} solicitudes a ${operator} simultáneamente.`);
    //    };
    //
    //    makeMultipleRequests('add');
    //    makeMultipleRequests('subtract');
    //  }, []);
    return (
        <>
            <div className="calculator">
                <div className="operation-sequence">
                    {operationSequence}
                </div>
                <Display value={displayValue} />

                <div className="buttons">
                    <Button value="AC" onClick={handleButtonClick} className="button-ac" />
                    <Button value="/" onClick={handleButtonClick} className="button-operator" />
                    <Button value="x" onClick={handleButtonClick} className="button-operator" />
                    <Button value="Del" onClick={handleButtonClick} className="button-delete" />
                    <Button value="7" onClick={handleButtonClick} />
                    <Button value="8" onClick={handleButtonClick} />
                    <Button value="9" onClick={handleButtonClick} />
                    <Button value="-" onClick={handleButtonClick} className="button-operator" />
                    <Button value="4" onClick={handleButtonClick} />
                    <Button value="5" onClick={handleButtonClick} />
                    <Button value="6" onClick={handleButtonClick} />
                    <Button value="+" onClick={handleButtonClick} className="button-operator" />
                    <Button value="1" onClick={handleButtonClick} />
                    <Button value="2" onClick={handleButtonClick} />
                    <Button value="3" onClick={handleButtonClick} />
                    <Button value="=" onClick={handleButtonClick} className="button-operator button-equals" />
                    <Button value="0" onClick={handleButtonClick} className="button-zero" />
                    <Button value="." onClick={handleButtonClick} />
                </div>
            </div>
            <div className="response-time">
                Tiempo de respuesta: {responseTime} ms
            </div>

        </>
    );
};

export default Calculator;
