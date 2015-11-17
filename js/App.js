(function (namespace) {
    'use strict';

    class Application {
        constructor() {
            this.scene     = new Scene();
            this.renderer  = new Renderer(1225, 840);
            this.inspector = new Inspector();

            document.querySelector('.content').appendChild(this.renderer.element);
            this.setupDOMEvents();

            this.animationQueue = null;
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
            var node1Point = new Point(280, 130);
            var node2Point = new Point(410, 40);
            var node3Point = new Point(490, 380);
            var node4Point = new Point(120, 450);
            var node5Point = new Point(765, 530);
            var node6Point = new Point(850, 180);

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
            edgeManager.connect(node3.model, node6.model, 10);

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

        fetchEdgeViewById(id) {
            var edge = null;
            var hasEdge = this.edgeViews.some((e, i) => {
                if (e.model.id === id) {
                    edge = e;
                    return true;
                }
            });
            return edge;
        }

        /**
         * Get all nodes from node views.
         */
        getNodes() {
            return NodeManager.getInstance().nodes;
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

            this.clearBtn = document.getElementById('clearBtn');
            this.clearBtn.addEventListener('click', this.clearHandler.bind(this), false);

            setTimeout(() => {
                // for debug
                var manager   = NodeManager.getInstance();
                var nodes = manager.nodes;
                nodes[0].set('isStart', true);
                nodes[5].set('isGoal', true);
            }, 1000);
        }


        /**
         * Clear style to all items.
         */
        start() {
            this.nodeViews.forEach((nodeView, i) => {
                nodeView.clear();
            });
            this.edgeViews.forEach((edgeView, i) => {
                edgeView.clear();
            });
        }

        clear() {
            this.getNodes().forEach((node, i) => {
                node.clear();
            });
            EdgeManager.getInstance().edges.forEach((edge, i) => {
                edge.clear();
            });

            Shape.animationWithDuration(500, () => {
                this.nodeViews.forEach((nodeView, i) => {
                    nodeView.shape.radius = nodeView.normalRadius;;
                });
                this.edgeViews.forEach((edgeView, i) => {
                    edgeView.shape.lineWidth = 1;
                });
            });
        }

        /**
         * Search node path with Dijkstra algorithm.
         */
        searchHandler() {
            this.start();
            namespace.dijkstraSearch(this.getNodes());
            this.createAnimationSequence();
        }

        generateRoute() {
            var nodeManager = NodeManager.getInstance();
            var paths = nodeManager.getPaths();
            if (!paths) {
                return;
            }

            var edgeManager  = EdgeManager.getInstance();
            var route        = [];
            var previousNode = null;
            for (var i = 0, l = paths.length; i < l; i++) {
                var node = paths[i];
                var nodeView = this.fetchNodeViewById(node.id);

                if (previousNode) {
                    var edge     = edgeManager.fetchByNode(node, previousNode);
                    var edgeView = this.fetchEdgeViewById(edge.id);
                    route.push(edgeView);
                }

                route.push(nodeView);
                previousNode = node;
            }

            return route;
        }

        createAnimationSequence() {
            this.animationQueue = new namespace.AnimationQueue();

            var duration = 800;
            var route = this.generateRoute();

            route.forEach((view, i) => {
                var animationItem = null;
                if (view instanceof NodeView) {
                    animationItem = new namespace.AnimationQueueItem(() => {
                        view.shape.radius = 15;
                    }, duration);
                }
                else if (view instanceof EdgeView) {
                    animationItem = new namespace.AnimationQueueItem(() => {
                        view.pathEnd = view.end; 
                        // view.shape.lineWidth = 3;
                    }, duration);
                }

                this.animationQueue.add(animationItem);
            });

            this.startAnimation();
        }

        startAnimation() {
            this.animationQueue.start();
        }

        /**
         * Clear data
         */
        clearHandler() {
            this.clear();
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
                    this.unselect();

                    target.selected = true;
                    this.inspector.selectedItem = target.model;
                });
                edgeView.addListener(listener);

                var hoverListener = new Listener('hover', (target) => {
                    target.hover();
                });
                edgeView.addListener(hoverListener);

                var unhoverListener = new Listener('unhover', (target) => {
                    target.unhover();
                });
                edgeView.addListener(unhoverListener);
            });


            this.nodeViews.forEach((nodeView, i) => {
                var clickListener = new Listener('click', (target) => {
                    this.unselect();

                    target.selected = true;
                    this.inspector.selectedItem = target.model;
                });
                nodeView.addListener(clickListener);

                var hoverListener = new Listener('hover', (target) => {
                    target.hover();
                });
                nodeView.addListener(hoverListener);

                var unhoverListener = new Listener('unhover', (target) => {
                    target.unhover();
                });
                nodeView.addListener(unhoverListener);
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
            Timer.tick();
            this.renderer.render(this.scene);
        }
    }
    
    namespace.Application = Application;



    function main() {

        var app = Application.getInstance();
        app.launch();

        (function loop() {
            app.runLoop();
            setTimeout(loop, 32);
        }());
    }

    // Start this program.
    main();

}(window));
