import { useState, useEffect } from 'react';

function useAutoSave(valueText, delay) {
    const [savedData, setSavedData] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setSavedData(valueText);
        }, delay);

        return () => clearTimeout(handler);
    }, [valueText, delay]);

    return savedData;
}

export default useAutoSave;
