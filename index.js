(function () {
    'use strict';

    class Node extends Dot {
        constructor(id, point) {
            super(point.x, point.y, 15);

            this.model    = new NodeModel();
            this.model.id = id;
        }
        addNode(node, cost) {
            this.model.edgesTo.push(node);
            this.model.edgesCost.push(cost);
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

    var node1Point = new Point(10, 150);
    var node2Point = new Point(80, 10);
    var node1 = new Node(1, node1Point); // start
    var node2 = new Node(2, node2Point); // top

    var edgeModel = EdgeModelManager.getInstance().create(node1, node2);
    var edge = new Edge(edgeModel);
    edge.color = 'green';
    edge.hoverColor = 'orange';
    edge.addListener(new Listener('click', () => {
        ins.selectedItem = edgeModel;
    }));

    scene.add(edge);

    var text = new Text(50, 50, 'hoge');
    scene.add(text);

    (function loop() {
        renderer.render(scene);
        setTimeout(loop, 16);
    }());




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
    node1.addListener(new Listener('click', (target) => {
        ins.selectedItem = target.model;
    }));
    node2.addListener(new Listener('click', (target) => {
        ins.selectedItem = target.model;
    }));


        scene.add(node1);
        scene.add(node2);
        scene.add(node3);
        scene.add(node4);
        scene.add(node5);
        scene.add(node6);

        EdgeModelManager.getInstance().create(node1, node2);
        EdgeModelManager.getInstance().create(node1, node3);
        EdgeModelManager.getInstance().create(node1, node4);

        EdgeModelManager.getInstance().create(node2, node1);
        EdgeModelManager.getInstance().create(node2, node3);
        EdgeModelManager.getInstance().create(node2, node6);

        EdgeModelManager.getInstance().create(node3, node1);
        EdgeModelManager.getInstance().create(node3, node2);
        EdgeModelManager.getInstance().create(node3, node4);
        EdgeModelManager.getInstance().create(node3, node5);

        EdgeModelManager.getInstance().create(node4, node1);
        EdgeModelManager.getInstance().create(node4, node3);
        EdgeModelManager.getInstance().create(node4, node5);

        EdgeModelManager.getInstance().create(node5, node3);
        EdgeModelManager.getInstance().create(node5, node4);
        EdgeModelManager.getInstance().create(node5, node6);

        EdgeModelManager.getInstance().create(node6, node2);
        EdgeModelManager.getInstance().create(node6, node5);
        
        // Connect each nodes.
        node1.addNode(node2, 5);
        node1.addNode(node3, 4);
        node1.addNode(node4, 2);
        
        node2.addNode(node1, 5);
        node2.addNode(node6, 6);
        node2.addNode(node3, 2);
        
        node3.addNode(node2, 2);
        node3.addNode(node1, 4);
        node3.addNode(node4, 3);
        node3.addNode(node5, 2);
        
        node4.addNode(node1, 2);
        node4.addNode(node3, 3);
        node4.addNode(node5, 6);
        
        node5.addNode(node4, 6);
        node5.addNode(node3, 2);
        node5.addNode(node6, 4);
        
        node6.addNode(node2, 6);
        node6.addNode(node5, 4);
        
        return [
            node1, node2, node3, node4, node5, node6
        ];
    }


    function main() {

        var nodes = createNodes();
        
        // start node is first node
        nodes[0].model.cost = 0;
        
        while (true) {
            var processNode = null;

            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                
                // 訪問済み or まだコストが未設定
                if (node.model.done || node.model.cost < 0) {
                    continue;
                }

                if (!processNode) {
                    processNode = node;
                    continue;
                }

                // 一番小さいコストのノードを探す
                if (node.model.cost < processNode.model.cost) {
                    processNode = node;
                }
            }

            if (!processNode) {
                break;
            }

            processNode.model.done = true;

            for (var i = 0; i < processNode.model.edgesTo.length; i++) {
                var node = processNode.model.edgesTo[i];
                var cost = processNode.model.cost + processNode.model.edgesCost[i];

                // コストが未設定 or コストの少ない経路がある場合はアップデート
                var needsUpdate = (node.model.cost < 0) || (node.model.cost > cost);
                if (needsUpdate) {
                    node.model.cost = cost;
                    node.model.previousNode = processNode;
                }
            }
        }
        
        console.log('Has been done to search path.');
        console.log(nodes);

        var goalNode = nodes[5];
        console.log('Shoten cost is ' + goalNode.model.cost);

        console.log('Shoten path');
        
        console.log('=====================');
        var path = 'Goal -> ';
        var currentNode = goalNode;
        var selectedColor = '#fa2';
        while(true) {
            currentNode.color = selectedColor;
            var nextNode = currentNode.model.previousNode;
            if (!nextNode) {
                path += ' Start';
                break;
            }
            path += nextNode.model.id + ' -> ';
            currentNode = nextNode;
        }

        console.log(path);
        console.log('=====================');
    }

    // Start this program.
    main();
}());
