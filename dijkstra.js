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
            node.model.clear()
        });

        var startNodeView = nodes[startId];
        var goalNodeView  = nodes[goalId];
        
        // start node is first node
        startNodeView.model.cost = 0;
        
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

            // 処理中のノードが見つからない＝探索が終了した
            if (!processNode) {
                break;
            }

            processNode.model.done = true;

            for (var i = 0; i < processNode.model.edges.length; i++) {
                var edge = processNode.model.edges[i];
                var oppositeNode = edge.getOppositeNodeBy(processNode.model);
                var cost = processNode.model.cost + edge.cost;

                // コストが未設定 or コストの少ない経路がある場合はアップデート
                var needsUpdate = (oppositeNode.cost < 0) || (oppositeNode.cost > cost);
                if (needsUpdate) {
                    oppositeNode.cost = cost;
                    oppositeNode.previousNode = processNode.model;
                }
            }
        }
        
        console.log('Has been done to search path.');
        console.log(nodes);

        console.log('Shoten cost is ' + goalNodeView.model.cost);

        console.log('Shoten path');
        
        console.log('=====================');
        var path = 'Goal -> ';
        var currentNode = goalNodeView.model;
        while(true) {
            currentNode.set('adoption', true);

            var nextNode = currentNode.previousNode;
            if (!nextNode) {
                path += ' Start';
                break;
            }
            path += nextNode.id + ' -> ';
            currentNode = nextNode;
        }

        console.log(path);
        console.log('=====================');
    }

    // Exports
    namespace.dijkstraSearch = dijkstraSearch;

}(window));
