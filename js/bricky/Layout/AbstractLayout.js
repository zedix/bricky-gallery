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
 * @module   bricky/AbstractLayout
 * @requires jquery
 * @requires bricky/Bricky
 */
define('bricky/Layout/AbstractLayout', [
    'jquery',
    'bricky/Bricky'
], function ($, Bricky) {
    'use strict';

    /**
     * Abstract base class for gallery layouts.
     *
     * @class Bricky.Layout.AbstractLayout
     * @param {Element} [element] - Element container
     * @param {Object} options - Layout options
     * @abstract
     */
    var AbstractLayout = function (element, options) {
        this.element = element;
        this.options = options;
        this.index = 0;
        this.limit = 0;
    };

    AbstractLayout.prototype = /** @lends Bricky.Layout.AbstractLayout */{

        /**
         * Render the given list of `Bricky.PhotoItem` objects.
         * Abstract method to be implemented by derivated classes.
         *
         * @param {Array<Bricky.PhotoItem>} items
         */
        render: function (items) {
            throw new Error('Abstract method not implemented');
        },

        /**
         * Build `Bricky.PhotoItem` DOM elements.
         *
         * @param {Bricky.PhotoItem}
         * @private
         */
        _renderItem: function (item) {
            $('<div>', {
                'class': this.options.classNames.galleryItem + ' invisible',
                css: {
                    width: item.thumbWidth,
                    height: item.thumbHeight
                }
            }).append(
                $('<img>')
                    .data('id', item.id)
                    .on('load', this._onImageLoaded.bind(this))
                    //.on('onloadstart', this.showProgressBar.bind(this))
                    //.on('onprogress', this.updateProgressBar.bind(this))
                    //.on('onloadend', this.hideProgresBar.bind(this))
                    .attr({
                        src: item.thumbUrl,
                        width: item.thumbWidth,
                        height: item.thumbHeight
                    })
            ).appendTo(this.element);
        },

        /**
         * Trigger image animation on image load event.
         *
         * @param {Event} e - Browser event
         * @private
         */
        _onImageLoaded: function (e) {
            var itemEl = $(e.target).parent(),
                invisibleClass = 'invisible',
                animationTimeout = Number.random(0, 600);

            if (this.options.animation) {
                setTimeout(function () {
                    itemEl.addClass(this.options.animation).removeClass(invisibleClass);
                }.bind(this), animationTimeout);
            } else {
                itemEl.removeClass(invisibleClass);
            }
        },

        /**
         * Number of pixels between each gallery item.
         * This is useful when calculating linear partition of items.
         *
         * @type {Number}
         */
        get itemMargin() {
            if (this._itemMargin === undefined) {
                var $dummyEl = $('<div>', {
                    'class': this.options.classNames.galleryItem + ' invisible'
                }).appendTo(this.element);

                this._itemMargin = ['border-left-width', 'border-right-width', 'margin-left', 'margin-right'].reduce(function (size, property) {
                    return size += parseInt($dummyEl.css(property), 10); // computed style
                }, 0);
                $dummyEl.remove();
            }
            return this._itemMargin;
        }
    };

    if (!Bricky.Layout) {
        Bricky.Layout = {};    
    }

    return AbstractLayout;
});