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
let $lastScrollTop = 0;

const $limitMobileFormat = 896;
const $deltaScrollTop = 200;

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

// Adding a negative tabindex attribute on a element
function addNegativeTabindex($element) {
    $element.attr('tabindex', '-1');
}

// Removing an element's 'tabindex' attribute
function removeTabindex($element) {
    $element.removeAttr('tabindex');
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

// Changing the nav-indicator's target
function changeNavIndicatorTarget($target) {
    const $itemPosition = $target.position();
    const $itemWidth = $target.outerWidth();
    const $itemHeight = $target.outerHeight();

    $('.nav-indicator').css({
        left: $itemPosition.left + 'px',
        top: $itemPosition.top + 'px',
        width: $itemWidth + 'px',
        height: $itemHeight + 'px',
    });

    $('.nav-item-name').removeClass('is-indicate');
    $target.addClass('is-indicate');
}

// Opening/closing submenus in nav menu + moving navigation's indicator
function manageMenuNavigationSystem() {
    if ($currentScreenWidth > $limitMobileFormat) {
        // Desktop & horizontal tablet formats
        $('.nav-item-name').on('mouseenter focus', function () {
            $('.nav-submenu').removeClass('is-open');
            $(this).siblings('.nav-submenu').addClass('is-open');
            changeNavIndicatorTarget($(this));
        });
        $('.nav-submenu *').on('focus', function () {
            const $navItemParent = $(this).closest('.nav-submenu').siblings('.nav-item-name');
            changeNavIndicatorTarget($navItemParent);
        });
        $('.inner-header').on('mouseleave focusout', function () {
            $('.nav-submenu').removeClass('is-open');
            resetNavIndicator();
        });
        removeTabindex($('.nav-item:has(.nav-submenu)>a.nav-item-name'));
    } else {
        // // Mobile & vertical tablet formats
        $('.nav-item .nav-item-name').on('click', function(e) {
            if ($(this).siblings('.nav-submenu').length > 0) {
                e.preventDefault();
                $(this).siblings('.nav-submenu').addClass('is-open');
            }
        });
        $('.close-submenu').on('click', function() {
            $(this).parent('.nav-submenu').removeClass('is-open');
        });
        addNegativeTabindex($('.nav-item:has(.nav-submenu)>a.nav-item-name'));
    }
}

// Managing the mobile header's visibility after scrolling/resizing
function manageMobileHeaderVisibility() {
    const $header = $('.inner-header');

    if ($currentScreenWidth < $limitMobileFormat) {
        if ($currentScrollPosition > $deltaScrollTop && $currentScrollPosition > $lastScrollTop && !$header.find('.nav-menu').hasClass('is-open')) {
            $header.addClass('is-hidden');
        } else {
            $header.removeClass('is-hidden');
        }
    } else {
        $header.removeClass('is-hidden');
    }

    $lastScrollTop = $currentScrollPosition;
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
        manageMobileHeaderVisibility();
    },


    // Applies changes during page's scrolling
    onScroll: function () {
        manageMobileHeaderVisibility();

        $('.editor-img.as--parallax').each(function() {
            const $viewportHeight = $(window).height();
            const $containerImageTop = $(this).offset().top;
            const $containerImageHeight = $(this).outerHeight();

            if ($containerImageTop < $currentScrollPosition + $viewportHeight && $currentScrollPosition < $containerImageTop + $containerImageHeight) {
                const distanceFromViewport = $currentScrollPosition - $containerImageTop;

                $(this).find('img').css({
                    transform: 'translateY(' + (distanceFromViewport * 0.3) + 'px)'
                });
            }
        })
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

        const $focusablesElements = $('a, button, input, textarea, select, details')


        // Open/close mobile menu
        $('.open-mobile-menu').on('click', function () {
            $('.nav-menu').addClass('is-open');
            removeTabindex($('.nav-menu>ul>li>a, .nav-menu>ul>li>button'));
            $(this).addClass('is-hidden');
            $('.close-mobile-menu').removeClass('is-hidden');
        });
        $('.close-mobile-menu').on('click', function () {
            $('.nav-menu').removeClass('is-open');
            addNegativeTabindex($('.nav-menu>ul>li>a, .nav-menu>ul>li>button'));
            $(this).addClass('is-hidden');
            $('.open-mobile-menu').removeClass('is-hidden');
        });


        // Open/close searchbar
        $('.open-searchbar').on('click', function () {
            $('.searchbar').addClass('is-open has--overlay');
            $('.searchbar:before').css('height', '100svh');
            addNegativeTabindex($focusablesElements.not('.searchbar *'));
            removeTabindex($('.searchbar *'));
        });
        $('.close-searchbar').on('click', function () {
            $('.searchbar').removeClass('is-open');
            addNegativeTabindex($('.searchbar *'));
            removeTabindex($focusablesElements.not('.searchbar *'));
            setTimeout(function (){
                $('.searchbar').removeClass('has--overlay');
            }, 500)
        });
    }
};

app.init();
