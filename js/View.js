(function (namespace) {
    'use strict';

    /**
     * Vew base class
     */
    class View {
        constructor(id, point) {
            this.shape       = new Shape();
            this._dispatcher = new Dispatcher();
            this._selected   = false;
            this._isHovering = false;
            this._map = new Map();
        }
        
        //////////////////////////////////////////////////
        // Getter / Setter

        /**
         * Selected flag
         */
        set selected(value) {
            if (this._selected === value) {
                return;
            }

            this._selected = true;
        }
        get selected() {
            return this._selected;
        }

        //////////////////////////////////////////////////

        get currentColor() {
            return Color.black;
        }

        clear() {
            this.shape.color = this.currentColor;
        }
        
        /**
         * Add listener to the dispather.
         */
        addListener(listener) {
            var intercepter = new ListenerIntercepter(listener, (context, referData) => {
                this._dispatcher.dispatch(listener.type, this, referData);
            });
            this.shape.addListener(intercepter);
            this._dispatcher.addListener(listener);

            this._map.set(listener, intercepter);
        }
        
        /**
         * Remove listener from the dispather.
         */
        removeListener(listener) {
            if (!this._map.has(listener)) {
                return;
            }

            var intercepter = this._map.get(listener);
            this._dispatcher.removeListener(listener);
            this.shape.removeListener(intercepter);

            this._map.delete(listener);
        }

        /**
         * Add this view to the scene
         *
         * @param {Scene} scene
         */
        addToScene(scene) {
            scene.add(this.shape);
        }

        /**
         * Perform hover action.
         * This is just virtual method.
         */
        hover() {
            if (this._isHovering) {
                return;
            }

            this._isHovering = true;
        }

        /**
         * Perform unhover action.
         * This is just virtual method.
         */
        unhover() {
            if (!this._isHovering) {
                return;
            }

            this._isHovering = false;
        }
    }

    //////////////////////////////////////////////////

    /**
     * Node view class
     *
     * Represent node view.
     */
    class NodeView extends View {
        constructor(id, point) {
            super();

            this.normalRadius = 10;
            this.hoverRadius  = 13;

            this._appearance         = new namespace.Appearance(Color.white, Color.black);
            this._selectedAppearance = new namespace.Appearance(Color.white, new Color(0xd4311e));

            this.shape = new Dot(point, this.normalRadius, this._appearance);

            this.model = NodeManager.getInstance().create(id);
            this._changeListener = new Listener('change', this.changeHandler.bind(this));
            this.model.addListener(this._changeListener);

            this._startNodeColor = new Color(0x26a9e1);
            this._goalNodeColor  = new Color(0xf8903b);
        }

        // @override
        get currentColor() {
            if (this.model.isStart) {
                return this._startNodeColor;
            }
            else if (this.model.isGoal) {
                return this._goalNodeColor;
            }
            else if (this._selected) {
                return this._selectedAppearance.color;
            }

            return this._appearance.color;
        }

        handleChangeModel(changedData) {
            namespace.Shape.animationWithDuration(500, () => {
                this.shape.color = this.currentColor;
            });
        }

        // handleAdoption(changedData) {
        //     if (changedData.name === 'adoption') {
        //         if (changedData.newValue) {
        //             this.shape.color = 'red';
        //         }
        //         else {
        //             this.shape.color = 'black';
        //         }
        //     }
        // }

        /**
         * Change handler for the model.
         */
        changeHandler(target, changedData) {
            this.handleChangeModel(changedData);
            // this.handleAdoption(changedData);
        }

        /**
         * Point
         */
        get point() {
            return this.shape.point;
        }
        set point(value) {
            this.shape.point = value;
        }

        /**
         * Radius
         */
        get radius() {
            this.shape.radius;
        }
        set radius(value) {
            this.shape.radius = value;
        }

        // @override
        set selected(value) {
            if (this._selected === value) {
                return;
            }

            this._selected = value;

            var color = value ? this._selectedAppearance.strokeColor : this._appearance.strokeColor;
            Shape.animationWithDuration(500, () => {
                this.shape.strokeColor = color;
            });
        }

        // @override
        hover() {
            if (this._isHovering) {
                return;
            }

            this._isHovering = true;

            Shape.animationWithDuration(800, () => {
                this.shape.radius = this.hoverRadius;
            });
        }

        // @override
        unhover() {
            if (!this._isHovering) {
                return;
            }

            this._isHovering = false;

            Shape.animationWithDuration(800, () => {
                this.shape.radius = this.normalRadius;
            });
        }
    }

    //////////////////////////////////////////////////

    /**
     * Edge view class
     * 
     * Represent edge
     */
    class EdgeView extends View {
        constructor(model, nodeA, nodeB) {
            super();
            
            this.model = model;
            this._nodeA = nodeA;
            this._nodeB = nodeB;

            this._appearance         = new namespace.Appearance(Color.white, Color.black);
            this._selectedAppearance = new namespace.Appearance(Color.white, new Color(0xd4311e));

            this._changeListener = new Listener('change', this.changeHandler.bind(this));
            this.model.addListener(this._changeListener);

            this.shape = new Line(nodeA.point, nodeB.point);

            var x = (nodeA.point.x + nodeB.point.x) / 2;
            x += 10;
            var y = (nodeA.point.y + nodeB.point.y) / 2;
            y += 10;

            this.text  = new Text(new Point(x, y), model.cost);
        }

        handleAdoption(changedData) {
            if (changedData.name !== 'adoption') {
                return;
            }

            if (changedData.newValue) {
                this.shape.strokeColor = Color.red;
            }
            else {
                this.shape.strokeColor = Color.black;
            }
        }

        /**
         * Change handler for the model.
         */
        changeHandler(target, changedData) {
            // this.handleAdoption(changedData);

            if (changedData.name === 'cost') {
                this.text.text = this.model.cost;
            }
        }

        /**
         * Add this to the scene.
         */
        addToScene(scene) {
            scene.add(this.shape);
            scene.add(this.text);
        }

        /**
         * Start edge.
         */
        set start(value) {
            this.shape.start = value;
        }
        get start() {
            return this.shap.start;
        }

        /**
         * End edge.
         */
        set end(value) {
            this.shape.end = value;
        }
        get end() {
            return this.shap.end;
        }

        // @override
        set selected(value) {
            if (this._selected === value) {
                return;
            }

            this._selected = value;

            var color = value ? this._selectedAppearance.strokeColor : this._appearance.strokeColor;
            Shape.animationWithDuration(500, () => {
                this.shape.strokeColor = color;
            });
        }

        // @override
        hover() {
            if (this._isHovering) {
                return;
            }

            this._isHovering = true;

            Shape.animationWithDuration(800, () => {
                this.shape.lineWidth = 5;
            });
        }

        // @override
        unhover() {
            if (!this._isHovering) {
                return;
            }

            this._isHovering = false;

            Shape.animationWithDuration(800, () => {
                this.shape.lineWidth = 1;
            });
        }
    }

    // Exports
    namespace.View     = View;
    namespace.NodeView = NodeView;
    namespace.EdgeView = EdgeView;

}(window));
