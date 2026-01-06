import React from 'react'
import { MenuItems } from './database';

const validateEmail = (email: string) => {
    // A robust, common regex for email validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
};

const validateNumber = (number: string) => {
    return /^\d+$/.test(number) && number.length === 10;
}

const setData = (data: string | boolean | null, setter: Function, alternate: boolean | null = null) => {
    if (data) {
        setter(data);
    } else if (alternate === null) {
        setter('');
    } else {
        setter(alternate)
    }
}

export {validateEmail, validateNumber, setData};