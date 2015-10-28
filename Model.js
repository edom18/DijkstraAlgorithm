(function (namespace) {
    'use strict';


    /**
     *  Base of model.
     */
    class Model {
        constructor() {
            this._dispatcher = new Dispatcher();
            this._type = '';
        }
        get type() {
            return this._type;
        }
        addListener(type, listener) {
            this._dispatcher.addListener(type, listener);
        }
        removeListener(type, listener) {
            this._dispatcher.removeListener(type, listener);
        }
        dispatch(type) {
            this._dispatcher.dispatch(type);
        }
    }

    /**
     * ノード
     */
    class NodeModel extends Model {
        constructor() {
            super();

            this.edges        = [];
            this.done         = false;
            this.cost         = -1;
            this.id           = -1;
            this.previousNode = null;

            this._type = 'node';
        }

        addEdge(edgeModel) {
            if (this.containsEdge(edgeModel)) {
                return;
            }

            this.edges.push(edgeModel);
        }

        containsEdge(edgeModel) {
            var hasEdge = this.edges.some((edge, i) => {
                if (edge === edgeModel) {
                    return true;
                }
            });
            return hasEdge;
        }
    }

    class NodeModelManager {
        constructor() {
            this._nodes = [];
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new NodeModelManager();
            }
            return this._instance;
        }
        get nodes() {
            return this._nodes;
        }
        create(id) {
            var model = this.fetch(id);
            if (!model) {
                model = new NodeModel(id);
                this.add(model);
            }
            return model;
        }
        add(model) {
            this._nodes.push(model);
        }
        remove(model) {
            var index = -1;
            var hasNode = this._nodes.some((node, i) => {
                if (model.id === node.id) {
                    index = i;
                    return true;
                }
            });

            if (hasNode) {
                this._nodes.splice(index, 1);
            }
        }
        fetch(id) {
            var model = null;
            this._nodes.some((node, i) => {
                if (node.id === id) {
                    model = node;
                    return true;
                }
            });
            return model;
        }
    }

    class EdgeModel extends Model {
        constructor(nodeA, nodeB) {
            super();

            this._nodeA = nodeA;
            this._nodeB = nodeB;
            this._cost  = 1;

            this._id = EdgeModelManager.getInstance().generateId(nodeA, nodeB);

            this._type = 'edge';
        }
        getOppositeNodeBy(node) {
            if (this._nodeA.model.id === node.model.id) {
                return this._nodeB;
            }
            else if (this._nodeB.model.id === node.model.id) {
                return this._nodeA;
            }
            return null;
        }
        get id() {
            return this._id;
        }
        get nodeA() {
            return this._nodeA;
        }
        get nodeB() {
            return this._nodeB;
        }
        set cost(value) {
            this._cost = value;
        }
        get cost() {
            return this._cost;
        }
    }

    class EdgeModelManager {
        constructor() {
            this._edges = [];
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new EdgeModelManager();
            }
            return this._instance;
        }
        get edges() {
            return this._edges;
        }
        create(nodeA, nodeB) {
            var id = this.generateId(nodeA, nodeB);
            var model = this.fetch(id);
            if (!model) {
                model = new EdgeModel(nodeA, nodeB);
                this.add(model);
            }

            return model;
        }
        add(model) {
            this._edges.push(model);
        }
        remove(model) {
            var index = -1;
            var hasEdge = this._edges.some((edge, i) => {
                if (model.id === edge.id) {
                    index = i;
                    return true;
                }
            });

            if (hasEdge) {
                this._edges.splice(index, 1);
            }
        }
        generateId(nodeA, nodeB) {
            var idA = +nodeA.model.id;
            var idB = +nodeB.model.id;

            var id = '';
            if (idA < idB) {
                id = `${idA}-${idB}`;
            }
            else {
                id = `${idB}-${idA}`;
            }

            return id;
        }
        fetch(id) {
            var model = null;
            this._edges.some((edge, i) => {
                if (edge.id === id) {
                    model = edge;
                    return true;
                }
            });
            return model;
        }
    }

    // Exports.
    namespace.Model            = Model;
    namespace.NodeModel        = NodeModel;
    namespace.EdgeModel        = EdgeModel;
    namespace.NodeModelManager = NodeModelManager;
    namespace.EdgeModelManager = EdgeModelManager;

}(window));
