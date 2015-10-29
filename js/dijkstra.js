(function (namespace) {
    'use strict';

    /**
     * Dijkstra path search
     *
     * @param {Array.<Node>} nodes
     */
    function dijkstraSearch(nodes, startId, goalId) {

        // initialize costs
        nodes.forEach((node, i) => {
            node.clear()
        });

        var startNode = nodes[startId];
        var goalNode  = nodes[goalId];
        
        // start node is first node
        startNode.cost = 0;
        
        while (true) {

            var processNode = null;

            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                
                // 訪問済み or まだコストが未設定
                if (node.done || node.cost < 0) {
                    continue;
                }

                if (!processNode) {
                    processNode = node;
                    continue;
                }

                // 一番小さいコストのノードを探す
                if (node.cost < processNode.cost) {
                    processNode = node;
                }
            }

            // 処理中のノードが見つからない＝探索が終了した
            if (!processNode) {
                break;
            }

            processNode.set('done', true);

            for (var i = 0; i < processNode.edges.length; i++) {
                var edge = processNode.edges[i];
                var oppositeNode = edge.getOppositeNodeBy(processNode);
                var cost = processNode.cost + edge.cost;

                // コストが未設定 or コストの少ない経路がある場合はアップデート
                var needsUpdate = (oppositeNode.cost < 0) || (oppositeNode.cost > cost);
                if (needsUpdate) {
                    oppositeNode.set('cost', cost);
                    oppositeNode.set('previousNode', processNode);
                }
            }
        }
        
        console.log('Has been done to search path.');
        console.log(nodes);

        console.log('Shoten cost is ' + goalNode.cost);

        console.log('Shoten path');
        
        console.log('=====================');
        var path = 'Goal -> ';
        var currentNode = goalNode;
        while(true) {
            currentNode.set('adoption', true);

            var nextNode = currentNode.previousNode;

            if (!nextNode) {
                path += ' Start';
                break;
            }

            var adoptionEdge = EdgeManager.getInstance().fetchByNode(currentNode, nextNode);
            adoptionEdge.set('adoption', true);

            path += nextNode.id + ' -> ';
            currentNode = nextNode;
        }

        console.log(path);
        console.log('=====================');
    }

    // Exports
    namespace.dijkstraSearch = dijkstraSearch;

}(window));
