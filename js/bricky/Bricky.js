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
 * @module   bricky/Bricky
 * @requires jquery
 */
define('bricky/Bricky', ['jquery'], function ($) {
    'use strict';

    var Bricky = {
        version: '1.0.0'
    };

    /**
     * A Photos Web Gallery component.
     *
     * @example
     * var gallery = new Bricky.Gallery(document.body, {
     *     layout: 'GplusLayout'
     * }).init([
     *     {width: xxx, height: xxx, url: 'xxx', meta: {}},
     *     {width: xxx, height: xxx, url: 'xxx', meta: {}}
     * ]);
     *
     * @class Bricky.Gallery
     * @param {Element} [element] - Gallery container
     * @param {Object} [options] - Gallery options
     * @memberOf module:bricky/Bricky
     */
    Bricky.Gallery = function (element, options) {
        this.element = element;
        this.setOptions(options);
    };

    Bricky.Gallery.prototype = /** @lends Bricky.Gallery */{

        constructor: Bricky.Gallery,

        /**
         * Default gallery options.
         *
         * @property {String} [title] - Gallery title
         * @property {Number} [minWidth=250] - Gallery minimal width
         * @property {Boolean} [ambilight=false] - `true` to use ambilight in photo viewer.
         *
         * @property {String} [layout='BrickyLayout'] - Gallery layout.
         *   Possible values: `BrickyLayout`, `GplusLayout`, `BrickyLayout`, `SimpleLayout`.
         *
         * @property {String} [animation='bounceIn'] - Animation name.
         *   Possible values: `fadeIn` (fast HWA), `flipInX`, `bounceIn`, `moveUp`, `popUp`.
         *
         * @property {String} [theme='bricky'] - CSS theme.
         *   Possible values: `bricky`, `gplus`, `polaroid`, `rounded`.
         *‡
         * @property {String} [lightbox='Lightbox'] - Photo viewer class
         * @property {Object} [classNames] - Internal CSS class names
         * @property {Object} [lazyLoad] - Lazyload options
         * @property {Object} [fullscreen] - Fullscreen options
         * @type {Object}
         */
        options: {
            title: '',
            minWidth: 250,
            ambilight: false,
            layout: 'BrickyLayout',
            animation: 'bounceIn',
            theme: 'polaroid',
            lightbox: 'Lightbox',
            photoUriPath: /\/([0-9]+)$/,
            classNames: {
                gallery: 'gallery',
                galleryRow: 'gallery-row',
                galleryItem: 'gallery-item',
                galleryThumb: 'gallery-thumb'
            },
            lazyLoad: {
                containerSelector: '.gallery',
                itemsPerLoad: 120,
                threshold: 200
            },
            fullscreen: {
                inactiveMouseDelay: 1000
            }
        },

        setOptions: function (options) {
            $.extend(true, this.options, options);
        },

        init: function (images) {
            if (this.built === undefined) {
                this.images = images.map(function (item) {
                    return new Bricky.PhotoItem(item);
                });
                this._build();

                var matches = location.pathname.match(this.options.photoUriPath);
                if (matches) {
                    this.getLightbox().show(this.images[Number(matches[1]) - 1], true);
                }
                this.built = true;
            }

            this.showImages();
            return this;
        },

        showImages: function () {
            this.getLayout().render(this.images);
        },

        getLightbox: function () {
             if (!this.lightbox) {
                this.lightbox = new Bricky[this.options.lightbox](this.images, this.options);
            }
            return this.lightbox;
        },

        getLayout: function () {
            if (!this.layout) {
                this.layout = new Bricky.Layout[this.options.layout](this.element, this.options);
            }
            return this.layout;
        },

        getWidth: function () {
            return $(this.element).width().limit(this.options.minWidth, Infinity);
        },

        onItemClick: function (e) {
            var item = this.getItemById($(e.target).data('id'));
            if (item) {
                this.getLightbox().show(item);
            }
        },

        resize: function () {
            var container = $(this.element), oldWidth, newWidth;

            oldWidth = this.getWidth();
            container.css('width', '');

            newWidth = this.getWidth();
            container.css('width', newWidth);

            if (newWidth !== oldWidth) {
                container.empty();
                this.showImages();
            }
        },

        /**
         * Check if more items need to be loaded based
         * on current window scroll position.
         */
        loadMoreItems: function () {
            if (this.shouldLoadMoreItems()) {
                this.getLayout().render();
            }
        },

        shouldLoadMoreItems: function () {
            var documentHeight = $(document).height(),
                gallery = $(this.options.lazyLoad.containerSelector),
                pixelsFromWindowBottomToBottom = documentHeight - window.scrollY - $(window).height(),
                pixelsFromGalleryToBottom = documentHeight - (gallery.offset().top + gallery.height());

            return pixelsFromWindowBottomToBottom - pixelsFromGalleryToBottom < this.options.lazyLoad.threshold;
        },

        getItemById: function (id) {
            for (var i = 0, l = this.images.length; i < l; i++) {
                if (this.images[i].id === id) {
                    return this.images[i];
                }
            }
            return null;
        },

        /**
         * Window history `popstate` event handler.
         *
         * @param {PopStateEvent} e
         */
        onHistoryPopState: function (e) {
            // Ignore initial (useless) popstate event fired
            // by Chrome/Safari on page load
            if (!window.history.ready) {
                // Just return if we've not yet used history.pushState()
                return;
            }
            if (e.state && Number(e.state.index)) {
                this.getLightbox().show(this.images[e.state.index], true);
            } else if (this.lightbox) {
                this.lightbox.close(true);
            }
        },

        /**
         * Document `fullscreenchange` event handler.
         *
         * @param {Event} e
         */
        onFullScreenChange: function (e) {
            var $body = $(document.body),
                inactiveClassName = 'mouse-inactive',
                enterFullScreen = $(document).isFullScreen();

            if (enterFullScreen) {
                this.inactiveMouse = false;
                this.inactiveMouseTimer = setInterval(function () {
                    if (!this.inactiveMouse) {
                        this.inactiveMouse = true;
                        $body.addClass(inactiveClassName);
                    }
                }.bind(this), this.options.fullscreen.inactiveMouseDelay);

                $body.on('mousemove', function () {
                    if (this.inactiveMouse) {
                        this.inactiveMouse = false;
                        $body.removeClass(inactiveClassName);
                    }
                }.bind(this));
            } else {
                if (this.inactiveMouseTimer) {
                    clearInterval(this.inactiveMouseTimer);
                    delete this.inactiveMouseTimer;
                    delete this.inactiveMouse;
                }
                $body.off('mousemove').removeClass(inactiveClassName);
            }
        },

        _build: function () {
            this.element = $(this.element || $('<div>').appendTo(document.body))
                .addClass(this.options.classNames.gallery + ' ' + (this.options.classNames.gallery + this.options.layout.hyphenate()) + ' ' + (this.options.classNames.gallery + '-' + this.options.animation))
                .css({'width': this.getWidth()});

            $(document.body).addClass(this.options.theme);
            this._attachEvents();
        },

        _attachEvents: function () {
            $(this.element).on('click', '.' + this.options.classNames.galleryItem, this.onItemClick.bind(this));
            $(window).on({
                'resize': this.resize.bind(this).debounce(250),
                'scroll': this.loadMoreItems.bind(this).debounce(250),
                'popstate': this.onHistoryPopState.bind(this)
            });
            $(document).on({
                'mozfullscreenchange': this.onFullScreenChange.bind(this),
                'webkitfullscreenchange': this.onFullScreenChange.bind(this)
            });
            return this;
        }
    };


    Bricky.ImageUtils = {

        /**
         * Calculate equal height thumbnails dimensions to fit inside given width.
         */
        getThumbnailSizesForWidth: function (images, containerWidth, thumbMargin) {
            var containerWidthTemp = 0.0,
                containerHeightTemp = 100.0; // Random initial height

            // Available width for thumbnails
            containerWidth -= (images.length * thumbMargin);

            images.forEach(function (img) {
                img.thumbWidth = img.getThumbnailWidthForHeight(containerHeightTemp);
                containerWidthTemp += img.thumbWidth;
            }, this);

            images.forEach(function (img) {
                img.thumbWidth = img.thumbWidth * (containerWidth / containerWidthTemp);
                img.thumbHeight = img.getThumbnailHeightForWidth(img.thumbWidth);
            }, this);

            return images;
        },

        getThumbnailSizesForHeight: function (images, height) {
            images.forEach(function (img) {
                img.thumbWidth = img.getThumbnailWidthForHeight(height);
                img.thumbHeight = height;
            }, this);
            return images;
        }
    };



    Bricky.PhotoItem = function (item) {
        if (item.shard) {
            // photos.domain.tld => photos-x.domain.tld 
            item.thumbUrl = '//' + window.location.host.replace('.', '-' + item.shard + '.') + item.thumbUrl;
        }
        this.item = item;
    };

    Bricky.PhotoItem.prototype = {

        constructor: Bricky.PhotoItem,

        get id() {
            return this.item.id;
        },

        get aspectRatio() {
            return this.item.width / this.item.height;
        },

        get meta() {
            return this.item.meta;
        },

        get description() {
            return this.item.description;
        },

        get squareUrl() {
            return this.item.thumbUrl.replace('{0}', '200x200');
        },

        get thumbUrl() {
            return this.item.thumbUrl.replace('{0}',
                Math.floor(this.thumbWidth) + 'x' + Math.floor(this.thumbHeight));
        },

        get previewUrl() {
            return this.item.thumbUrl.replace('{0}',
                $(window).width() > 1024 ? '1600x' : '1024x');
        },

        get originalUrl() {
            return this.item.url;
        },

        get allSizesUrl() {
            return this.originalUrl.replace('/photos', '/photos/sizes');
        },

        isLandscape: function () {
            return this.item.width > this.item.height;
        },

        isPanorama: function () {
            return (this.item.width / this.item.height) > 2;
        },

        getOrientationCode: function () {
            return this.isPanorama() ? '=' : this.isLandscape() ? 'L' : 'P';
        },

        /**
         * Calculate thumbnail width for the given height preserving the aspect ratio
         */
        getThumbnailWidthForHeight: function (height) {
            return (this.item.width / this.item.height) * height;
        },

        /**
         * Calculate thumbnail height for the given width preserving the aspect ratio
         */
        getThumbnailHeightForWidth: function (width) {
            return (this.item.height / this.item.width) * width;
        },

        preload: function () {
            if (this.preloader !== null) {
                this.preloader = new Image();
                this.preloader.src = this.previewUrl;
                this.preloader = null; // Release to GC
            }
        }
    };


    if (!Number.random) {
        Number.random = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        };
    }

    if (!Number.prototype.limit) {
        Number.prototype.limit = function (min, max) {
            return Math.min(max, Math.max(min, this));
        };
    }

    if (!Number.prototype.round) {
        Number.prototype.round = function (precision){
            precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
            return Math.round(this * precision) / precision;
        };
    }

    if (!Array.prototype.getLast) {
        Array.prototype.getLast = function () {
            return (this.length) ? this[this.length - 1] : null;
        };
    }

    if (!String.prototype.hyphenate) {
        String.prototype.hyphenate = function () {
            return String(this).replace(/[A-Z]/g, function (match) {
                return ('-' + match.charAt(0).toLowerCase());
            });
        };
    }

    /**
     * Guarantees that a function is only executed a single time, 
     * at the very end of a series of calls.
     */
    if (!Function.prototype.debounce) {
        Function.prototype.debounce = function (delay) {
            var fn = this, timer;
            return function () {
                var that = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(that, args);
                }, delay);
            };
        };
    }

    $.inherits = function(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    };

    $.fn.isFullScreen = function () {
        // Standard methods
        if (document.fullScreenElement && document.fullScreenElement == this[0]) {
            return true;
        }
        // Current working methods
        return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
    };

    $.fn.toggleFullScreen = function (force) {
        var fullscreen = (force === undefined) ? !this.isFullScreen() : force;
        if (fullscreen) {
            var element = this[0];
            if (element.requestFullScreen) {
                element.requestFullScreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    };


    $.fn.bricky = function (images, options) {
        new Bricky.Gallery(this[0], options).init(images);
    };

    return Bricky;
});