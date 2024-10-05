/***************************************
 * THIS FILE ONLY ALLOWS TO CHARGE ALL SVG ICONS FOR CREATE THE SPRITE, DON'T TOUCH HIM !!
 **************************************/

/* eslint-disable no-undef */
function importAll(r) {
    r.keys().forEach(r);
}

importAll(require.context('../img/svg/', true, /\.svg$/));
/* eslint-enable no-undef */