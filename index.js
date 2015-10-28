(function () {
    'use strict';

    class Node {
        constructor(id, point) {
            var radius = 15;

            this.shape = new Dot(point, radius);

            this.model = NodeModelManager.getInstance().create(id);

            this._dispatcher = new Dispatcher();
        }
        addNode(targetNode, cost) {
            var edgeModel = this.createEdge(targetNode);
            edgeModel.cost = cost;

            targetNode.connect(this);
        }
        createEdge(targetNode) {
            var edgeModel = EdgeModelManager.getInstance().create(this, targetNode);
            this.model.addEdge(edgeModel);
            return edgeModel;
        }
        connect(connectedNode) {
            var edgeModel = EdgeModelManager.getInstance().create(this, connectedNode);
            this.model.addEdge(edgeModel);
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

    class Edge {
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

            var node1 = new Node(1, node1Point); // start
            var node2 = new Node(2, node2Point); // top
            var node3 = new Node(3, node3Point); // center
            var node4 = new Node(4, node4Point); // bottom-left
            var node5 = new Node(5, node5Point); // bottom-right
            var node6 = new Node(6, node6Point); // goal

            // Connect each nodes.
            node1.addNode(node2, 5);
            node1.addNode(node3, 4);
            node1.addNode(node4, 2);

            node2.addNode(node6, 6);
            node2.addNode(node3, 2);

            node3.addNode(node4, 3);
            node3.addNode(node5, 2);

            node4.addNode(node5, 6);

            node5.addNode(node6, 4);

            return [
                node1, node2, node3, node4, node5, node6
            ];
        }

        launch() {
            var nodes = this.createNodes();
            EdgeModelManager.getInstance().edges.forEach((edgeModel, i) => {
                var edge = new Edge(edgeModel);
                edge.addToScene(this.scene);
                edge.addListener(new Listener('click', (target) => {
                    this.inspector.selectedItem = target.model;
                }));
            });
            nodes.forEach((node, i) => {
                node.addToScene(this.scene);
                node.addListener(new Listener('click', (target) => {
                    this.inspector.selectedItem = target.model;
                }));
            });
            dijkstraSearch(nodes);
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
