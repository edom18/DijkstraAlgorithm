(function () {
    'use strict';

    /**
     * An event dispatcher
     */
    class Dispatcher {
        constructor() {
            this._listeners = {};
        }
        addListener(type, listener) {
            if (!(listener instanceof Listener)) {
                return;
            }

            if (!this._listeners[type]) {
                this._listeners[type] = [];
            }

            this._listeners[type].push(listener);
        }
        removeListener(type, listener) {
            var listeners = this._listeners[type];
            if (!listeners) {
                return;
            }

            var index = -1;
            var hasListener = listeners.some((l, i) => {
                if (l === listener) {
                    index = i;
                    return true;
                }
            });

            if (!hasListener) {
                return;
            }

            listeners.splice(index, 1);
        }
        dispatch(type) {
            var listeners = this._listeners[type];
            if (!listeners) {
                return;
            }

            listeners.forEach((listener, i) => {
                listener.fire();
            });
        }
    }

    /**
     * Event listener
     *
     * @param {Function} func callback function from an event.
     */
    class Listener {
        constructor(func) {
            this._func = func;
        }
        fire() {
            this._func();
        }
    }

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

    /**
     * Shape base class.
     */
    class Shape {
        constructor() {
            this.isHovering = false;
            this.dispatcher = new Dispatcher();
        }
        addListener(type, listener) {
            this.dispatcher.addListener(type, listener);
        }
        removeListener(type, listener) {
            this.dispatcher.removeListener(type, listener);
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
            return false;
        }
        hover() {
            this.isHovering = true;
        }
        unhover() {
            this.isHovering = false;
        }
        click() {
            this.dispatcher.dispatch('click');
        }
    }

    /**
     * A represent dot.
     */
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

    /**
     * A represent edge.
     */
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

    /**
     * A represent scene for the canvas.
     */
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
        click(x, y) {
            this.shapes.forEach((shape, i) => {
                if (shape.hitTest(x, y)) {
                    shape.click();
                }
            });
        }
    }

    /**
     * Canvas 2D renderer
     */
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

    var edge = new Edge(new Point(10, 10), new Point(20, 120));
    edge.color = 'green';
    edge.hoverColor = 'orange';

    scene.add(edge);

    (function loop() {
        renderer.render(scene);
        requestAnimationFrame(loop);
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
