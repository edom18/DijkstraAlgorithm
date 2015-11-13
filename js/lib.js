(function (namespace) {
    'use strict';

    /**
     * Easing function take a float value
     *
     * @param {Number} x progress 0.0 to 1.0
     * @param {Number} a start value
     * @param {Number} b end value
     */
    function floatEasing(x, a, b) {
        var t = 1.0 - x;
        var f = t * t * t;
        return a * f + b * (1.0 - f);
    }

    /**
     * Easing function take a point value
     *
     * @param {Number} x progress 0.0 to 1.0
     * @param {Number} a start value
     * @param {Number} b end value
     */
    function pointEasing(x, p1, p2) {
        var t = 1.0 - x;
        var f = t * t * t;
        var px = p1.x * f + p2.x * (1.0 - f);
        var py = p1.y * f + p2.y * (1.0 - f);
        return new Point(px, py);
    }

    /**
     * Timer class
     *
     * This class provide time as application core.
     */
    class Timer {
        constructor() {
            this.time = Date.now();
            this.deltaTime = 0;
        }

        static getInstance() {
            if (!this._instance) {
                this._instance = new Timer();
            }
            return this._instance;
        }

        static tick() {
            if (!this._instance) {
                this.getInstance();
            }
            var now = Date.now();
            this._instance.deltaTime = now - this.time;
            this._instance.time = now;
        }

        static get time() {
            if (!this._instance) {
                this.getInstance();
            }
            return this._instance.time;
        }

        static get deltaTime() {
            if (!this._instance) {
                this.getInstance();
            }
            return this._instance.deltaTime;
        }
    }

    /**
     * An event dispatcher
     */
    class Dispatcher {
        constructor() {
            this._listeners = {};
        }

        /**
         * Add a listener
         *
         * @param {Listener} listener
         */
        addListener(listener) {
            if (!(listener instanceof Listener)) {
                return;
            }

            var type = listener.type;
            if (!this._listeners[type]) {
                this._listeners[type] = [];
            }

            this._listeners[type].push(listener);
        }

        /**
         * Remove a listener
         *
         * @param {Listener} listener
         */
        removeListener(listener) {
            var type = listener.type;
            var listeners = this._listeners[type];
            if (!listeners) {
                return;
            }

            var index = -1;
            var hasListener = listeners.some((l, i) => {
                if (l === listener) {
                    index = i;
                    return true;
                }
            });

            if (!hasListener) {
                return;
            }

            listeners.splice(index, 1);
        }

        /**
         * Dispatch an event
         *
         * @param {String} type The event type
         * @param {Object} context context object
         * @param {Object} referData
         */
        dispatch(type, context, referData) {
            var listeners = this._listeners[type];
            if (!listeners) {
                return;
            }

            listeners.forEach((listener, i) => {
                listener.fire(context, referData);
            });
        }

        /**
         * Dispose this class
         */
        dispose() {
            this._listeners = null;
        }
    }

    /**
     * Event listener
     *
     * @param {Function} func callback function from an event.
     */
    class Listener {
        constructor(type, func) {
            this._type = type;
            this._func = func;
        }
        fire(context, referData) {
            this._func(context, referData);
        }
        get type() {
            return this._type;
        }
    }

    /**
     * Event listener intercepter
     * Intercept any event
     *
     * @param {Listener} listener
     * @param {Function} intercepter Intercept function
     */
    class ListenerIntercepter extends Listener {
        constructor(listener, intercepter) {
            super();
            this._listener   = listener;
            this._intercepter = intercepter;
        }
        fire(context, referData) {
            this._intercepter(this._listener, context, referData);
        }
        get type() {
            return this._listener.type;
        }
        get containsListener() {
            return this._listener;
        }
    }

    /**
     * @para {Number} x
     * @para {Number} y
     */
    class Point {
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }

        add(point) {
            this.x += point.x;
            this.y += point.y;
            return this;
        }

        sub(point) {
            this.x -= point.x;
            this.y -= point.y;
            return this;
        }

        clone() {
            return new Point(this.x, this.y);
        }
    }

    //////////////////////////////////////////////////

    /**
     * A represent scene for the canvas.
     */
    class Scene {
        constructor() {
            this.shapes = [];
        }

        add(shape) {
            if (!(shape instanceof Shape)) {
                return;
            }
            this.shapes.push(shape);

            this.shapes.sort((a, b) => {
                return a.zIndex > b.zIndex;
            });
        }

        remove(shape) {
            var index = -1;
            var hasShape = this.shapes.some(function (s, i) {
                if (s === shape) {
                    index = i;
                    return true;
                }
            });

            if (!hasShape) {
                return;
            }

            this.shapes.splice(index, 1);
        }

        each(func) {
            for (var i = this.shapes.length - 1; i >= 0; i--) {
                var stop = func(this.shapes[i], i);
                if (stop) {
                    break;
                }
            }
        }

        map(func) {
            var results = [];
            this.each((shape, i) => {
                var result = func(shape, i);
                if (result) {
                    results.push(result);
                }
            });
            return results;
        }

        hover(x, y) {
            var detectHovering = false;
            this.each((shape, i) => {
                if (detectHovering) {
                    shape.unhover();
                    return;
                }

                if (shape.hitTest(x, y)) {
                    shape.hover();
                    detectHovering = true;
                }
                else {
                    shape.unhover();
                }
            });
        }

        click(x, y) {
            this.each((shape, i) => {
                if (shape.hitTest(x, y)) {
                    shape.click();
                    return true;
                }
            });
        }
    }

    /**
     * Canvas 2D renderer
     */
    class Renderer {
        constructor(width, height) {
            this.element = document.createElement('canvas');
            this.context = this.element.getContext('2d');
            this.element.width  = width;
            this.element.height = height;
        }
        render(scene) {
            this.context.clearRect(0, 0, this.element.width, this.element.height);
            scene.shapes.forEach(function (shape, i) {
                shape.draw(this.context);
            }, this);
        }
    }

    // Exports
    namespace.Timer      = Timer;
    namespace.Dispatcher = Dispatcher;
    namespace.Listener   = Listener;
    namespace.Point      = Point;
    namespace.Scene      = Scene;
    namespace.Renderer   = Renderer;
    namespace.ListenerIntercepter = ListenerIntercepter;

    namespace.floatEasing = floatEasing;
    namespace.pointEasing = pointEasing;

}(window));
