'use strict';

/************************
 * IMPORTS
 ***********************/
import $ from 'jquery';


/************************
 * GLOBAL VARIABLES
 ***********************/
let $currentScreenWidth = 0;
let $currentScreenHeight = 0;
let $currentScrollPosition = 0;


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

// Resetting the nav-indicator's display
function resetNavIndicator() {
    if ($('.nav-item.active').length > 0) {
        const $navItemActive = $('.nav-item.active').find('.nav-item-name');
        const $activePosition = $navItemActive.position();
        const $activeWidth = $navItemActive.outerWidth();
        const $activeHeight = $navItemActive.outerHeight();

        $('.nav-indicator').css({
            left: $activePosition.left + 'px',
            top: $activePosition.top + 'px',
            width: $activeWidth + 'px',
            height: $activeHeight + 'px',
        });

        $('.nav-item-name').removeClass('is-indicate');
        $navItemActive.addClass('is-indicate');
    } else {
        const $navIndicatorWidth = $('.nav-indicator').outerWidth();
        $('.nav-indicator').css('left', - $navIndicatorWidth + '%');
    }
}

// Opening/closing submenus in nav menu + moving navigation's indicator
function manageMenuNavigationSystem() {
    if ($currentScreenWidth > 896) {
        // Desktop & horizontal tablet formats
        $('.nav-item-name').on('mouseenter focus', function () {
            $('.nav-submenu').removeClass('is-open').attr('aria-expanded', 'false');
            $(this).siblings('.nav-submenu').addClass('is-open').attr('aria-expanded', 'true');
        });
        $('.nav-item-name').on('mouseenter', function () {
            const $itemPosition = $(this).position();
            const $itemWidth = $(this).outerWidth();
            const $itemHeight = $(this).outerHeight();

            $('.nav-indicator').css({
                left: $itemPosition.left + 'px',
                top: $itemPosition.top + 'px',
                width: $itemWidth + 'px',
                height: $itemHeight + 'px',
            });

            $(".nav-item-name").removeClass('is-indicate');
            $(this).addClass('is-indicate');
        })
        $('.nav-submenu a').on('focus', function () {
            $('.nav-submenu').removeClass('is-open').attr('aria-expanded', 'false');
            $(this).closest('.nav-submenu').addClass('is-open').attr('aria-expanded', 'true');
        });
        $('.inner-header').on('mouseleave', function () {
            $('.nav-submenu').removeClass('is-open').attr('aria-expanded', 'false');
            resetNavIndicator();
        });
        $('.logo, .user-actions').on('mouseenter focus', function () {
            $('.nav-submenu').removeClass('is-open').attr('aria-expanded', 'false');
            resetNavIndicator();
        });
    } else {
        // Mobile & vertical tablet formats
        $('.nav-item .nav-item-name').on('click', function(e) {
            if ($(this).siblings('.nav-submenu').length > 0) {
                e.preventDefault();
                $(this).siblings('.nav-submenu').addClass('is-open').attr('aria-expanded', 'true');
            }
        });
        $('.close-submenu').on('click', function() {
            $(this).parent('.nav-submenu').removeClass('is-open').attr('aria-expanded', 'false');
        });
    }
}


/************************
 * PAGE COMPORTMENT
 ***********************/
const app = {

    // Initialises functionalities during page's loading
    init: function () {
        // Storing the current object
        const self = this;

        $currentScreenWidth = getViewport().width;
        $currentScreenHeight = getViewport().height;
        $currentScrollPosition = $(window).scrollTop();

        resetNavIndicator();

        self.bindUI();
    },


    // Applies changes during page's resizing
    onResize : function () {
        console.log('Largeur actuelle de l\'écran : ' + $currentScreenWidth);
        console.log('Hauteur actuelle de l\'écran : ' + $currentScreenHeight);
        resetNavIndicator();
        manageMenuNavigationSystem();
    },


    // Applies changes during page's scrolling
    onScroll: function () {
        console.log('Position actuelle par rapport au haut de la page: ' + $currentScrollPosition);
    },


    // Applies UI changes in DOM
    bindUI: function () {
        // Storing the current object
        const self = this;

        // Change the global variables' values when the window is resized
        $(window).on('resize', function () {
            $currentScreenWidth = getViewport().width;
            $currentScreenHeight = getViewport().height;
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
            $currentScrollPosition = $(window).scrollTop();
            self.onScroll();
        });


        // Open/close mobile menu
        $('.open-mobile-menu').on('click', function () {
            $('.nav-menu').addClass('is-open').attr('aria-expanded', 'true');
            $(this).addClass('as--hidden');
            $('.close-mobile-menu').removeClass('as--hidden');
        });
        $('.close-mobile-menu').on('click', function () {
            $('.nav-menu').removeClass('is-open').attr('aria-expanded', 'false');
            $(this).addClass('as--hidden');
            $('.open-mobile-menu').removeClass('as--hidden');
        });

        // Open/close searchbar
        $('.open-searchbar').on('click', function () {
            $('.searchbar').addClass('is-open').attr('aria-expanded', 'true');
            $(this).addClass('as--hidden');
            $('.close-searchbar').removeClass('as--hidden');
        });
        $('.close-searchbar').on('click', function () {
            $('.searchbar').removeClass('is-open').attr('aria-expanded', 'false');
            $(this).addClass('as--hidden');
            $('.open-searchbar').removeClass('as--hidden');
        });
    }
};

app.init();