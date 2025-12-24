'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useGraph } from '@/hooks/useGraph';
import ControlPanel from '@/components/ControlPanel';
import ResultsPanel from '@/components/ResultsPanel';
import { BFS } from '@/core/algorithms/BFS';
import { DFS } from '@/core/algorithms/DFS';
import { Dijkstra } from '@/core/algorithms/Dijkstra';
import { AStar } from '@/core/algorithms/AStar';
import { ConnectedComponents } from '@/core/algorithms/ConnectedComponents';
import { Centrality } from '@/core/algorithms/Centrality';
import { WelshPowell } from '@/core/algorithms/WelshPowell';
import { AlgorithmResult } from '@/core/algorithms/Algorithm';

const GraphVis = dynamic(() => import('@/components/GraphVis'), { ssr: false });

export default function Home() {
    const { graph, version, addNode, addEdge, removeNode, removeEdge, updateNode, clear, loadData, refresh } = useGraph();
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    const [algorithmResult, setAlgorithmResult] = useState<AlgorithmResult | null>(null);
    const [lastAlgorithm, setLastAlgorithm] = useState<string | null>(null);
    
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
    const [nodeColors, setNodeColors] = useState<{ [key: string]: string }>({});

    const handleRunAlgorithm = (name: string, ...args: any[]) => {
        let result: AlgorithmResult | null = null;
        
        // Reset visualization
        setHighlightedNodes([]);
        setHighlightedEdges([]);
        setNodeColors({});

        try {
            switch (name) {
                case 'BFS':
                    if (!args[0]) return alert('Select Start Node');
                    result = new BFS().run(graph, args[0]);
                    break;
                case 'DFS':
                    if (!args[0]) return alert('Select Start Node');
                    result = new DFS().run(graph, args[0]);
                    break;
                case 'Dijkstra':
                    if (!args[0] || !args[1]) return alert('Select Start and End Nodes');
                    result = new Dijkstra().run(graph, args[0], args[1]);
                    break;
                case 'A*':
                    if (!args[0] || !args[1]) return alert('Select Start and End Nodes');
                    result = new AStar().run(graph, args[0], args[1]);
                    break;
                case 'ConnectedComponents':
                    result = new ConnectedComponents().run(graph);
                    break;
                case 'Centrality':
                    result = new Centrality().run(graph);
                    break;
                case 'WelshPowell':
                    result = new WelshPowell().run(graph);
                    break;
            }

            if (result) {
                setAlgorithmResult(result);
                setLastAlgorithm(name);

                // Visualization updates
                if (result.path) {
                    setHighlightedNodes(result.path);
                    // Find edges in path
                    const edges: string[] = [];
                    for (let i = 0; i < result.path.length - 1; i++) {
                        const u = result.path[i];
                        const v = result.path[i+1];
                        const edge = Array.from(graph.edges.values()).find(e => 
                            (e.from === u && e.to === v) || (e.from === v && e.to === u)
                        );
                        if (edge) edges.push(edge.id);
                    }
                    setHighlightedEdges(edges);
                } else if (result.nodes && (name === 'BFS' || name === 'DFS')) {
                    setHighlightedNodes(result.nodes);
                    if (result.edges) setHighlightedEdges(result.edges);
                } else if (name === 'WelshPowell' && result.metrics?.colors) {
                    const colors = result.metrics.colors;
                    const palette = ['#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF', '#99FFFF', '#FFCC99', '#CCFF99'];
                    const newColors: { [key: string]: string } = {};
                    for (const [nodeId, colorIndex] of Object.entries(colors)) {
                        newColors[nodeId] = palette[Number(colorIndex) % palette.length];
                    }
                    setNodeColors(newColors);
                } else if (name === 'ConnectedComponents' && result.metrics?.components) {
                    const components = result.metrics.components as string[][];
                    const palette = ['#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF', '#99FFFF', '#FFCC99', '#CCFF99'];
                    const newColors: { [key: string]: string } = {};
                    
                    components.forEach((component, index) => {
                        const color = palette[index % palette.length];
                        component.forEach(nodeId => {
                            newColors[nodeId] = color;
                        });
                    });
                    setNodeColors(newColors);
                } else if (name === 'Centrality' && result.metrics?.top5) {
                     const top5Ids = result.metrics.top5.map((n: any) => n.id);
                     setHighlightedNodes(top5Ids);
                }
            }
        } catch (e) {
            console.error(e);
            alert('Error running algorithm: ' + e);
        }
    };

    const handleLoadSample = () => {
        // Create a sample graph
        clear();
        // Add nodes
        const n1 = addNode('User 1', { activity: 0.8, interaction: 12 });
        const n2 = addNode('User 2', { activity: 0.4, interaction: 5 });
        const n3 = addNode('User 3', { activity: 0.6, interaction: 8 });
        const n4 = addNode('User 4', { activity: 0.9, interaction: 15 });
        const n5 = addNode('User 5', { activity: 0.2, interaction: 2 });

        // Add edges
        addEdge(n1, n2);
        addEdge(n1, n3);
        addEdge(n2, n3);
        addEdge(n3, n4);
        addEdge(n4, n5);
        
        // Force refresh to calculate weights properly after all connections
        // Actually addEdge triggers recalculateWeights internally but only for existing edges.
        // Since we add edges sequentially, it should be fine.
    };

    return (
        <main className="flex h-screen w-screen overflow-hidden">
            <div className="w-1/4 h-full border-r border-gray-300 bg-gray-50 flex flex-col text-black">
                <ControlPanel 
                    graph={graph}
                    onAddNode={(l, a, i, c) => addNode(l, { activity: a, interaction: i, connectionCount: c })}
                    onAddEdge={addEdge}
                    onRemoveNode={removeNode}
                    onRemoveEdge={removeEdge}
                    onUpdateNode={updateNode}
                    onRunAlgorithm={handleRunAlgorithm}
                    onClear={clear}
                    onLoadSample={handleLoadSample}
                    onImport={loadData}
                    selectedNodeId={selectedNodeId}
                />
                <div className="flex-1 overflow-y-auto p-2">
                    <ResultsPanel result={algorithmResult} algorithmName={lastAlgorithm} />
                </div>
            </div>
            <div className="w-3/4 h-full relative">
                <GraphVis 
                    graph={graph} 
                    version={version} 
                    onNodeClick={setSelectedNodeId}
                    highlightedNodes={highlightedNodes}
                    highlightedEdges={highlightedEdges}
                    nodeColors={nodeColors}
                />
                <div className="absolute top-4 right-4 bg-white/80 p-2 rounded shadow text-xs text-black">
                    <p>Click node to select.</p>
                    <p>Scroll to zoom.</p>
                    <p>Drag to pan.</p>
                </div>
            </div>
        </main>
    );
}
