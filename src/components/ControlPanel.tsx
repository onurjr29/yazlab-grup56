import React, { useState, useRef } from 'react';
import { Graph } from '../core/Graph';
import { Node } from '../core/Node';

interface ControlPanelProps {
    graph: Graph;
    onAddNode: (label: string, activity: number, interaction: number, connectionCount?: number) => void;
    onAddEdge: (from: string, to: string) => void;
    onRemoveNode: (id: string) => void;
    onRemoveEdge: (id: string) => void;
    onUpdateNode: (id: string, properties: any) => void;
    onRunAlgorithm: (name: string, ...args: any[]) => void;
    onClear: () => void;
    onLoadSample: () => void;
    onImport: (data: any) => void;
    selectedNodeId?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    graph, onAddNode, onAddEdge, onRemoveNode, onRemoveEdge, onUpdateNode, onRunAlgorithm, onClear, onLoadSample, onImport, selectedNodeId 
}) => {
    const [newNodeLabel, setNewNodeLabel] = useState('');
    const [newNodeActivity, setNewNodeActivity] = useState(0);
    const [newNodeInteraction, setNewNodeInteraction] = useState(0);
    const [newNodeConnectionCount, setNewNodeConnectionCount] = useState<number | ''>('');
    
    const [edgeFrom, setEdgeFrom] = useState('');
    const [edgeTo, setEdgeTo] = useState('');

    const [algoStartNode, setAlgoStartNode] = useState('');
    const [algoEndNode, setAlgoEndNode] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update state for selected node
    const [updateActivity, setUpdateActivity] = useState<number | ''>('');
    const [updateInteraction, setUpdateInteraction] = useState<number | ''>('');

    // Sync update state when selected node changes
    React.useEffect(() => {
        if (selectedNodeId) {
            const node = graph.getNode(selectedNodeId);
            if (node) {
                setUpdateActivity(node.properties.activity);
                setUpdateInteraction(node.properties.interaction);
            }
        }
    }, [selectedNodeId, graph]);

    const handleUpdateNode = () => {
        if (selectedNodeId && updateActivity !== '' && updateInteraction !== '') {
            onUpdateNode(selectedNodeId, {
                activity: Number(updateActivity),
                interaction: Number(updateInteraction)
            });
        }
    };

    const handleAddNode = () => {
        if (newNodeLabel) {
            onAddNode(newNodeLabel, Number(newNodeActivity), Number(newNodeInteraction), newNodeConnectionCount === '' ? undefined : Number(newNodeConnectionCount));
            setNewNodeLabel('');
            setNewNodeActivity(0);
            setNewNodeInteraction(0);
            setNewNodeConnectionCount('');
        }
    };

    const handleAddEdge = () => {
        if (edgeFrom && edgeTo && edgeFrom !== edgeTo) {
            onAddEdge(edgeFrom, edgeTo);
            setEdgeFrom('');
            setEdgeTo('');
        }
    };

    const handleExportJSON = () => {
        const data = JSON.stringify(graph.toJSON(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'social_network_graph.json';
        a.click();
    };

    const handleExportCSV = () => {
        const nodes = Array.from(graph.nodes.values());
        // Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Activity,Interaction,Degree,Neighbors\n";
        
        nodes.forEach(node => {
            const degree = graph.getDegree(node.id);
            const neighbors = graph.getNeighbors(node.id).map(n => n.id).join(';');
            const row = `${node.id},${node.properties.activity},${node.properties.interaction},${degree},"${neighbors}"`;
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "social_network_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    onImport(data);
                } catch (err) {
                    alert('Invalid JSON');
                }
            };
            reader.readAsText(file);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const nodes = Array.from(graph.nodes.values());
    const edges = Array.from(graph.edges.values());

    return (
        <div className="p-4 bg-gray-100 h-full overflow-y-auto flex flex-col gap-4 text-black">
            <h2 className="text-xl font-bold">Controls</h2>
            
            <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold mb-2">Add Node</h3>
                <input 
                    className="border p-1 w-full mb-2" 
                    placeholder="Label (Name)" 
                    value={newNodeLabel} 
                    onChange={e => setNewNodeLabel(e.target.value)} 
                />
                <div className="flex gap-2 mb-2">
                    <input 
                        type="number" 
                        className="border p-1 w-1/3" 
                        placeholder="Activity" 
                        value={newNodeActivity} 
                        onChange={e => setNewNodeActivity(Number(e.target.value))} 
                    />
                    <input 
                        type="number" 
                        className="border p-1 w-1/3" 
                        placeholder="Interaction" 
                        value={newNodeInteraction} 
                        onChange={e => setNewNodeInteraction(Number(e.target.value))} 
                    />
                    <input 
                        type="number" 
                        className="border p-1 w-1/3" 
                        placeholder="Link Count (Opt)" 
                        value={newNodeConnectionCount} 
                        onChange={e => setNewNodeConnectionCount(e.target.value === '' ? '' : Number(e.target.value))} 
                    />
                </div>
                <button onClick={handleAddNode} className="bg-blue-500 text-white px-3 py-1 rounded w-full">Add Node</button>
            </div>

            <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold mb-2">Add Edge</h3>
                <select className="border p-1 w-full mb-2" value={edgeFrom} onChange={e => setEdgeFrom(e.target.value)}>
                    <option value="">Select From Node</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
                <select className="border p-1 w-full mb-2" value={edgeTo} onChange={e => setEdgeTo(e.target.value)}>
                    <option value="">Select To Node</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
                <button onClick={handleAddEdge} className="bg-green-500 text-white px-3 py-1 rounded w-full">Add Edge</button>
            </div>

            <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold mb-2">Algorithms</h3>
                <div className="mb-2">
                    <label className="block text-sm">Start Node</label>
                    <select className="border p-1 w-full" value={algoStartNode} onChange={e => setAlgoStartNode(e.target.value)}>
                        <option value="">Select Node</option>
                        {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                </div>
                <div className="mb-2">
                    <label className="block text-sm">End Node (for Path)</label>
                    <select className="border p-1 w-full" value={algoEndNode} onChange={e => setAlgoEndNode(e.target.value)}>
                        <option value="">Select Node</option>
                        {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onRunAlgorithm('BFS', algoStartNode)} className="bg-purple-500 text-white px-2 py-1 rounded text-sm">BFS</button>
                    <button onClick={() => onRunAlgorithm('DFS', algoStartNode)} className="bg-purple-500 text-white px-2 py-1 rounded text-sm">DFS</button>
                    <button onClick={() => onRunAlgorithm('Dijkstra', algoStartNode, algoEndNode)} className="bg-indigo-500 text-white px-2 py-1 rounded text-sm">Dijkstra</button>
                    <button onClick={() => onRunAlgorithm('A*', algoStartNode, algoEndNode)} className="bg-indigo-500 text-white px-2 py-1 rounded text-sm">A*</button>
                    <button onClick={() => onRunAlgorithm('ConnectedComponents')} className="bg-orange-500 text-white px-2 py-1 rounded text-sm col-span-2">Connected Components</button>
                    <button onClick={() => onRunAlgorithm('Centrality')} className="bg-red-500 text-white px-2 py-1 rounded text-sm col-span-2">Degree Centrality</button>
                    <button onClick={() => onRunAlgorithm('WelshPowell')} className="bg-pink-500 text-white px-2 py-1 rounded text-sm col-span-2">Welsh-Powell Coloring</button>
                </div>
            </div>

            <div className="bg-white p-3 rounded shadow">
                <h3 className="font-semibold mb-2">Data</h3>
                <button onClick={onLoadSample} className="bg-gray-500 text-white px-3 py-1 rounded w-full mb-2">Load Sample Data</button>
                <button onClick={handleExportJSON} className="bg-blue-600 text-white px-3 py-1 rounded w-full mb-2">Export JSON</button>
                <button onClick={handleExportCSV} className="bg-blue-600 text-white px-3 py-1 rounded w-full mb-2">Export CSV</button>
                <div className="relative">
                    <input 
                        type="file" 
                        accept=".json" 
                        ref={fileInputRef}
                        onChange={handleImportJSON}
                        className="hidden"
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-3 py-1 rounded w-full mb-2">Import JSON</button>
                </div>
                <button onClick={onClear} className="bg-red-600 text-white px-3 py-1 rounded w-full">Clear Graph</button>
            </div>

            {selectedNodeId && (
                <div className="bg-white p-3 rounded shadow">
                    <h3 className="font-semibold mb-2">Selected Node</h3>
                    <p>ID: {selectedNodeId}</p>
                    <p>Label: {graph.getNode(selectedNodeId)?.label}</p>
                    <p>Activity: {graph.getNode(selectedNodeId)?.properties.activity}</p>
                    <p>Interaction: {graph.getNode(selectedNodeId)?.properties.interaction}</p>
                    <p>Degree: {graph.getDegree(selectedNodeId)}</p>
                    
                    <div className="mt-2 border-t pt-2">
                        <h4 className="text-sm font-semibold mb-1">Update Properties</h4>
                        <div className="flex gap-1 mb-1">
                            <input 
                                type="number" 
                                className="border p-1 w-1/2 text-sm" 
                                placeholder="Activity" 
                                value={updateActivity} 
                                onChange={e => setUpdateActivity(Number(e.target.value))} 
                            />
                            <input 
                                type="number" 
                                className="border p-1 w-1/2 text-sm" 
                                placeholder="Interaction" 
                                value={updateInteraction} 
                                onChange={e => setUpdateInteraction(Number(e.target.value))} 
                            />
                        </div>
                        <button onClick={handleUpdateNode} className="bg-yellow-500 text-white px-2 py-1 rounded w-full text-sm">Update</button>
                    </div>

                    <button onClick={() => onRemoveNode(selectedNodeId)} className="bg-red-500 text-white px-2 py-1 rounded mt-2 w-full">Delete Node</button>
                </div>
            )}
        </div>
    );
};

export default ControlPanel;
