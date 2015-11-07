(function (namespace) {
    'use strict';

    /**
     * Represent appearance of shapes
     */
    class Appearance {
        constructor() {
            this._color       = Color.black;
            this._strokeColor = Color.black;

            this._hoverColor       = Color.black;
            this._hoverStrokeColor = Color.black;

            this._selectedColor = Color.green;
            this._selectedStrokeColor = Color.red;
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
            context.fillStyle   = this._shape.color.toString();
            context.strokeStyle = this._shape.strokeColor.toString();
        }
    }

    /**
     * Hovering style decorator
     */
    class HoverDecorator extends Decorator {
        decorate(context) {
            context.fillStyle   = this._shape.hoverColor.toString();
            context.strokeStyle = this._shape.hoverStrokeColor.toString();
        }
    }

    /**
     * Selected style decorator
     */
    class SelectedDecorator extends Decorator {
        decorate(context) {
            context.fillStyle   = this._shape.selectedColor.toString();
            context.strokeStyle = this._shape.selectedStrokeColor.toString();
        }
    }

    //////////////////////////////////////////////////

    class Animator {
        constructor(key, duration, fromValue, toValue, easingFunc) {
            this.duration   = duration
            this.fromValue  = fromValue;
            this.toValue    = toValue;
            this.easingFunc = easingFunc;

            this.isAnimated = false;
            this.time = 0;

            this._dispatcher = new Dispatcher();
        }

        get value() {
            if (this.isAnimated) {
                return this.toValue;
            }

            this.time += Timer.deltaTime;
            var t = this.time / this.duration;

            if (t >= 1.0) {
                this.isAnimated = true;
                t = 1.0;
                var val = this.easingFunc(t, this.fromValue, this.toValue);
                this._dispatcher.dispatch('animationend', this, {
                    name: this.key
                });
                return val;
            }

            return this.easingFunc(t, this.fromValue, this.toValue);
        }

        addListener(listener) {
            this._dispatcher.addListener(listener);
        }

        /**
         * Remove a listener
         *
         * @param {Listener} listener
         */
        removeListener(listener) {
            this._dispatcher.removeListener(listener);
        }

        dispose() {
            this._dispatcher.dispose();
        }
    }

    /**
     * Presentation for a shape
     * This class provide animation's presentation.
     */
    class PresentationShape {
        constructor(shape) {
            this._shape = shape;
            this.clear();
        }

        isAnimating(key) {
            var isAnimating = !!this._properties[key];
            return isAnimating;
        }

        clear() {
            this._properties = {};
        }

        get(key) {
            if (this._properties[key]) {
                return this._properties[key].value;
            }

            return null;
        }

        set(key, duration, fromValue, toValue, easingFunc) {
            if (this._properties[key]) {
                return;
            }

            var animator = new Animator(key, duration, fromValue, toValue, easingFunc);
            animator.addListener(new Listener('animationend', () => {
                animator.dispose();
                animator = null;
                this._properties[key] = null;
            }));
            this._properties[key] = animator;
        }
    }

    /**
     * Shape base class.
     */
    class Shape {
        constructor(appearance) {
            this.isHovering    = false;
            this.isSelected    = false;

            this.presentationShape = new PresentationShape(this);

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
         * End animation
         */
        _endAnimate() {
            //
        }

        /**
         * Drawing to the canvas
         */
        draw(context) {
            //
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

        set selectedColor(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('selectedColor', Shape.animationDuration, this.appearance.selectedColor, value, colorEasing);
            }

            this.appearance.selectedColor = value;
        }
        get selectedColor() {
            if (this.presentationShape.isAnimating('selectedColor')) {
                var selectedColor = this.presentationShape.get('selectedColor');
                if (selectedColor !== null) {
                    return selectedColor;
                }
            }

            return this.appearance.selectedColor;
        }

        set selectedStrokeColor(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('selectedStrokeColor', Shape.animationDuration, this.appearance.selectedStrokeColor, value, colorEasing);
            }

            this.appearance.selectedStrokeColor = value;
        }
        get selectedStrokeColor() {
            if (this.presentationShape.isAnimating('selectedStrokeColor')) {
                var selectedStrokeColor = this.presentationShape.get('selectedStrokeColor');
                if (selectedStrokeColor !== null) {
                    return selectedStrokeColor;
                }
            }

            return this.appearance.selectedStrokeColor;
        }

        set color(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('color', Shape.animationDuration, this.appearance.color, value, colorEasing);
            }

            this.appearance.color = value;
        }
        get color() {
            if (this.presentationShape.isAnimating('color')) {
                var color = this.presentationShape.get('color');
                if (color !== null) {
                    return color;
                }
            }

            return this.appearance.color;
        }

        set hoverColor(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('hoverColor', Shape.animationDuration, this.appearance.hoverColor, value, colorEasing);
            }

            this.appearance.hoverColor = value;
        }
        get hoverColor() {
            if (this.presentationShape.isAnimating('hoverColor')) {
                var hoverColor = this.presentationShape.get('hoverColor');
                if (hoverColor !== null) {
                    return hoverColor;
                }
            }

            return this.appearance.hoverColor;
        }

        set strokeColor(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('strokeColor', Shape.animationDuration, this.appearance.strokeColor, value, colorEasing);
            }

            this.appearance.strokeColor = value;
        }
        get strokeColor() {
            if (this.presentationShape.isAnimating('strokeColor')) {
                var strokeColor = this.presentationShape.get('strokeColor');
                if (strokeColor !== null) {
                    return strokeColor;
                }
            }

            return this.appearance.strokeColor;
        }

        set hoverStrokeColor(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('hoverStrokeColor', Shape.animationDuration, this.appearance.hoverStrokeColor, value, colorEasing);
            }

            this.appearance.hoverStrokeColor = value;
        }
        get hoverStrokeColor() {
            if (this.presentationShape.isAnimating('hoverStrokeColor')) {
                var hoverStrokeColor = this.presentationShape.get('hoverStrokeColor');
                if (hoverStrokeColor !== null) {
                    return hoverStrokeColor;
                }
            }

            return this.appearance.hoverStrokeColor;
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
                this.presentationShape.set('point', Shape.animationDuration, this._point, value, pointEasing);
            }

            this._point = value;
        }
        get point() {
            if (this.presentationShape.isAnimating('point')) {
                var point = this.presentationShape.get('point');
                if (point !== null) {
                    return point;
                }
            }

            return this._point;
        }

        set radius(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('radius', Shape.animationDuration, this._radius, value, floatEasing);
            }

            this._radius = value;
        }
        get radius() {
            if (this.presentationShape.isAnimating('radius')) {
                var radius = this.presentationShape.get('radius');
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
                this.presentationShape.set('start', Shape.animationDuration, this._start, value, pointEasing);
            }

            this._start = value;
            this.update();
        }
        get start() {
            if (this.presentationShape.isAnimating('start')) {
                var start = this.presentationShape.get('start');
                if (start !== null) {
                    return start;
                }
            }

            return this._start;
        }

        set end(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('end', Shape.animationDuration, this._end, value, pointEasing);
            }

            this._end = value;
            this.update();
        }
        get end() {
            if (this.presentationShape.isAnimating('end')) {
                var end = this.presentationShape.get('end');
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

    // Exports
    namespace.Shape = Shape;
    namespace.Dot   = Dot;
    namespace.Line  = Line;
    namespace.Text  = Text;

}(window));
