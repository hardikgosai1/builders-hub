
export function isValidL1Name(name: string): boolean {
    if (name.length < 1) return false;
    if (name.length > 100) return false; // Made up number
    return name.split('').every(char => {
        const code = char.charCodeAt(0);
        return code <= 127 && // MaxASCII check
            (char.match(/[a-zA-Z0-9 ]/) !== null); // only letters, numbers, spaces
    });
}

