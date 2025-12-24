import { Node } from './Node';
import { Edge } from './Edge';

export class Graph {
    nodes: Map<string, Node>;
    edges: Map<string, Edge>;

    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
    }

    addNode(node: Node) {
        this.nodes.set(node.id, node);
    }

    removeNode(nodeId: string) {
        this.nodes.delete(nodeId);
        // Remove connected edges
        for (const [edgeId, edge] of this.edges) {
            if (edge.from === nodeId || edge.to === nodeId) {
                this.edges.delete(edgeId);
            }
        }
        this.recalculateWeights();
    }

    addEdge(edge: Edge) {
        // Check if edge already exists (undirected)
        const existing = Array.from(this.edges.values()).find(e => 
            (e.from === edge.from && e.to === edge.to) || 
            (e.from === edge.to && e.to === edge.from)
        );
        
        if (!existing) {
            this.edges.set(edge.id, edge);
            this.recalculateWeights();
        }
    }

    removeEdge(edgeId: string) {
        this.edges.delete(edgeId);
        this.recalculateWeights();
    }

    getNode(id: string): Node | undefined {
        return this.nodes.get(id);
    }

    getNeighbors(nodeId: string): Node[] {
        const neighbors: Node[] = [];
        for (const edge of this.edges.values()) {
            if (edge.from === nodeId) {
                const node = this.nodes.get(edge.to);
                if (node) neighbors.push(node);
            } else if (edge.to === nodeId) {
                const node = this.nodes.get(edge.from);
                if (node) neighbors.push(node);
            }
        }
        return neighbors;
    }

    getDegree(nodeId: string): number {
        let degree = 0;
        for (const edge of this.edges.values()) {
            if (edge.from === nodeId || edge.to === nodeId) {
                degree++;
            }
        }
        return degree;
    }

    calculateWeight(node1: Node, node2: Node): number {
        const activeDiff = node1.properties.activity - node2.properties.activity;
        const interactDiff = node1.properties.interaction - node2.properties.interaction;
        
        // Use provided connection count or calculate from graph
        const degree1 = node1.properties.connectionCount !== undefined ? node1.properties.connectionCount : this.getDegree(node1.id);
        const degree2 = node2.properties.connectionCount !== undefined ? node2.properties.connectionCount : this.getDegree(node2.id);
        const connDiff = degree1 - degree2;

        const denominator = 1 + Math.pow(activeDiff, 2) + Math.pow(interactDiff, 2) + Math.pow(connDiff, 2);
        return 1 / denominator;
    }

    recalculateWeights() {
        for (const edge of this.edges.values()) {
            const node1 = this.nodes.get(edge.from);
            const node2 = this.nodes.get(edge.to);
            if (node1 && node2) {
                edge.weight = this.calculateWeight(node1, node2);
            }
        }
    }

    clear() {
        this.nodes.clear();
        this.edges.clear();
    }

    // For serialization
    toJSON() {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: Array.from(this.edges.values())
        };
    }

    fromJSON(data: { nodes: any[], edges: any[] }) {
        this.clear();
        data.nodes.forEach(n => {
            const node = new Node(n.id, n.label, n.properties);
            node.x = n.x;
            node.y = n.y;
            node.color = n.color;
            this.addNode(node);
        });
        data.edges.forEach(e => {
            const edge = new Edge(e.id, e.from, e.to, e.weight);
            this.edges.set(edge.id, edge);
        });
        this.recalculateWeights();
    }
}
