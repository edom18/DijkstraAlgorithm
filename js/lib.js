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
     * Represent appearance of shapes
     */
    class Appearance {
        constructor() {
            this._color       = 'black';
            this._strokeColor = 'black';

            this._hoverColor       = 'blue';
            this._hoverStrokeColor = 'blue';

            this._selectedColor = 'orange';
            this._selectedStrokeColor = 'red';
        }

        set selectedColor(value) {
            this._selectedColor = value;
        }
        get selectedColor() {
            return this._selectedColor;
        }

        set selectedStrokeColor(value) {
            this._selectedStrokeColor = value;
        }
        get selectedStrokeColor() {
            return this._selectedStrokeColor;
        }

        set color(value) {
            this._color = value;
        }
        get color() {
            return this._color;
        }

        set hoverColor(value) {
            this._hoverColor = value;
        }
        get hoverColor() {
            return this._hoverColor;
        }

        set strokeColor(value) {
            this._strokeColor = value;
        }
        get strokeColor() {
            return this._strokeColor;
        }

        set hoverStrokeColor(value) {
            this._hoverStrokeColor = value;
        }
        get hoverStrokeColor() {
            return this._hoverStrokeColor;
        }
    }

    //////////////////////////////////////////////////

    /**
     * Decorator base class
     *
     * @param {Shape} shape target shape
     */
    class Decorator {
        constructor(shape) {
            this._shape = shape;
        }
        decorate(context) { }
    }

    /**
     * Normal style decorator
     */
    class NormalDecorator extends Decorator {
        decorate(context) {
            context.fillStyle   = this._shape.appearance.color;
            context.strokeStyle = this._shape.appearance.strokeColor;
        }
    }

    /**
     * Hovering style decorator
     */
    class HoverDecorator extends Decorator {
        decorate(context) {
            context.fillStyle   = this._shape.appearance.hoverColor;
            context.strokeStyle = this._shape.appearance.hoverStrokeColor;
        }
    }

    /**
     * Selected style decorator
     */
    class SelectedDecorator extends Decorator {
        decorate(context) {
            context.fillStyle   = this._shape.appearance.selectedColor;
            context.strokeStyle = this._shape.appearance.selectedStrokeColor;
        }
    }

    //////////////////////////////////////////////////

    /**
     * Presentation for a shape
     * This class provide animation's presentation.
     */
    class PresentationShape {
        constructor(shape) {
            this._shape = shape;
            this._properties = {};
        }

        get(key, position) {
            if (this._properties[key]) {
                var easing = this._properties[key][PresentationShape.type.EASING_FUNC];
                var from   = this._properties[key][PresentationShape.type.FROM_VALUE];
                var to     = this._properties[key][PresentationShape.type.TO_VALUE];
                return easing(position, from, to);
            }

            return null;
        }

        set(key, fromValue, toValue, easingFunc) {
            if (!this._properties[key]) {
                this._properties[key] = [];
            }
            this._properties[key][PresentationShape.type.FROM_VALUE ] = fromValue;
            this._properties[key][PresentationShape.type.TO_VALUE   ] = toValue;
            this._properties[key][PresentationShape.type.EASING_FUNC] = easingFunc;
        }
    }
    PresentationShape.type = {
        FROM_VALUE : 0,
        TO_VALUE   : 1,
        EASING_FUNC: 2,
    };

    /**
     * Shape base class.
     */
    class Shape {
        constructor(appearance) {
            this.isHovering    = false;
            this.isSelected    = false;
            this.isAnimating   = false;

            this.animationTime = 0;
            this.duration      = 300;

            this.presentationShape = null;

            this._dispatcher = new Dispatcher();

            this.appearance = appearance || new Appearance();

            this.normalDecorator   = new NormalDecorator(this);
            this.hoverDecorator    = new HoverDecorator(this);
            this.selectedDecorator = new SelectedDecorator(this);

            this.zIndex = 0;
        }

        addListener(listener) {
            this._dispatcher.addListener(listener);
        }

        removeListener(listener) {
            this._dispatcher.removeListener(listener);
        }

        decorate(context) {
            if (this.isHovering) {
                this.hoverDecorator.decorate(context);
            }
            else if (this.isSelected){
                this.selectedDecorator.decorate(context);
            }
            else {
                this.normalDecorator.decorate(context);
            }
        }

        /**
         * Perform animation
         *
         * Main task is calcurate animation progress and to check ended.
         */
        _doAnimate() {
            this.animationTime += Timer.deltaTime;
            this._animationProgress = this.animationTime / this.duration;

            if (this._animationProgress > 1.0) {
                this._animationProgress = 1.0;
                this._endAnimate();
            }
        }

        /**
         * Start animation
         */
        startAnimation() {
            this.isAnimating = true;
            this.duration = Shape.animationDuration;
        }

        /**
         * End animation
         */
        _endAnimate() {
            this.isAnimating        = false;
            this.animationTime      = 0;
            this._animationProgress = 0;
            this.presentationShape  = null;
        }

        /**
         * Drawing to the canvas
         */
        draw(context) {
            if (this.isAnimating) {
                this._doAnimate();
            }
        }

        /**
         * Hit test by mouse
         * This is virtual method.
         * This method return always false.
         */
        hitTest(x, y) {
            return false;
        }

        /**
         * Turn on hovering flag.
         */
        hover() {
            this.isHovering = true;
        }

        /**
         * Turn off hovering flag.
         */
        unhover() {
            this.isHovering = false;
        }

        /**
         * Raize a click event
         */
        click() {
            this._dispatcher.dispatch('click', this);
        }


        /**
         * Static method
         *
         * This method provide animation start point.
         * When setting up any parameter in the shape, will animate the shape by duration.
         */
        static animationWithDuration(duration, capture) {
            this.animationDuration = duration;
            this.isAnimationCapturing = true;
            capture();
            this.isAnimationCapturing = false;
        }
    }
    Shape.isAnimationCapturing = false;
    Shape.animationDuration = 0;


    /**
     * A represent dot.
     */
    class Dot extends Shape {
        constructor(point, radius, appearnce) {
            super(appearnce);

            this._point  = point;
            this._radius = radius || 5;
        }

        set point(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('point', this._point, value, pointEasing);
            }

            this._point = value;
        }
        get point() {
            if (this.isAnimating) {
                var point = this.presentationShape.get('point', this._animationProgress);
                if (point !== null) {
                    return point;
                }
            }

            return this._point;
        }

        set radius(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('radius', this._radius, value, floatEasing);
            }

            this._radius = value;
        }
        get radius() {
            if (this.isAnimating) {
                var radius = this.presentationShape.get('radius', this._animationProgress);
                if (radius !== null) {
                    return radius;
                }
            }

            return this._radius;
        }

        draw(context) {
            super.draw(context);

            context.save();
            context.beginPath();
            context.translate(this.point.x, this.point.y);
            this.decorate(context);

            context.arc(0, 0, this.radius, Math.PI * 2, false);
            context.closePath();

            context.fill();
            context.stroke();

            context.restore();
        }

        hitTest(x, y) {
            super.hitTest(x, y);

            var _x = x - this.point.x;
            var _y = y - this.point.y;

            var length = Math.sqrt((_x * _x) + (_y * _y));
            return length < this.radius;
        }
    }

    /**
     * A represent edge.
     */
    class Line extends Shape {
        constructor(start, end, appearnce) {
            super(appearnce);

            this._start = start;
            this._end   = end;
            this.update();

            this.detectDistance = 20;
        } 

        update() {
            this.d = this._end.clone().sub(this._start);
            this.a = this.d.x * this.d.x + this.d.y * this.d.y;
        }

        set start(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('start', this._start, value, pointEasing);
            }

            this._start = value;
            this.update();
        }
        get start() {
            if (this.isAnimating) {
                var start = this.presentationShape.get('start', this._animationProgress);
                if (start !== null) {
                    return start;
                }
            }

            return this._start;
        }

        set end(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('end', this._end, value, pointEasing);
            }

            this._end = value;
            this.update();
        }
        get end() {
            if (this.isAnimating) {
                var end = this.presentationShape.get('end', this._animationProgress);
                if (end !== null) {
                    return end;
                }
            }

            return this._end;
        }

        draw(context) {
            super.draw(context);
            
            context.save();
            context.beginPath();
            this.decorate(context);
            context.moveTo(this.start.x, this.start.y);
            context.lineTo(this.end.x, this.end.y);
            context.closePath();

            context.fill();
            context.stroke();

            context.restore();
        }

        /**
         * Check if the mouse is riding the line
         */
        checkShotenPoint(px, py) {
            if (this.a === 0) {
                var _x = this.start.x - px;
                var _y = this.start.y - py;
                return Math.sqrt(_x * _x + _y * _y);
            }

            var b = this.d.x * (this.start.x - px) + this.d.y * (this.start.y - py);
            var t = -(b / this.a);

            if (t < 0.0) {
                t = 0.0;
            }
            if (t > 1.0) {
                t = 1.0;
            }

            var x = t * this.d.x + this.start.x;
            var y = t * this.d.y + this.start.y;

            var rx = x - px;
            var ry = y - py;

            return Math.sqrt(rx * rx + ry * ry);
        }

        hitTest(x, y) {
            var distance  = this.checkShotenPoint(x, y);
            return distance < this.detectDistance;
        }
    }

    class Text extends Shape {
        constructor(point, text, appearnce) {
            super(appearnce);

            this.text = text;
            this._point = point;
        }

        draw(context) {
            super.draw(context);

            context.save();
            var point = this.isAnimating ? this.presentation : this._point;
            context.translate(point.x, point.y);
            this.decorate(context);
            context.fillText(this.text, 0, 0);
            context.restore();
        }

        set text(value) {
            this._text = value;
        }
        get text() {
            return this._text;
        }

        hitTest(x, y) {
            return false;
        }
    }

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

        hover(x, y) {
            this.shapes.forEach((shape, i) => {
                shape.unhover();
            });

            this.each((shape, i) => {
                if (shape.hitTest(x, y)) {
                    shape.hover();
                    return true;
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
    namespace.Shape      = Shape;
    namespace.Dot        = Dot;
    namespace.Line       = Line;
    namespace.Text       = Text;
    namespace.Scene      = Scene;
    namespace.Renderer   = Renderer;
    namespace.ListenerIntercepter = ListenerIntercepter;

}(window));
