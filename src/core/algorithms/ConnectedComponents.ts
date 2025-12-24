import { Graph } from '../Graph';
import { Algorithm, AlgorithmResult } from './Algorithm';

export class ConnectedComponents implements Algorithm {
    name = 'Connected Components';

    run(graph: Graph): AlgorithmResult {
        const startTime = performance.now();
        const visited = new Set<string>();
        const components: string[][] = [];

        for (const nodeId of graph.nodes.keys()) {
            if (!visited.has(nodeId)) {
                const component: string[] = [];
                const queue: string[] = [nodeId];
                visited.add(nodeId);

                while (queue.length > 0) {
                    const current = queue.shift()!;
                    component.push(current);

                    const neighbors = graph.getNeighbors(current);
                    for (const neighbor of neighbors) {
                        if (!visited.has(neighbor.id)) {
                            visited.add(neighbor.id);
                            queue.push(neighbor.id);
                        }
                    }
                }
                components.push(component);
            }
        }

        const endTime = performance.now();

        return {
            metrics: {
                executionTime: endTime - startTime,
                componentCount: components.length,
                components: components // Custom field
            }
        };
    }
}
