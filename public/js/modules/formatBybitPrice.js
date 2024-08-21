import { formatNumberWithCommas } from './formatNumberWithCommas.js';

export const formatBybitPrice = (price) => {
    if(!price) {
        return '';
    } else if(price >= 100) {
        return formatNumberWithCommas(price, 2);
    } else if(price >= 1) {
        return formatNumberWithCommas(price, 3);
    } else {
        return formatNumberWithCommas(price, 4);
    }
}
