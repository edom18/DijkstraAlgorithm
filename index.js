(function () {
    'use strict';

    // TODO: Dotを継承しないようにする
    class Node extends Dot {
        constructor(id, point) {
            var radius = 15;
            super(point.x, point.y, radius);

            this.model    = new NodeModel();
            this.model.id = id;
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
        get point() {
            return new Point(this.x, this.y);
        }
        set point(value) {
            this.x = value.x;
            this.y = value.y;
        }
    }



    // debug
    var scene = new Scene();
    var renderer = new Renderer(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.element);
    renderer.element.addEventListener('mousemove', function (e) {
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        scene.hover(x, y);
    }, false);
    renderer.element.addEventListener('click', function (e) {
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        scene.click(x, y);
    }, false);


    var ins = new Inspector();

    // var node1Point = new Point(10, 150);
    // var node2Point = new Point(80, 10);
    // var node1 = new Node(1, node1Point); // start
    // var node2 = new Node(2, node2Point); // top

    // var edgeModel = EdgeModelManager.getInstance().create(node1, node2);
    // var edge = new Edge(edgeModel);
    // edge.color = 'green';
    // edge.hoverColor = 'orange';
    // edge.addListener(new Listener('click', () => {
    //     ins.selectedItem = edgeModel;
    // }));

    // scene.add(edge);

    var text = new Text(50, 50, 'hoge');
    scene.add(text);

    (function loop() {
        renderer.render(scene);
        setTimeout(loop, 100);
    }());


    /**
     * Create nodes (as demo)
     */
    function createNodes() {
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

    // node1.addListener(new Listener('click', (target) => {
    //     ins.selectedItem = target.model;
    // }));
    // node2.addListener(new Listener('click', (target) => {
    //     ins.selectedItem = target.model;
    // }));


        scene.add(node1);
        scene.add(node2);
        scene.add(node3);
        scene.add(node4);
        scene.add(node5);
        scene.add(node6);

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

    function main() {
        var nodes = createNodes();
        dijkstraSearch(nodes);
    }

    // Start this program.
    main();
}());
