/* eslint-disable no-undef */
function importAll(r) {
    r.keys().forEach(r);
}

importAll(require.context('../img/svg/', true, /\.svg$/));
/* eslint-enable no-undef */