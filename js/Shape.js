(function (namespace) {
    'use strict';

    /**
     * Represent appearance of shapes
     */
    class Appearance {
        constructor() {
            this._color       = namespace.Color.black;
            this._strokeColor = namespace.Color.black;
        }

        set color(value) {
            this._color = value;
        }
        get color() {
            return this._color;
        }

        set strokeColor(value) {
            this._strokeColor = value;
        }
        get strokeColor() {
            return this._strokeColor;
        }
    }

    //////////////////////////////////////////////////

    class AnimatorGroup {
        constructor(id) {
            this.id = id;
            this._animators = new Set();
            this._listeners = new Map();
            this._dispatcher = new namespace.Dispatcher();
        }
        addAnimator(animator) {
            if (this._animators.has(animator)) {
                return;
            }

            var listener = new Listener('animationend', this.animationendHandler.bind(this));
            animator.addListener(listener);
            this._animators.add(animator);
            this._listeners.set(animator, listener);
        }
        removeAnimator(animator) {
            this._listeners.delete(animator);
            this._animators.delete(animator);
        }

        animationendHandler() {
            for (let animator of this._animators.entries()) {
                if (!animator[0].isAnimated) {
                    return;
                }
            }

            console.log('animation group has been ended.');

            this._dispatcher.dispatch('animationgroupend', this, {

            });
        }

        addListener(listener) {
            this._dispatcher.addListener(listener);
        }

        removeListener(listener) {
            this._dispatcher.removeListener(listener);
        }

        dispose() {
            this._dispatcher.dispose();
        }
    }

    class Animator {
        constructor(key, duration, fromValue, toValue, easingFunc) {
            this.duration   = duration
            this.fromValue  = fromValue;
            this.toValue    = toValue;
            this.easingFunc = easingFunc;

            this.isAnimated = false;
            this.time = 0;

            this._dispatcher = new namespace.Dispatcher();
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
            for(var key in this._properties) {
                var property = this._properties[key];
                property.dispose();
            }
            this._properties = {};
        }

        has(key) {
            return !!this._properties[key];
        }

        get(key) {
            if (this._properties[key]) {
                return this._properties[key].value;
            }

            return null;
        }

        set(key, duration, fromValue, toValue, easingFunc) {
            if (this.has(key)) {
                fromValue = this.get(key);
                this._properties[key].dispose();
                this._properties[key] = null;
            }

            var animator = new Animator(key, duration, fromValue, toValue, easingFunc);
            animator.addListener(new Listener('animationend', () => {
                animator.dispose();
                animator = null;
                this._properties[key] = null;
            }));
            this._properties[key] = animator;

            Shape.addAnimatorToCurrentContext(animator);

            return animator;
        }
    }

    /**
     * Shape base class.
     */
    class Shape {
        constructor(appearance) {
            this._isHovering = false;

            this.presentationShape = new PresentationShape(this);

            this._dispatcher = new namespace.Dispatcher();

            this.appearance = appearance || new Appearance();

            this.zIndex = 0;
        }

        addListener(listener) {
            this._dispatcher.addListener(listener);
        }

        removeListener(listener) {
            this._dispatcher.removeListener(listener);
        }

        decorate(context) {
            var color       = this.presentationShape.get('color');
            var strokeColor = this.presentationShape.get('strokeColor');
            color = color ? color : this.appearance.color;
            strokeColor = strokeColor ? strokeColor : this.appearance.strokeColor;

            context.fillStyle   = color.toString();
            context.strokeStyle = strokeColor.toString();
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
            if (this._isHovering) {
                return;
            }

            this._isHovering = true;

            this._dispatcher.dispatch('hover', this);
        }

        /**
         * Turn off hovering flag.
         */
        unhover() {
            if (!this._isHovering) {
                return;
            }

            this._isHovering = false;

            this._dispatcher.dispatch('unhover', this);
        }

        /**
         * Raize a click event
         */
        click() {
            this._dispatcher.dispatch('click', this);
        }

        /**
         * Color for the canvas.
         */
        set color(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('color', Shape.animationDuration, this.appearance.color, value, colorEasing);
            }

            this.appearance.color = value;
        }
        get color() {
            return this.appearance.color;
        }


        /**
         * Stroke color for the canvas.
         */
        set strokeColor(value) {
            if (Shape.isAnimationCapturing) {
                this.presentationShape.set('strokeColor', Shape.animationDuration, this.appearance.strokeColor, value, colorEasing);
            }

            this.appearance.strokeColor = value;
        }
        get strokeColor() {
            return this.appearance.strokeColor;
        }

        static setupAnimatorGroup(completion) {
            var id = this.animationGroupId = this.generateId();
            var animatorGroup = new AnimatorGroup(id);
            Shape.animatorGroup[id] = animatorGroup;
            animatorGroup.addListener(new Listener('animationgroupend', (target, referData) => {
                Shape.animatorGroup[id].dispose();
                delete Shape.animatorGroup[id];

                if (completion) {
                    completion();
                    completion = null;
                }
            }));
        }

        /**
         * Static method
         *
         * This method provide animation start point.
         * When setting up any parameter in the shape, will animate the shape by duration.
         */
        static animationWithDuration(duration, capture, completion) {
            this.animationDuration = duration;

            // Capture start.
            this.isAnimationCapturing = true;

            // Create an animator group.
            this.setupAnimatorGroup(completion);

            // Capture values as animation.
            capture();

            this.isAnimationCapturing = false;
        }

        static generateId() {
            var id = `id-${Math.random()}`;
            return id;
        }

        static addAnimatorToCurrentContext(animator) {
            this.animatorGroup[this.animationGroupId].addAnimator(animator);
        }
    }
    Shape.isAnimationCapturing = false;
    Shape.animationDuration = 0;
    Shape.animationGroupId = null;
    Shape.animatorGroup = {};


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
    namespace.Appearance = Appearance;
    namespace.Shape      = Shape;
    namespace.Dot        = Dot;
    namespace.Line       = Line;
    namespace.Text       = Text;

}(window));
