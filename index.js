(function () {
    'use strict';

    /**
     * @para {Number} x
     * @para {Number} y
     */
    class Point {
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
    }

    class NodeRenderer {
        constructor(node, point) {
            this.node = node;
            this.point = point;
            this.color = '#2af';
            this.element = document.createElement('div');
            this.element.classList.add('node');
            this.update();
        }
        render() {
            this.update();
            if (!this.element.parentNode) {
                document.body.appendChild(this.element);
            }
        }
        update() {
            this.element.style.left = `${this.point.x}px`;
            this.element.style.top = `${this.point.y}px`;
            this.element.style.background = this.color;
        }
    }


    /**
     * ノード
     */
    class NodeModel {
        constructor() {
            this.edgesTo      = [];
            this.edgesCost    = [];
            this.done         = false;
            this.cost         = -1;
            this.id           = -1;
            this.previousNode = null;
        }
    }

    class Node {
        constructor(id) {
            this.model = new NodeModel();
            this.model.id = id;
            this.renderer = new NodeRenderer(this, new Point());
        }
        addNode(node, cost) {
            this.model.edgesTo.push(node);
            this.model.edgesCost.push(cost);
        }
        render() {
            this.renderer.render();
        }
        get point() {
            return this.renderer.point;
        }
        set point(value) {
            this.renderer.point = value;
            this.renderer.update();
        }
        get color () {
            return this.renderer.color;
        }
        set color(value) {
            this.renderer.color = value;
            this.renderer.update();
        }
    }

    class Shape {
        constructor() {
            this.isHovering = false;
        }
        draw(context) {
            //
        }
        set color(value) {
            this._color = value;
        }
        get color() {
            return this._color;
        }
        set hoverColor(value) {
            this._hoverColor = value;
        }
        get hoverColor() {
            return this._hoverColor;
        }
        hitTest(x, y) {
            //
        }
        hover() {
            this.isHovering = true;
        }
        unhover() {
            this.isHovering = false;
        }
    }

    class Dot extends Shape {
        constructor(x, y, radius) {
            super();
            this.x = x || 0;
            this.y = y || 0;
            this.radius = radius || 5;
        }
        draw(context) {
            super.draw(context);

            context.save();
            context.beginPath();
            context.translate(this.x, this.y);
            context.arc(0, 0, this.radius, Math.PI * 2, false);
            context.closePath();
            context.fillStyle = this.isHovering ? this.hoverColor : this.color;
            context.fill();
            context.restore();
        }
        hitTest(x, y) {
            super.hitTest(x, y);

            var _x = x - this.x;
            var _y = y - this.y;

            var length = Math.sqrt((_x * _x) + (_y * _y));
            return length < this.radius;
        }
    }

    class Edge extends Shape {
        constructor(start, end) {
            super();
            this.start = start;
            this.end   = end;

            this.dx = this.end.x - this.start.x;
            this.dy = this.end.y - this.start.y;
            this.a  = this.dx * this.dx + this.dy * this.dy;
            this.detectDistance = 10;
        } 
        draw(context) {
            super.draw(context);
            
            context.save();
            context.beginPath();
            context.moveTo(this.start.x, this.start.y);
            context.lineTo(this.end.x, this.end.y);
            context.closePath();
            context.strokeStyle = this.isHovering ? this.hoverColor : this.color;
            context.stroke();
            context.restore();
        }
        checkShotenPoint(px, py) {
            if (this.a === 0) {
                var _x = this.start.x - px;
                var _y = this.start.y - py;
                return Math.sqrt(_x * _x + _y * _y);
            }

            var b = this.dx * (this.start.x - px) + this.dy * (this.start.y - py);
            var t = -(b / this.a);

            if (t < 0.0) {
                t = 0.0;
            }
            if (t > 1.0) {
                t = 1.0;
            }

            var x = t * this.dx + this.start.x;
            var y = t * this.dy + this.start.y;

            var rx = x - px;
            var ry = y - py;

            return Math.sqrt(rx * rx + ry * ry);
        }
        hitTest(x, y) {
            var distance  = this.checkShotenPoint(x, y);
            return distance < this.detectDistance;
        }
    }

    class Scene {
        constructor() {
            this.shapes = [];
        }
        add(shape) {
            if (!(shape instanceof Shape)) {
                return;
            }
            this.shapes.push(shape);
        }
        remove(shape) {
            var index = -1;
            var hasShape = this.shapes.some(function (s, i) {
                if (s === shape) {
                    index = i;
                    return true;
                }
            });

            if (!hasShape) {
                return;
            }

            this.shapes.splice(index, 1);
        }
        hover(x, y) {
            this.shapes.forEach((shape, i) => {
                if (shape.hitTest(x, y)) {
                    shape.hover();
                    return;
                }
                shape.unhover();
            });
        }
    }

    class Renderer {
        constructor(width, height) {
            this.element = document.createElement('canvas');
            this.context = this.element.getContext('2d');
            this.element.width  = width;
            this.element.height = height;
        }
        render(scene) {
            this.context.clearRect(0, 0, this.element.width, this.element.height);
            scene.shapes.forEach(function (shape, i) {
                shape.draw(this.context);
            }, this);
        }
    }


    // debug
    var scene = new Scene();
    var renderer = new Renderer(300, 300);
    document.body.appendChild(renderer.element);
    renderer.element.addEventListener('mousemove', function (e) {
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        scene.hover(x, y);
    }, false);


    var dot = new Dot(50, 50);
    dot.color = 'red';
    dot.hoverColor = 'orange';
    var dot2 = new Dot(50, 80);
    dot2.color = 'blue';
    dot2.hoverColor = 'orange';

    var edge = new Edge(new Point(10, 10), new Point(20, 120));
    edge.color = 'green';
    edge.hoverColor = 'orange';

    scene.add(dot);
    scene.add(dot2);
    scene.add(edge);


    (function loop() {
        renderer.render(scene);
        requestAnimationFrame(loop);
    }());








    function createNodes() {
        var node1 = new Node(1); // start
        var node2 = new Node(2); // top
        var node3 = new Node(3); // center
        var node4 = new Node(4); // bottom-left
        var node5 = new Node(5); // bottom-right
        var node6 = new Node(6); // goal

        var node1Point = new Point(10, 150);
        var node2Point = new Point(80, 10);
        var node3Point = new Point(100, 160);
        var node4Point = new Point(60, 300);
        var node5Point = new Point(150, 310);
        var node6Point = new Point(200, 140);

        node1.point = node1Point;
        node1.render();

        node2.point = node2Point;
        node2.render();

        node3.point = node3Point;
        node3.render();

        node4.point = node4Point;
        node4.render();

        node5.point = node5Point;
        node5.render();

        node6.point = node6Point;
        node6.render();

        
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
