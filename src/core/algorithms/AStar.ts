import { Graph } from '../Graph';
import { Algorithm, AlgorithmResult } from './Algorithm';

export class AStar implements Algorithm {
    name = 'A*';

    run(graph: Graph, startNodeId: string, endNodeId: string): AlgorithmResult {
        const startTime = performance.now();
        
        const gScore = new Map<string, number>(); // Cost from start to node
        const fScore = new Map<string, number>(); // Estimated total cost
        const previous = new Map<string, string | null>();
        const openSet = new Set<string>();

        // Initialize
        for (const nodeId of graph.nodes.keys()) {
            gScore.set(nodeId, Infinity);
            fScore.set(nodeId, Infinity);
            previous.set(nodeId, null);
        }
        
        gScore.set(startNodeId, 0);
        fScore.set(startNodeId, this.heuristic(graph, startNodeId, endNodeId));
        openSet.add(startNodeId);

        while (openSet.size > 0) {
            // Find node in openSet with lowest fScore
            let current: string | null = null;
            let minF = Infinity;

            for (const nodeId of openSet) {
                const f = fScore.get(nodeId)!;
                if (f < minF) {
                    minF = f;
                    current = nodeId;
                }
            }

            if (current === null || current === endNodeId) break;

            openSet.delete(current);

            const neighbors = graph.getNeighbors(current);
            for (const neighbor of neighbors) {
                const edge = Array.from(graph.edges.values()).find(e => 
                    (e.from === current && e.to === neighbor.id) || 
                    (e.from === neighbor.id && e.to === current)
                );

                if (edge) {
                    const cost = 1 / edge.weight;
                    const tentativeG = gScore.get(current)! + cost;

                    if (tentativeG < gScore.get(neighbor.id)!) {
                        previous.set(neighbor.id, current);
                        gScore.set(neighbor.id, tentativeG);
                        fScore.set(neighbor.id, tentativeG + this.heuristic(graph, neighbor.id, endNodeId));
                        
                        if (!openSet.has(neighbor.id)) {
                            openSet.add(neighbor.id);
                        }
                    }
                }
            }
        }

        // Reconstruct path
        const path: string[] = [];
        let current: string | null = endNodeId;
        if (previous.get(endNodeId) || startNodeId === endNodeId) {
            while (current) {
                path.unshift(current);
                current = previous.get(current) || null;
            }
        }

        const endTime = performance.now();

        return {
            path: path,
            metrics: {
                executionTime: endTime - startTime,
                distance: gScore.get(endNodeId)
            }
        };
    }

    heuristic(graph: Graph, nodeId: string, targetId: string): number {
        const node = graph.getNode(nodeId);
        const target = graph.getNode(targetId);
        if (!node || !target) return 0;

        // Lower bound of cost: 1 + (Active_diff)^2
        // Since Cost = 1 + (Active_diff)^2 + (Interact_diff)^2 + (Conn_diff)^2
        const activeDiff = node.properties.activity - target.properties.activity;
        return 1 + Math.pow(activeDiff, 2);
    }
}
