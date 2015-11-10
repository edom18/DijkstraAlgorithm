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
        
        addListener(listener) {
            var intercepter = new ListenerIntercepter(listener, (context, referData) => {
                this._dispatcher.dispatch(listener.type, this, referData);
            });
            this.shape.addListener(intercepter);
            this._dispatcher.addListener(listener);

            this._map.set(listener, intercepter);
        }
        
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

        hover() {
            if (this._isHovering) {
                return;
            }

            this._isHovering = true;
        }

        unhover() {
            if (!this._isHovering) {
                return;
            }

            this._isHovering = false;
        }
    }

    /**
     * Node view class
     *
     * Represent node view.
     */
    class NodeView extends View {
        constructor(id, point) {
            super();

            var radius = 10;

            this.shape = new Dot(point, radius);

            this._appearance         = new namespace.Appearance();
            this._hoverAppearance    = new namespace.Appearance();
            this._selectedAppearance = new namespace.Appearance();

            this._selectedAppearance.color = Color.blue;
            this._hoverAppearance.color = Color.white;

            this.model = NodeManager.getInstance().create(id);
            this._changeListener = new Listener('change', this.changeHandler.bind(this));
            this.model.addListener(this._changeListener);
        }

        changeHandler(target, changedData) {
            if (changedData.name === 'adoption') {
                if (changedData.newValue) {
                    this.shape.color = 'red';
                }
                else {
                    this.shape.color = 'black';
                }
            }
        }

        get point() {
            return this.shape.point;
        }
        set point(value) {
            this.shape.point = value;
        }

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

            if (value === true) {
                Shape.animationWithDuration(3000, () => {
                    this.shape.color = this._selectedAppearance.color;
                });
            }
            else {
                Shape.animationWithDuration(3000, () => {
                    this.shape.color = this._appearance.color;
                });
            }
        }

        // @override
        hover() {
            if (this._isHovering) {
                return;
            }

            this._isHovering = true;

            Shape.animationWithDuration(3000, () => {
                this.shape.color = this._hoverAppearance.color;
            });
        }

        // @override
        unhover() {
            if (!this._isHovering) {
                return;
            }

            this._isHovering = false;

            Shape.animationWithDuration(3000, () => {
                this.shape.color = this._appearance.color;
            });
        }
    }

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

            this._changeListener = new Listener('change', this.changeHandler.bind(this));
            this.model.addListener(this._changeListener);

            this.shape = new Line(nodeA.point, nodeB.point);

            var x = (nodeA.point.x + nodeB.point.x) / 2;
            x += 10;
            var y = (nodeA.point.y + nodeB.point.y) / 2;
            y += 10;

            this.text  = new Text(new Point(x, y), model.cost);
        }

        changeHandler(target, changedData) {
            if (changedData.name === 'adoption') {
                if (changedData.newValue) {
                    this.shape.strokeColor = 'red';
                }
                else {
                    this.shape.strokeColor = 'black';
                }
            }

            if (changedData.name === 'cost') {
                this.text.text = this.model.cost;
            }
        }

        addToScene(scene) {
            scene.add(this.shape);
            scene.add(this.text);
        }

        set start(value) {
            this.shape.start = value;
        }
        get start() {
            return this.shap.start;
        }

        set end(value) {
            this.shape.end = value;
        }
        get end() {
            return this.shap.end;
        }
    }

    // Exports
    namespace.View     = View;
    namespace.NodeView = NodeView;
    namespace.EdgeView = EdgeView;

}(window));
