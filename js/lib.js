(function (namespace) {
    'use strict';

    function easing(x, a, b) {
        var t = 1.0 - x;
        var f = t * t * t;
        return a * f + b * (1.0 - f);
    }

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
        dispatch(type, context, referData) {
            var listeners = this._listeners[type];
            if (!listeners) {
                return;
            }

            listeners.forEach((listener, i) => {
                listener.fire(context, referData);
            });
        }
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
        }

        sub(point) {
            this.x -= point.x;
            this.y -= point.y;
        }
    }

    //////////////////////////////////////////////////

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

    class Decorator {
        constructor(shape) {
            this._shape = shape;
        }
        decorate(context) {
            //
        }
    }

    class NormalDecorator extends Decorator {
        decorate(context) {
            context.fillStyle   = this._shape.appearance.color;
            context.strokeStyle = this._shape.appearance.strokeColor;
        }
    }

    class HoverDecorator extends Decorator {
        decorate(context) {
            context.fillStyle   = this._shape.appearance.hoverColor;
            context.strokeStyle = this._shape.appearance.hoverStrokeColor;
        }
    }

    class SelectedDecorator extends Decorator {
        decorate(context) {
            context.fillStyle   = this._shape.appearance.selectedColor;
            context.strokeStyle = this._shape.appearance.selectedStrokeColor;
        }
    }

    //////////////////////////////////////////////////

    /**
     * Shape base class.
     */
    class Shape {
        constructor(appearance) {
            this.isHovering = false;
            this.isSelected = false;
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

        draw(context) {
            //
        }

        hitTest(x, y) {
            return false;
        }

        hover() {
            this.isHovering = true;
        }

        unhover() {
            this.isHovering = false;
        }

        click() {
            this._dispatcher.dispatch('click', this);
        }
    }

    /**
     * A represent dot.
     */
    class Dot extends Shape {
        constructor(point, radius, appearnce) {
            super(appearnce);

            this._point = point;
            this.radius = radius || 5;
        }
        set point(value) {
            this._point = point;
        }
        get point() {
            return this._point;
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

            this.start = start;
            this.end   = end;

            this.dx = this.end.x - this.start.x;
            this.dy = this.end.y - this.start.y;
            this.a  = this.dx * this.dx + this.dy * this.dy;
            this.detectDistance = 20;
        } 
        draw(context) {
            super.draw(context);
            
            context.save();
            context.beginPath();
            context.translate(this.start.x, this.start.y);
            this.decorate(context);
            context.moveTo(0, 0);
            context.lineTo(this.dx, this.dy);
            context.closePath();

            context.fill();
            context.stroke();

            context.restore();
        }
        checkShotenPoint(px, py) {
            if (this.a === 0) {
                var _x = this.start.x - px;
                var _y = this.start.y - py;
                return Math.sqrt(_x * _x + _y * _y);
            }

            var b = this.dx * (this.start.x - px) + this.dy * (this.start.y - py);
            var t = -(b / this.a);

            if (t < 0.0) {
                t = 0.0;
            }
            if (t > 1.0) {
                t = 1.0;
            }

            var x = t * this.dx + this.start.x;
            var y = t * this.dy + this.start.y;

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
            context.translate(this._point.x, this._point.y);
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
