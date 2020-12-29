import format from '../wrm/format';
import { getPhrase } from '../i18n-mock';

export const I18n = {
    getText(phraseId, ...params) {
        const phrase = getPhrase(phraseId);

        return format(phrase, ...params);
    },
};

export { format };
