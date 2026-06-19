export declare function listStrategies(): Promise<{
    tradeCount: number;
    id: number;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}[]>;
export declare function getStrategy(id: number): Promise<{
    id: number;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function createStrategy(data: {
    name: string;
    description?: string;
}): Promise<{
    id: number;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function updateStrategy(id: number, data: {
    name?: string;
    description?: string;
}): Promise<{
    id: number;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function deleteStrategy(id: number): Promise<{
    id: number;
    name: string;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
//# sourceMappingURL=strategies.d.ts.map