const phrases = new Map();

export const getPhrase = phraseId => {
    return phrases.has(phraseId) ? phrases.get(phraseId) : phraseId;
};
