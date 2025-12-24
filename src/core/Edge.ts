export class Edge {
    id: string;
    from: string;
    to: string;
    weight: number;

    constructor(id: string, from: string, to: string, weight: number = 0) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
}
