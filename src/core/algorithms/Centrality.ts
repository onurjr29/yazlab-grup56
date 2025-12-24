import { Graph } from '../Graph';
import { Algorithm, AlgorithmResult } from './Algorithm';

export class Centrality implements Algorithm {
    name = 'Degree Centrality';

    run(graph: Graph): AlgorithmResult {
        const startTime = performance.now();
        
        const degrees: { id: string, degree: number }[] = [];
        
        for (const nodeId of graph.nodes.keys()) {
            degrees.push({
                id: nodeId,
                degree: graph.getDegree(nodeId)
            });
        }

        // Sort by degree descending
        degrees.sort((a, b) => b.degree - a.degree);

        const endTime = performance.now();

        return {
            metrics: {
                executionTime: endTime - startTime,
                degrees: degrees,
                top5: degrees.slice(0, 5)
            }
        };
    }
}
