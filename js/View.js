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
            this._map = new Map();
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

        addToScene(scene) {
            scene.add(this.shape);
        }

        set selected(value) {
            this._selected = value;
        }
        get selected() {
            return this._selected;
        }

        set appearance(value) {
            this.shape.appearance = value;
        }
        get appearance() {
            return this.shape.appearance;
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

            this.model = NodeManager.getInstance().create(id);
            this._changeListener = new Listener('change', this.changeHandler.bind(this));
            this.model.addListener(this._changeListener);
        }

        changeHandler(target, changedData) {
            if (changedData.name === 'adoption') {
                if (changedData.newValue) {
                    this.appearance.color = 'red';
                }
                else {
                    this.appearance.color = 'black';
                }
            }
        }

        get point() {
            return this.shape.point;
        }
        set point(value) {
            this.shape.point = point;
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
                    this.appearance.strokeColor = 'red';
                }
                else {
                    this.appearance.strokeColor = 'black';
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
    }

    // Exports
    namespace.View     = View;
    namespace.NodeView = NodeView;
    namespace.EdgeView = EdgeView;

}(window));
