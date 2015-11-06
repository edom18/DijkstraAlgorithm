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

        set selectedColor(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('selectedColor', this.appearance.selectedColor, value, colorEasing);
            }

            this.appearance.selectedColor = value;
        }
        get selectedColor() {
            if (this.isAnimating) {
                var color = this.presentationShape.get('selectedColor', this._animationProgress);
                if (color !== null) {
                    return color;
                }
            }
            return this.appearance.selectedColor;
        }

        set selectedStrokeColor(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('selectedStrokeColor', this.appearance.selectedStrokeColor, value, colorEasing);
            }

            this.appearance.selectedStrokeColor = value;
        }
        get selectedStrokeColor() {
            if (this.isAnimating) {
                var color = this.presentationShape.get('selectedStrokeColor', this._animationProgress);
                if (color !== null) {
                    return color;
                }
            }
            return this.appearance.selectedStrokeColor;
        }

        set color(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('color', this.appearance.color, value, colorEasing);
            }

            this.appearance.color = value;
        }
        get color() {
            if (this.isAnimating) {
                var color = this.presentationShape.get('color', this._animationProgress);
                if (color !== null) {
                    return color;
                }
            }
            return this.appearance.color;
        }

        set hoverColor(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('hoverColor', this.appearance.hoverColor, value, colorEasing);
            }

            this.appearance.hoverColor = value;
        }
        get hoverColor() {
            if (this.isAnimating) {
                var color = this.presentationShape.get('hoverColor', this._animationProgress);
                if (color !== null) {
                    return color;
                }
            }
            return this.appearance.hoverColor;
        }

        set strokeColor(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('strokeColor', this.appearance.strokeColor, value, colorEasing);
            }

            this.appearance.strokeColor = value;
        }
        get strokeColor() {
            if (this.isAnimating) {
                var color = this.presentationShape.get('strokeColor', this._animationProgress);
                if (color !== null) {
                    return color;
                }
            }
            return this.appearance.strokeColor;
        }

        set hoverStrokeColor(value) {
            if (Shape.isAnimationCapturing) {
                if (!this.presentationShape) {
                    this.presentationShape = new PresentationShape(this);
                    this.startAnimation();
                }
                this.presentationShape.set('hoverStrokeColor', this.appearance.hoverStrokeColor, value, colorEasing);
            }

            this.appearance.hoverStrokeColor = value;
        }
        get hoverStrokeColor() {
            if (this.isAnimating) {
                var color = this.presentationShape.get('hoverStrokeColor', this._animationProgress);
                if (color !== null) {
                    return color;
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

    // Exports
    namespace.Shape = Shape;
    namespace.Dot   = Dot;
    namespace.Line  = Line;
    namespace.Text  = Text;

}(window));
