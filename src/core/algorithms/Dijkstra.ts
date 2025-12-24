import { Graph } from '../Graph';
import { Algorithm, AlgorithmResult } from './Algorithm';

export class Dijkstra implements Algorithm {
    name = 'Dijkstra';

    run(graph: Graph, startNodeId: string, endNodeId: string): AlgorithmResult {
        const startTime = performance.now();
        
        const distances = new Map<string, number>();
        const previous = new Map<string, string | null>();
        const unvisited = new Set<string>();

        // Initialize
        for (const nodeId of graph.nodes.keys()) {
            distances.set(nodeId, Infinity);
            previous.set(nodeId, null);
            unvisited.add(nodeId);
        }
        distances.set(startNodeId, 0);

        while (unvisited.size > 0) {
            // Find node with min distance
            let minNode: string | null = null;
            let minDist = Infinity;

            for (const nodeId of unvisited) {
                const d = distances.get(nodeId)!;
                if (d < minDist) {
                    minDist = d;
                    minNode = nodeId;
                }
            }

            if (minNode === null || minNode === endNodeId) break; // Target reached or no path

            unvisited.delete(minNode);

            const neighbors = graph.getNeighbors(minNode);
            for (const neighbor of neighbors) {
                if (unvisited.has(neighbor.id)) {
                    // Find edge weight
                    const edge = Array.from(graph.edges.values()).find(e => 
                        (e.from === minNode && e.to === neighbor.id) || 
                        (e.from === neighbor.id && e.to === minNode)
                    );
                    
                    if (edge) {
                        // INTERPRETATION: Weight is Similarity (High = Close).
                        // We want Shortest Path (High Similarity).
                        // Cost = 1 / Weight.
                        // If Weight is 1, Cost is 1. If Weight is 0.1, Cost is 10.
                        const cost = 1 / edge.weight;
                        const alt = distances.get(minNode)! + cost;
                        
                        if (alt < distances.get(neighbor.id)!) {
                            distances.set(neighbor.id, alt);
                            previous.set(neighbor.id, minNode);
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
                distance: distances.get(endNodeId)
            }
        };
    }
}
