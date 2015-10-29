(function () {
    'use strict';

    class NodeView {
        constructor(id, point) {
            var radius = 15;

            this.shape = new Dot(point, radius);

            this.model = NodeManager.getInstance().create(id);

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
        addToScene(scene) {
            scene.add(this.shape);
        }
    }

    class EdgeView {
        constructor(model) {
            this.model = model;
            var nodeA = model.nodeA;
            var nodeB = model.nodeB;

            this.shape = new Line(nodeA.point, nodeB.point);

            var x = (nodeA.point.x + nodeB.point.x) / 2;
            x += 10;
            var y = (nodeA.point.y + nodeB.point.y) / 2;
            y += 10;

            this.text  = new Text(new Point(x, y), model.cost);

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
            scene.add(this.text);
        }
    }

    class Application {
        constructor() {
            this.scene     = new Scene();
            this.renderer  = new Renderer(window.innerWidth, window.innerHeight);
            this.inspector = new Inspector();

            document.body.appendChild(this.renderer.element);
            this.setupEvents();
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new Application();
            }
            return this._instance;
        }

        /**
         * Create nodes (as demo)
         */
        createNodes() {
            var node1Point = new Point(10, 150);
            var node2Point = new Point(80, 10);
            var node3Point = new Point(100, 160);
            var node4Point = new Point(60, 300);
            var node5Point = new Point(150, 310);
            var node6Point = new Point(200, 140);

            var node1 = new NodeView(1, node1Point); // start
            var node2 = new NodeView(2, node2Point); // top
            var node3 = new NodeView(3, node3Point); // center
            var node4 = new NodeView(4, node4Point); // bottom-left
            var node5 = new NodeView(5, node5Point); // bottom-right
            var node6 = new NodeView(6, node6Point); // goal

            // Connect each nodes.
            var edgeManager = EdgeManager.getInstance();
            edgeManager.connect(node1.model, node2.model, 5);
            edgeManager.connect(node1.model, node3.model, 4);
            edgeManager.connect(node1.model, node4.model, 2);

            edgeManager.connect(node2.model, node3.model, 2);
            edgeManager.connect(node2.model, node6.model, 6);

            edgeManager.connect(node3.model, node4.model, 3);
            edgeManager.connect(node3.model, node5.model, 2);

            edgeManager.connect(node4.model, node5.model, 6);

            edgeManager.connect(node5.model, node6.model, 4);

            return [
                node1, node2, node3, node4, node5, node6
            ];
        }

        launch() {
            var nodes = this.createNodes();
            // EdgeManager.getInstance().edges.forEach((edge, i) => {
            //     var edge = new EdgeView(edge);
            //     edge.addToScene(this.scene);
            //     edge.addListener(new Listener('click', (target) => {
            //         this.inspector.selectedItem = target.model;
            //     }));
            // });
            nodes.forEach((node, i) => {
                node.addToScene(this.scene);
                node.addListener(new Listener('click', (target) => {
                    this.inspector.selectedItem = target.model;
                }));
            });
            dijkstraSearch(nodes, 0, 5);
        }

        setupEvents() {
            this.renderer.element.addEventListener('mousemove', this.mousemoveHandler.bind(this), false);
            this.renderer.element.addEventListener('click',     this.clickHandler.bind(this),     false);
        }

        mousemoveHandler(evt) {
            var rect = evt.target.getBoundingClientRect();
            var x = evt.clientX - rect.left;
            var y = evt.clientY - rect.top;
            this.scene.hover(x, y);
        }

        clickHandler(evt) {
            var rect = evt.target.getBoundingClientRect();
            var x = evt.clientX - rect.left;
            var y = evt.clientY - rect.top;
            this.scene.click(x, y);
        }

        runLoop() {
            this.renderer.render(this.scene);
        }
    }

    function main() {

        var app = Application.getInstance();
        app.launch();

        (function loop() {
            app.runLoop();
            setTimeout(loop, 100);
        }());
    }

    // Start this program.
    main();
}());
