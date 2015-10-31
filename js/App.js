(function () {
    'use strict';

    class Application {
        constructor() {
            this.scene     = new Scene();
            this.renderer  = new Renderer(window.innerWidth, window.innerHeight);
            this.inspector = new Inspector();

            document.body.appendChild(this.renderer.element);
            this.setupDOMEvents();
        }

        /**
         * Get instance (This class is singleton)
         */
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
            var node1Point = new Point(30, 150);
            var node2Point = new Point(200, 10);
            var node3Point = new Point(180, 160);
            var node4Point = new Point(100, 300);
            var node5Point = new Point(210, 310);
            var node6Point = new Point(350, 140);

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

        /**
         * Create edgeViews with nodes.
         */
        createEdgeViews() {
            var edgeViews = [];
            EdgeManager.getInstance().edges.forEach((edge, i) => {
                var nodeA = this.fetchNodeViewById(edge.nodeA.id);
                var nodeB = this.fetchNodeViewById(edge.nodeB.id);
                var edgeView = new EdgeView(edge, nodeA, nodeB);
                edgeViews.push(edgeView);
            });
            return edgeViews;
        }

        /**
         * Fetch node from nodeViews by id.
         */
        fetchNodeViewById(id) {
            var node = null;
            var hasNode = this.nodeViews.some((n, i) => {
                if (n.model.id === id) {
                    node = n;
                    return true;
                }
            });
            return node;
        }

        /**
         * Get all nodes from node views.
         */
        getNodes() {
            var nodes = [];
            this.nodeViews.forEach((nodeView, i) => {
                nodes.push(nodeView.model);
            });
            return nodes;
        }

        /**
         * Launch application.
         */
        launch() {
            this.nodeViews = this.createNodes();
            this.edgeViews = this.createEdgeViews();

            this.setupEvents();

            this.setupScene();

            this.searchBtn = document.getElementById('searchBtn');
            this.searchBtn.addEventListener('click', this.searchHandler.bind(this), false);
        }


        /**
         * Clear style to all items.
         */
        clear() {
            this.nodeViews.forEach((nodeView, i) => {
                nodeView.appearance.color = 'black';
            });
            this.edgeViews.forEach((edgeView, i) => {
                edgeView.appearance.strokeColor = 'black';
            });
        }

        /**
         * Search node path with Dijkstra algorithm.
         */
        searchHandler() {
            this.clear();

            var startNode = 0;
            var goalNode  = 5;
            dijkstraSearch(this.getNodes(), startNode, goalNode);
        }

        /**
         * Set up scene.
         * Add all items(edgeView / nodeView) to the scene.
         */
        setupScene() {
            this.edgeViews.forEach((edgeView, i) => {
                edgeView.addToScene(this.scene);
            });
            this.nodeViews.forEach((nodeView, i) => {
                nodeView.addToScene(this.scene);
            });
        }

        /**
         * Set up dom events to renderer(a.k.a Canvas)
         */
        setupDOMEvents() {
            this.renderer.element.addEventListener('mousemove', this.mousemoveHandler.bind(this), false);
            this.renderer.element.addEventListener('click',     this.clickHandler.bind(this),     false);
        }

        /**
         * Set up each views event.
         */
        setupEvents() {
            this.edgeViews.forEach((edgeView, i) => {
                var listener = new Listener('click', (target) => {
                    target.selected = true;
                    this.inspector.selectedItem = target.model;
                });
                edgeView.addListener(listener);
            });

            this.nodeViews.forEach((nodeView, i) => {
                var listener = new Listener('click', (target) => {
                    target.selected = true;
                    this.inspector.selectedItem = target.model;
                });
                nodeView.addListener(listener);
            });
        }

        /**
         * Mouse move handler.
         * Track mouse move event from the canvas.
         */
        mousemoveHandler(evt) {
            var rect = evt.target.getBoundingClientRect();
            var x = evt.clientX - rect.left;
            var y = evt.clientY - rect.top;
            this.scene.hover(x, y);
        }

        /**
         * Click handler.
         * Track click event from the canvas.
         */
        clickHandler(evt) {
            this.unselect();

            var rect = evt.target.getBoundingClientRect();
            var x = evt.clientX - rect.left;
            var y = evt.clientY - rect.top;
            this.scene.click(x, y);
        }

        /**
         * Unselect all item.
         */
        unselect() {
            this.edgeViews.forEach((edgeView, i) => {
                edgeView.selected = false;
            });
            this.nodeViews.forEach((nodeView, i) => {
                nodeView.selected = false;
            });
        }

        /**
         * Run loop
         */
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
