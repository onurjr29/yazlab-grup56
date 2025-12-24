export interface NodeProperties {
    activity: number; // Aktiflik
    interaction: number; // Etkileşim
    connectionCount?: number; // Bağlantı Sayısı (Optional, defaults to actual degree)
}

export class Node {
    id: string;
    label: string;
    properties: NodeProperties;
    
    // Visualization properties
    x?: number;
    y?: number;
    color?: string;

    constructor(id: string, label: string, properties: NodeProperties) {
        this.id = id;
        this.label = label;
        this.properties = properties;
    }
}
