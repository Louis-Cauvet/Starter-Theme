/***************************************
 * THIS FILE ONLY ALLOWS TO CHARGE ALL SVG ICONS FOR CREATE THE SPRITE, DON'T TOUCH HIM !!
 **************************************/

/* eslint-disable no-undef */
function importAll(r) {
    r.keys().forEach((key) => {
        console.log(`Importing: ${key}`); // Vérifier les fichiers importés
        r(key);
    });
}

importAll(require.context('../img/svg/', true, /\.svg$/));
/* eslint-enable no-undef */