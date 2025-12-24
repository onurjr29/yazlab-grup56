import { useState, useCallback, useRef } from 'react';
import { Graph } from '../core/Graph';
import { Node, NodeProperties } from '../core/Node';
import { Edge } from '../core/Edge';
import { v4 as uuidv4 } from 'uuid';

export const useGraph = () => {
    const graphRef = useRef<Graph>(new Graph());
    const [version, setVersion] = useState(0); // To trigger re-renders

    const refresh = useCallback(() => {
        setVersion(v => v + 1);
    }, []);

    const addNode = useCallback((label: string, properties: NodeProperties) => {
        const id = uuidv4();
        const node = new Node(id, label, properties);
        graphRef.current.addNode(node);
        refresh();
        return id;
    }, [refresh]);

    const removeNode = useCallback((id: string) => {
        graphRef.current.removeNode(id);
        refresh();
    }, [refresh]);

    const addEdge = useCallback((from: string, to: string) => {
        const id = uuidv4();
        const edge = new Edge(id, from, to);
        graphRef.current.addEdge(edge);
        refresh();
    }, [refresh]);

    const removeEdge = useCallback((id: string) => {
        graphRef.current.removeEdge(id);
        refresh();
    }, [refresh]);

    const updateNode = useCallback((id: string, properties: Partial<NodeProperties>) => {
        const node = graphRef.current.getNode(id);
        if (node) {
            node.properties = { ...node.properties, ...properties };
            graphRef.current.recalculateWeights(); // Properties changed, weights change
            refresh();
        }
    }, [refresh]);

    const clear = useCallback(() => {
        graphRef.current.clear();
        refresh();
    }, [refresh]);

    const loadData = useCallback((data: any) => {
        graphRef.current.fromJSON(data);
        refresh();
    }, [refresh]);

    return {
        graph: graphRef.current,
        version,
        addNode,
        removeNode,
        addEdge,
        removeEdge,
        updateNode,
        clear,
        loadData,
        refresh
    };
};
