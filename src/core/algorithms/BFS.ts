import { Graph } from '../Graph';
import { Algorithm, AlgorithmResult } from './Algorithm';

export class BFS implements Algorithm {
    name = 'BFS';

    run(graph: Graph, startNodeId: string): AlgorithmResult {
        const startTime = performance.now();
        const visited = new Set<string>();
        const queue: string[] = [startNodeId];
        const resultNodes: string[] = [];
        const resultEdges: string[] = [];

        visited.add(startNodeId);

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            resultNodes.push(nodeId);

            const neighbors = graph.getNeighbors(nodeId);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    queue.push(neighbor.id);
                    
                    // Find the edge connecting them to add to result
                    const edge = Array.from(graph.edges.values()).find(e => 
                        (e.from === nodeId && e.to === neighbor.id) || 
                        (e.from === neighbor.id && e.to === nodeId)
                    );
                    if (edge) resultEdges.push(edge.id);
                }
            }
        }

        const endTime = performance.now();

        return {
            nodes: resultNodes,
            edges: resultEdges,
            metrics: {
                executionTime: endTime - startTime,
                visitedCount: resultNodes.length
            }
        };
    }
}
