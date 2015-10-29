(function (namespace) {
    'use strict';

    class View {
        constructor(id, point) {
            this.shape       = new Shape();
            this._dispatcher = new Dispatcher();
        }
        
        addListener(listener) {
            var type = listener.type;
            this.shape.addListener(new Listener(type, (target) => {
                this._dispatcher.dispatch(type, this);
            }));
            this._dispatcher.addListener(listener);
        }
        
        removeListener(listener) {
            this.shape.removeListener(listener);
        }

        addToScene(scene) {
            scene.add(this.shape);
        }
    }

    class NodeView extends View {
        constructor(id, point) {
            super();

            var radius = 15;

            this.shape = new Dot(point, radius);

            this.model = NodeManager.getInstance().create(id);
            this.model.addListener(new Listener('change', (target) => {
                if (this.model.adoption) {
                    this.color = 'red';
                }
                else {
                    this.color = 'blue';
                }
            }));
        }

        get color() {
            return this.shapre.color;
        }
        set color(value) {
            this.shape.color = value;
        }

        get point() {
            return this.shape.point;
        }
        set point(value) {
            this.shape.point = point;
        }
    }

    class EdgeView extends View {
        constructor(model) {
            super();
            
            this.model = model;
            var nodeA = model.nodeA;
            var nodeB = model.nodeB;

            this.shape = new Line(nodeA.point, nodeB.point);

            var x = (nodeA.point.x + nodeB.point.x) / 2;
            x += 10;
            var y = (nodeA.point.y + nodeB.point.y) / 2;
            y += 10;

            this.text  = new Text(new Point(x, y), model.cost);
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
