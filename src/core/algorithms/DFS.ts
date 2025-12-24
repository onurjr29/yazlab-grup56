import { Graph } from '../Graph';
import { Algorithm, AlgorithmResult } from './Algorithm';

export class DFS implements Algorithm {
    name = 'DFS';

    run(graph: Graph, startNodeId: string): AlgorithmResult {
        const startTime = performance.now();
        const visited = new Set<string>();
        const resultNodes: string[] = [];
        const resultEdges: string[] = [];

        const stack: string[] = [startNodeId];

        while (stack.length > 0) {
            const nodeId = stack.pop()!;
            
            if (!visited.has(nodeId)) {
                visited.add(nodeId);
                resultNodes.push(nodeId);

                const neighbors = graph.getNeighbors(nodeId);
                // Reverse to process in expected order if needed, but standard DFS doesn't strictly require it
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor.id)) {
                        stack.push(neighbor.id);
                         // Find edge (optional for visualization of traversal tree)
                         const edge = Array.from(graph.edges.values()).find(e => 
                            (e.from === nodeId && e.to === neighbor.id) || 
                            (e.from === neighbor.id && e.to === nodeId)
                        );
                        if (edge) resultEdges.push(edge.id);
                    }
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
