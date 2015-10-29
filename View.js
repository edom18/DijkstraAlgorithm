(function (namespace) {
    'use strict';

    /**
     * Vew base class
     */
    class View {
        constructor(id, point) {
            this.shape       = new Shape();
            this._dispatcher = new Dispatcher();
        }
        
        addListener(listener) {
            var type = listener.type;
            this.shape.addListener(new Listener(type, (target, referData) => {
                this._dispatcher.dispatch(type, this, referData);
            }));
            this._dispatcher.addListener(listener);
        }
        
        removeListener(listener) {
            this.shape.removeListener(listener);
        }

        addToScene(scene) {
            scene.add(this.shape);
        }

        get color() {
            return this.shapre.color;
        }
        set color(value) {
            this.shape.color = value;
        }

        get strokeColor() {
            return this.shapre.strokeColor;
        }
        set strokeColor(value) {
            this.shape.strokeColor = value;
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
                    this.color = 'red';
                }
                else {
                    this.color = 'blue';
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
                    this.strokeColor = 'red';
                }
                else {
                    this.strokeColor = 'blue';
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
