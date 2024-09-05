'use strict';

import $ from 'jquery';


/************************
 * GLOBAL VARIABLES
 ***********************/
let currentScreenWidth = 0;
let currentScreenHeight = 0;
let currentScrollPosition = 0;


/************************
 * GLOBAL FUNCTIONS
 ***********************/
// Getting viewport size, without scrollbar
function getViewport() {
    let e = window, a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {
        width: e[ a + 'Width' ],
        height: e[ a + 'Height' ]
    };
}


/************************
 * PAGE COMPORTMENT
 ***********************/
const app = {

    // Initialises functionalities during page's loading
    init: function () {
        // Storing the current object
        const self = this;

        currentScreenWidth = getViewport().width;
        currentScreenHeight = getViewport().height;
        currentScrollPosition = $(window).scrollTop();

        self.bindUI();
    },


    // Applies changes during page's resizing
    onResize : function () {
        console.log('Largeur actuelle de l\'écran : ' + currentScreenWidth);
        console.log('Hauteur actuelle de l\'écran : ' + currentScreenHeight);
    },


    // Applies changes during page's scrolling
    onScroll: function () {
        console.log('Position actuelle par rapport au haut de la page: ' + currentScrollPosition);
    },


    // Applies UI changes in DOM
    bindUI: function () {
        // Storing the current object
        const self = this;

        // Change the global variables' values when the window is resized
        $(window).on('resize', function () {
            currentScreenWidth = getViewport().width;
            currentScreenHeight = getViewport().height;
            self.onResize();
        });

        // Call "onResize" event function when the page is totally loaded
        document.onreadystatechange = function () {
            if (document.readyState === 'complete') {
                self.onResize();
            }
        };

        // Change the global variables' values when the window is scrolled
        $(window).on('scroll', function () {
            currentScrollPosition = $(window).scrollTop();
            self.onScroll();
        });
    }

};

app.init();