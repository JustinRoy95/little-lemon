import React from 'react'

const validateEmail = (email: string) => {
    // A robust, common regex for email validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
};

const validateNumber = (number: string) => {
    return /^\d+$/.test(number) && number.length === 10;
}

export {validateEmail, validateNumber};