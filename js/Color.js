(function (namespace) {
    'use strict';

    /**
     * Easing function take a color value
     *
     * @param {Number} x progress 0.0 to 1.0
     * @param {Number} a start value
     * @param {Number} b end value
     */
    function colorEasing(x, c1, c2) {
        var t = 1.0 - x;
        var f = t * t * t;

        var hsb1 = c1.convertToHSB();
        var hsb2 = c2.convertToHSB();

        var h = hsb1.h * f + hsb2.h * (1.0 - f);
        var s = hsb1.s * f + hsb2.s * (1.0 - f);
        var b = hsb1.b * f + hsb2.b * (1.0 - f);

        var tmp = Color.convertHSB2RGB(h, s, b);

        return new Color(tmp.r, tmp.g, tmp.b);
    }

    class Color {
        constructor() {
            if (arguments.length === 1) {
                this.parse(arguments[0]);
            }
            else if (arguments.length === 3) {
                this.r = arguments[0];
                this.g = arguments[1];
                this.b = arguments[2];
            }
        }

        toString() {
            return `rgb(${this.r|0}, ${this.g|0}, ${this.b|0})`;
        }

        parse(num) {
            this.b = (num >>  0) & 0x0000ff;
            this.g = (num >>  8) & 0x0000ff;
            this.r = (num >> 16) & 0x0000ff;
        }

        getHue() {
            return this.constructor.getHue(this.r, this.g, this.b);
        }

        static get red() {
            return new Color(0xff0000);
        }

        static get green() {
            return new Color(0x00ff00);
        }

        static get blue() {
            return new Color(0x0000ff);
        }

        static get black() {
            return new Color(0x000000);
        }

        static get white() {
            return new Color(0xffffff);
        }

        static getHue(r, g, b) {
            var h = 0;

            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);

            if (r >= g && r >= b) {
                h = 60 * ((g - b) / (max - min));
            }
            else if (g >= r && g >= b) {
                h = 60 * ((b - r) / (max - min)) + 120;
            }
            else if (b >= r && b >= g) {
                h = 60 * ((r - g) / (max - min)) + 240;
            }

            if (Number.isNaN(h)) {
                return 0;
            }

            if (h < 0) {
                h += 360;
            }

            return h;
        }

        getSaturation() {
            return this.constructor.getSaturation(this.r, this.g, this.b);
        }

        static getSaturation(r, g, b) {
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);

            if (max === 0) {
                return 0;
            }

            return ((max - min) / max) * 100;
        }

        getBrightness() {
            return this.constructor.getBrightness(this.r, this.g, this.b);
        }

        static getBrightness(r, g, b) {
            var max = Math.max(r, g, b);
            return (max / 255) * 100;
        }

        convertToHSB() {
            return this.constructor.convertRGB2HSB(this.r, this.g, this.b);
        }

        /**
         * RGBからHSVに変換
         *
         * @param {number} r
         * @param {number} g
         * @param {number} b
         *
         * return {Object} h, s, b
         */
        static convertRGB2HSB(r, g, b) {
            var h = this.getHue(r, g, b);
            var s = this.getSaturation(r, g, b);
            var _b = this.getBrightness(r, g, b);

            return {
                h: h,
                s: s,
                b: _b
            };
        }

        static getRange(h, s, b) {
            s = (s / 100) * 255;
            b = (b / 100) * 255;
            
            var max = b;
            var min = max - ((s / 255) * max);
            
            return {
                max: max,
                min: min
            };
        }
    
        /**
         * HSVからRGBに変換
         *
         * @param {number} h
         * @param {number} s
         * @param {number} b
         *
         * return {Object} r, g, b
         */
        static convertHSB2RGB(h, s, b) {
            var r, g, b;
            var range = this.getRange(h, s, b);
            var max = range.max;
            var min = range.min;
            if (h <= 60) {
                r = max;
                g = (h / 60) * (max - min) + min;
                b = min;
            }
            else if (h <= 120) {
                r = ((120 - h) / 60) * (max - min) + min;
                g = max;
                b = min;
            }
            else if (h <= 180) {
                r = min;
                g = max;
                b = ((h - 120) / 60) * (max - min) + min;
            }
            else if (h <= 240) {
                r = min;
                g = ((240 - h) / 60) * (max - min) + min;
                b = max;
            }
            else if (h <= 300) {
                r = ((h - 240) / 60) * (max - min) + min;
                g = min;
                b = max;
            }
            else {
                r = max;
                g = min;
                b = ((360 - h) / 60) * (max - min) + min;
            }
            
            return {
                r: r,
                g: g,
                b: b
            };
        }
    }

    // Exports
    namespace.Color = Color;
    namespace.colorEasing = colorEasing;

}(window));
