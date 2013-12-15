/*!
 * Bricky Photos Gallery
 * Bricky is a Google+ Photos inspired web gallery.
 *
 * Licensed under the MIT license.
 * (c) 2012-2014 Louis-Xavier Vignal
 */

/*global
    define
*/

/**
 * @module   bricky/Lightbox
 * @requires jquery
 * @requires bricky/Bricky
 */
define('bricky/Lightbox', ['jquery', 'bricky/Bricky'], function ($, Bricky) {
    'use strict';

    /**
     * @class Lightbox
     *
     * @param {Array} images
     * @param {Object} options - Options object
     * @memberof module:Bricky/Lightbox
     */
    var Lightbox = function (images, options) {
        this.images = images;
        this.options = options;
    };

    Lightbox.prototype = {

        constructor: Lightbox,

        get currentIndex() {
            return this.images.indexOf(this.item);
        },

        get visible() {
            return this.element && !this.element.get(0).hasAttribute('hidden');
        },

        set visible(value) {
            this.element.attr('hidden', value ? null : 'hidden');
            $(document.body).toggleClass('overlayed', value);
        },

        build: function () {
            var html = [
            '<div class="overlay lightbox" hidden>',
                '<div class="lightbox-inner">',
                    '<div class="btn-close"></div>',
                    '<div class="lightbox-content">',
                        //'<div class="header" fs-hidden><h1></h1></div>',
                        '<ul class="photo-list"></ul>',
                        '<div class="btn-previous" fs-inactive-hidden></div>',
                        '<div class="btn-next" fs-inactive-hidden></div>',
                    '</div>',
                    '<div class="footer" fs-hidden>',
                        '<div class="meta"></div>',
                        '<div class="page"></div>',
                        '<div class="actions">',
                            '<a class="btn-download-original" target="_blank"></a>',
                        '</div>',
                    '</div>',
                    '<div class="description" fs-hidden></div>',
                '</div>',
            '</div>'
            ].join('\n');

            $(window).on('resize', this.resize.bind(this).debounce(250));
            $(window).on('keyup', this.onKeyboard.bind(this));
            this.element = $(html).on('click', this.handleEvent.bind(this)).appendTo(document.body);
        },

        handleEvent: function (e) {
            var target = $(e.target);

            if (target.hasClass('btn-close')) {
                this.close();
            } else if (target.hasClass('btn-previous')) {
                this.previous();
            } else if (target.hasClass('btn-next')) {
                this.next();
            } else if (target.hasClass('btn-fullscreen')) {
                this.fullscreen();
            }
            e.stopPropagation();
        },

        show: function (item, fromHistory) {
            if (!this.element) {
                this.build();
            }
            if (item) {
                this.item = item;

                if (!this.visible) {
                    this.visible = true;
                    this._preloadItem(+1);
                }
                //this.element.find('.photo .blur').css('background', 'url(' + item.url + ')');

                this.img = $('<img>')
                    .data('index', this.currentIndex)
                    .on('load', this.resize.bind(this))
                    .attr('src', this.item.previewUrl);

                this.previousLi = this.li;
                if (this.previousLi) {
                    //this.previousLi.on('transitionend webkitTransitionEnd oTransitionEnd transitionEnd', function (e) {
                    this.previousLi.on('animationend webkitAnimationEnd oAnimationEnd animationEnd', function (e) {
                        $(e.target).remove();
                    }).addClass('fadeOut');
                }

                /*if (this.previousLi && this.previousLi.hasClass('loading')) {
                    this.previousLi.remove();
                    this.previousLi = null;
                }*/

                this.li = $('<li class="photo-list-item loading">')
                    .append($('<div class="picture centered invisible"><div class="btn-fullscreen" fs-hidden></div></div>')
                    .append(this.img)).appendTo(this.element.find('.photo-list')); // .empty()


                this._updateMetadata();
                if (!fromHistory) {
                    this._historyPushState();
                }
                this._updateNextPreviousButtonState();
            }
            return this;
        },

        next: function () {
            this._showItem(+1);
            this._preloadItem(+1);
            this._preloadItem(+2);
        },

        previous: function () {
            this._showItem(-1);
            this._preloadItem(-1);
            this._preloadItem(-2);
        },

        close: function (fromHistory) {
            if (this.element.isFullScreen()) {
                this.element.toggleFullScreen()
            } else {
                this.visible = false;
                if (fromHistory !== true) {
                    this._historyPushState(null);
                }
            }
            if (this.li) {
                this.li.remove();
            }
        },

        fullscreen: function () {
            this.element.toggleFullScreen();
        },

        resize: function () {
            var container = this.element.find('.photo-list'),
                width = container.width(),
                height = container.height(),
                size = {width: Infinity, height: Infinity};

            if (this.item.isLandscape()) {
                size.width = width;
                size.height = this.item.getThumbnailHeightForWidth(width);
            }
            if (size.height > height) {
                size.width = this.item.getThumbnailWidthForHeight(height);
                size.height = height;
            }
            if (size.width > width) {
                size.width = width;
                size.height = this.item.getThumbnailHeightForWidth(width);
            }

            this.li.removeClass('loading').find('.picture').css(size).removeClass('invisible').addClass('fadeIn');
        },

        onKeyboard: function (e) {
            if (!this.visible) {
                return;
            }
            switch (e.keyCode) {
            case 70: // f
            case 13: // Enter
            case 32: // Space
                this.fullscreen();
                break;
            case 27: // Esc
                e.preventDefault();
                this.close();
                break;
            case 37: // Arrow Left
                this.previous();
                break;
            case 39: // Arrow Right
                this.next();
                break;
            default:
                break;
            }
        },

        _historyPushState: function (push) {
            if (!history.pushState || this.element.isFullScreen()) {
                return;
            }
            var stateObj = {index: null},
                pathUrl = location.pathname.replace(this.options.photoUriPath, '');

            if (push !== null) {
                stateObj.index = this.currentIndex;
                pathUrl = pathUrl.replace(/\/$/, '') + '/' + (stateObj.index + 1);
            }
            history.pushState(stateObj, stateObj.index + 1, pathUrl);
            window.history.ready = true;
        },

        _showItem: function (increment) {
            var item = this._getItem(increment);
            this.show(item);
        },

        _getItem: function (increment) {
            var index = this.images.indexOf(this.item);
            //console.log('getItem', index + increment, this.images)
            return this.images[index + increment];
        },

        _preloadItem: function (increment) {
            var item = this._getItem(increment);
            if (item) {
                item.preload();
            }
        },

        _updateMetadata: function () {
            var meta = this.item.meta,
                page = (this.currentIndex + 1) + ' / ' + this.images.length;

            this.element.find('.btn-download-original')
                .attr('href', this.item.allSizesUrl)
                .attr('title', 'Afficher toutes les tailles')
                .data('filesize', meta.fileSize);

            this.element.find('.meta').empty()
                .append($('<time>', {text: meta.dateTime}))
                //.append($('<span>', {text: meta.camera}))
                .append($('<span>', {text: meta.focalLength}))
                .append($('<span>', {text: meta.exposureTime}))
                .append($('<span>', {text: meta.aperture}))
                .append($('<span>', {text: 'ISO ' + meta.iso}));
            this.element.find('.page').text(page);

            var $description = $(this.element.find('.description')).empty();
            if (this.item.description) {
                $description.removeClass('hidden');
                $description.html(this.item.description);
            } else {
                $description.addClass('hidden');
            }
        },

        _updateNextPreviousButtonState: function () {
            var firstItem = this.images[0],
                lastItem = this.images.getLast();

            this.element.find('.btn-next').toggleClass('hidden', this.item === lastItem);
            this.element.find('.btn-previous').toggleClass('hidden', this.item === firstItem);
        }
    };

    Bricky.Lightbox = Lightbox;

    return Lightbox;
});