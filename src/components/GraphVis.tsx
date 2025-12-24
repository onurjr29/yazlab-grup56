'use client';

import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Graph } from '../core/Graph';

interface GraphVisProps {
    graph: Graph;
    version: number;
    onNodeClick?: (nodeId: string) => void;
    highlightedNodes?: string[];
    highlightedEdges?: string[];
    nodeColors?: { [key: string]: string };
}

const GraphVis: React.FC<GraphVisProps> = ({ graph, version, onNodeClick, highlightedNodes, highlightedEdges, nodeColors }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<Network | null>(null);
    const nodesDataSet = useRef<DataSet<any>>(new DataSet());
    const edgesDataSet = useRef<DataSet<any>>(new DataSet());

    useEffect(() => {
        if (containerRef.current && !networkRef.current) {
            const data = {
                nodes: nodesDataSet.current,
                edges: edgesDataSet.current
            };
            const options = {
                nodes: {
                    shape: 'dot',
                    size: 16,
                    font: {
                        size: 12,
                        color: '#000000'
                    },
                    borderWidth: 2
                },
                edges: {
                    width: 2,
                    color: { inherit: 'from' },
                    smooth: {
                        enabled: true,
                        type: 'continuous',
                        roundness: 0.5
                    }
                },
                physics: {
                    stabilization: false,
                    barnesHut: {
                        gravitationalConstant: -8000,
                        springConstant: 0.04,
                        springLength: 95
                    }
                },
                interaction: {
                    hover: true
                }
            };

            networkRef.current = new Network(containerRef.current, data, options);

            networkRef.current.on('click', (params) => {
                if (params.nodes.length > 0 && onNodeClick) {
                    onNodeClick(params.nodes[0]);
                }
            });
        }
    }, [onNodeClick]);

    useEffect(() => {
        // Sync graph data with Vis DataSet
        const visNodes = Array.from(graph.nodes.values()).map(node => {
            let color = nodeColors?.[node.id] || '#97C2FC';
            if (highlightedNodes?.includes(node.id)) {
                color = '#FF0000';
            }
            
            return {
                id: node.id,
                label: node.label,
                title: `Activity: ${node.properties.activity}\nInteraction: ${node.properties.interaction}`,
                color: {
                    background: color,
                    border: '#2B7CE9'
                }
            };
        });

        const visEdges = Array.from(graph.edges.values()).map(edge => {
            let color = '#848484';
            let width = 1;
            if (highlightedEdges?.includes(edge.id)) {
                color = '#FF0000';
                width = 3;
            }

            return {
                id: edge.id,
                from: edge.from,
                to: edge.to,
                label: edge.weight.toFixed(2),
                color: color,
                width: width
            };
        });

        nodesDataSet.current.update(visNodes);
        
        // Remove deleted nodes
        const currentIds = new Set(visNodes.map(n => n.id));
        const oldIds = nodesDataSet.current.getIds();
        const toRemoveNodes = oldIds.filter(id => !currentIds.has(String(id)));
        nodesDataSet.current.remove(toRemoveNodes);

        edgesDataSet.current.update(visEdges);
        
        // Remove deleted edges
        const currentEdgeIds = new Set(visEdges.map(e => e.id));
        const oldEdgeIds = edgesDataSet.current.getIds();
        const toRemoveEdges = oldEdgeIds.filter(id => !currentEdgeIds.has(String(id)));
        edgesDataSet.current.remove(toRemoveEdges);

    }, [graph, version, highlightedNodes, highlightedEdges, nodeColors]);

    return <div ref={containerRef} className="w-full h-full border rounded-lg shadow-inner bg-white" />;
};

export default GraphVis;
