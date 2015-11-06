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

        clear() { }

        /**
         * Validate key and value
         *
         * @param {String} key Key name.
         * @param {String} value Value of the key.
         *
         * @return {Object} result object
         */
        validate(key, value) {
            return true;
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
        set(key, value) {
            var oldValue = this[key];
            if (oldValue === value) {
                return;
            }

            this[key] = value;
            this._dispatcher.dispatch('change', this, {
                name: key,
                newValue: value,
                oldValue: oldValue
            });
        }

        /**
         * Dispose this model
         */
        dispose() {
            this._dispatcher.dispose();
        }
    }

    /**
     * ノード
     */
    class Node extends Model {
        constructor(id) {
            super();

            this.id = id;
            this.edges = [];

            this.clear();

            this._type = 'node';
        }

        set(key, value) {
            var result = this.validate(key, value);
            if (!result.isValid) {
                this._dispatcher.dispatch('error', this, {
                    reason: result.reason,
                    key: key,
                    value: value
                })
                return;
            }

            super.set(key, value);
        }

        /**
         * Validate key and value
         *
         * @param {String} key Key name.
         * @param {String} value Value of the key.
         *
         * @return {Object} result object
         */
        validate(key, value) {
            var result = {
                isValid: true,
                reason: null
            };

            if (key === 'isStart') {
                if (value && this.isGoal) {
                    result.isValid = false;
                    result.reason = 'Cannot set true to both flags.';
                    return result;
                }
            }
            if (key === 'isGoal') {
                if (value && this.isStart) {
                    result.isValid = false;
                    result.reason = 'Cannot set true to both flags.';
                    return result;
                }
            }

            return result;
        }

        start() {
            this.set('done', false);
            this.set('cost', -1);
            this.set('adoption', false);
            this.set('previousNode', null);

            this.edges.forEach((edge, i) => {
                edge.start();
            });
        }

        clear() {
            this.set('done', false);
            this.set('cost', -1);
            this.set('adoption', false);
            this.set('previousNode', null);
            this.set('isStart', false);
            this.set('isGoal', false);
        }

        addEdge(edge) {
            if (this.containsEdge(edge)) {
                return;
            }

            this.edges.push(edge);
        }

        containsEdge(edge) {
            var hasEdge = this.edges.some((ie, i) => {
                if (ie === edge) {
                    return true;
                }
            });
            return hasEdge;
        }
    }

    class NodeManager {
        constructor() {
            this._nodes = [];
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new this();
            }
            return this._instance;
        }
        get nodes() {
            return this._nodes.slice();
        }

        checkStartFlag(targetNode, referData) {
            if (referData.name !== 'isStart') {
                return;
            }

            if (referData.newValue === false) {
                return;
            }

            var existStart = this._nodes.some((node, i) => {
                if (node === targetNode) {
                    return false;
                }

                if (node.isStart === true) {
                    return true;
                }
            });
            if (existStart) {
                console.log('Must set start flag to just one node.');

                targetNode.set('isStart', false);
            }
        }

        checkGoalFlag(targetNode, referData) {
            if (referData.name !== 'isGoal') {
                return;
            }

            if (referData.newValue === false) {
                return;
            }

            var existGoal = this._nodes.some((node, i) => {
                if (node === targetNode) {
                    return false;
                }

                if (node.isGoal === true) {
                    return true;
                }
            });
            if (existGoal) {
                console.log('Must set goal flag to just one node.');

                targetNode.set('isGoal', false);
            }
        }

        changeHandler(target, referData) {
            this.checkStartFlag(target, referData);
            this.checkGoalFlag(target, referData);
        }


        /**
         * Create a node
         * This is a factory method.
         */
        create(id) {
            var model = this.fetchById(id);
            if (!model) {
                model = new Node(id);
                model.addListener(new Listener('change', this.changeHandler.bind(this)));
                this.add(model);
            }
            return model;
        }

        /**
         * Add a model
         */
        add(model) {
            this._nodes.push(model);
        }

        /**
         * Remove a model
         */
        remove(model) {
            var index = -1;
            var hasNode = this._nodes.some((node, i) => {
                if (model.id === node.id) {
                    index = i;
                    return true;
                }
            });

            if (hasNode) {
                var removedModel = this._nodes.splice(index, 1)[0];
                removedModel.dispose();
            }
        }

        /**
         * Fetch a model by id
         *
         * @param {String} id
         */
        fetchById(id) {
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

    class Edge extends Model {
        constructor(nodeA, nodeB) {
            super();

            this._nodeA = nodeA;
            this._nodeB = nodeB;
            this._cost  = 1;

            this.set('adoption', false);

            this._id = EdgeManager.getInstance().generateId(nodeA, nodeB);

            this._type = 'edge';
        }

        set(key, value) {
            var result = this.validate(key, value);
            if (!result.isValid) {
                this._dispatcher.dispatch('error', this, {
                    reason: result.reason,
                    key: key,
                    value: value
                })
                return;
            }

            super.set(key, value);
        }

        /**
         * Validate key and value
         *
         * @param {String} key Key name.
         * @param {String} value Value of the key.
         *
         * @return {Object} result object
         */
        validate(key, value) {
            var result = {
                isValid: true,
                reason: null
            };

            if (key === 'cost') {
                if (value < 0) {
                    result.isValid = false;
                    result.reason  = 'Cannnot set the value under 0.';
                    return result;
                }
            }

            return result;
        }

        clear() {
            this.set('adoption', false);
        }

        start() {
            this.set('adoption', false);
        }

        getOppositeNodeBy(node) {
            if (this._nodeA.id === node.id) {
                return this._nodeB;
            }
            else if (this._nodeB.id === node.id) {
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

    class EdgeManager {
        constructor() {
            this._edges = [];
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new EdgeManager();
            }
            return this._instance;
        }
        get edges() {
            return this._edges;
        }

        connect(nodeA, nodeB, cost) {
            var edge = this.create(nodeA, nodeB);
            edge.cost = cost;

            nodeA.addEdge(edge);
            nodeB.addEdge(edge);
        }

        create(nodeA, nodeB) {
            var id = this.generateId(nodeA, nodeB);
            var model = this.fetchById(id);
            if (!model) {
                model = new Edge(nodeA, nodeB);
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
            var idA = +nodeA.id;
            var idB = +nodeB.id;

            var id = '';
            if (idA < idB) {
                id = `${idA}-${idB}`;
            }
            else {
                id = `${idB}-${idA}`;
            }

            return id;
        }

        fetchById(id) {
            var model = null;
            this._edges.some((edge, i) => {
                if (edge.id === id) {
                    model = edge;
                    return true;
                }
            });
            return model;
        }

        fetchByNode(nodeA, nodeB) {
            var id = this.generateId(nodeA, nodeB);
            return this.fetchById(id);
        }
    }

    // Exports.
    namespace.Model       = Model;
    namespace.Node        = Node;
    namespace.Edge        = Edge;
    namespace.NodeManager = NodeManager;
    namespace.EdgeManager = EdgeManager;

}(window));
