import { Graph } from '../Graph';

export interface AlgorithmResult {
    nodes?: string[]; // List of node IDs in order or result
    edges?: string[]; // List of edge IDs involved
    path?: string[]; // For pathfinding
    metrics?: any; // Execution time, etc.
    explanation?: string;
}

export interface Algorithm {
    name: string;
    run(graph: Graph, ...args: any[]): AlgorithmResult;
}
