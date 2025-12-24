import { Graph } from '../Graph';
import { Algorithm, AlgorithmResult } from './Algorithm';

export class WelshPowell implements Algorithm {
    name = 'Welsh-Powell Coloring';

    run(graph: Graph): AlgorithmResult {
        const startTime = performance.now();
        
        // 1. Sort nodes by degree descending
        const nodes = Array.from(graph.nodes.values());
        nodes.sort((a, b) => graph.getDegree(b.id) - graph.getDegree(a.id));

        const colors = new Map<string, number>(); // NodeID -> ColorIndex
        
        for (const node of nodes) {
            if (colors.has(node.id)) continue;

            // Assign a new color
            let colorIndex = 0;
            
            // Find the first valid color
            while (true) {
                let canUseColor = true;
                const neighbors = graph.getNeighbors(node.id);
                
                for (const neighbor of neighbors) {
                    if (colors.has(neighbor.id) && colors.get(neighbor.id) === colorIndex) {
                        canUseColor = false;
                        break;
                    }
                }

                if (canUseColor) {
                    colors.set(node.id, colorIndex);
                    break;
                }
                colorIndex++;
            }
        }

        const endTime = performance.now();

        return {
            metrics: {
                executionTime: endTime - startTime,
                colors: Object.fromEntries(colors),
                chromaticNumber: Math.max(...Array.from(colors.values())) + 1
            }
        };
    }
}
