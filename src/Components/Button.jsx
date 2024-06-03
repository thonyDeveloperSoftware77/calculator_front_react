import React from 'react';

const Button = ({ value, onClick }) => {
    return (
        <button className={`button 
        ${value === '0' ? 'zero' : ''} 
        ${value === "=" ? 'button-equals' : ""}
        ${value === "AC" || value === "/" || value === "x" ? 'button-text' : ""}
        ${value === "+" || value === "-" || value === "=" || value === "Del"  ? 'button-background' : ""}`}

            onClick={() => onClick(value)}>
            {value}
        </button>
    );
};

export default Button;
