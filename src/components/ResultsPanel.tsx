import React from 'react';
import { AlgorithmResult } from '../core/algorithms/Algorithm';

interface ResultsPanelProps {
    result: AlgorithmResult | null;
    algorithmName: string | null;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, algorithmName }) => {
    if (!result || !algorithmName) return null;

    return (
        <div className="bg-white p-4 rounded shadow mt-4 max-h-60 overflow-y-auto text-black">
            <h3 className="font-bold text-lg mb-2">Results: {algorithmName}</h3>
            
            {result.metrics && (
                <div className="mb-2 text-sm">
                    <p>Execution Time: {result.metrics.executionTime.toFixed(4)} ms</p>
                    {result.metrics.distance !== undefined && <p>Total Distance (Cost): {result.metrics.distance.toFixed(4)}</p>}
                    {result.metrics.visitedCount !== undefined && <p>Visited Nodes: {result.metrics.visitedCount}</p>}
                    {result.metrics.componentCount !== undefined && <p>Component Count: {result.metrics.componentCount}</p>}
                    {result.metrics.chromaticNumber !== undefined && <p>Chromatic Number: {result.metrics.chromaticNumber}</p>}
                </div>
            )}

            {result.path && (
                <div className="mb-2">
                    <h4 className="font-semibold">Path:</h4>
                    <p className="text-sm break-all">{result.path.join(' -> ')}</p>
                </div>
            )}

            {result.nodes && algorithmName !== 'Degree Centrality' && (
                <div className="mb-2">
                    <h4 className="font-semibold">Nodes:</h4>
                    <p className="text-sm break-all">{result.nodes.join(', ')}</p>
                </div>
            )}

            {result.metrics?.top5 && (
                <div className="mb-2">
                    <h4 className="font-semibold">Top 5 Influential Users:</h4>
                    <table className="w-full text-sm border-collapse border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-1">ID</th>
                                <th className="border p-1">Degree</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.metrics.top5.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="border p-1">{item.id}</td>
                                    <td className="border p-1">{item.degree}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             
             {result.metrics?.colors && (
                <div className="mb-2">
                    <h4 className="font-semibold">Coloring:</h4>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(result.metrics.colors).map(([id, color]) => (
                            <span key={id} className="px-2 py-1 border rounded text-xs">
                                {id}: Color {String(color)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsPanel;
