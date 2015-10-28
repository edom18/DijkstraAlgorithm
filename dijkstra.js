(function (namespace) {
    'use strict';

    /**
     * Dijkstra path search
     *
     * @param {Array.<Node>} nodes
     */
    function dijkstraSearch(nodes) {

        // initialize costs
        nodes.forEach((node, i) => {
            node.model.cost = -1;
        });
        
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

            // 処理中のノードが見つからない＝探索が終了した
            if (!processNode) {
                break;
            }

            processNode.model.done = true;

            for (var i = 0; i < processNode.model.edges.length; i++) {
                var edge = processNode.model.edges[i];
                var node = edge.getOppositeNodeBy(processNode);
                var cost = processNode.model.cost + edge.cost;

                // コストが未設定 or コストの少ない経路がある場合はアップデート
                var needsUpdate = (node.model.cost < 0) || (node.model.cost > cost);
                if (needsUpdate) {
                    node.model.cost = cost;
                    node.model.previousNode = processNode;
                }
            }

            // for (var i = 0; i < processNode.model.edgesTo.length; i++) {
            //     var node = processNode.model.edgesTo[i];
            //     var cost = processNode.model.cost + processNode.model.edgesCost[i];

            //     // コストが未設定 or コストの少ない経路がある場合はアップデート
            //     var needsUpdate = (node.model.cost < 0) || (node.model.cost > cost);
            //     if (needsUpdate) {
            //         node.model.cost = cost;
            //         node.model.previousNode = processNode;
            //     }
            // }
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

    // Exports
    namespace.dijkstraSearch = dijkstraSearch;
}(window));
