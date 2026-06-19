export declare function listTrades(strategyId: number): Promise<{
    tradeNumber: number;
    id: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    strategyId: number;
    openScreenshotUrl: string;
    closeScreenshotUrl: string | null;
    resultR: string | null;
    notes: string | null;
    pair: string | null;
}[]>;
export declare function getTrade(id: number): Promise<{
    id: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    strategyId: number;
    openScreenshotUrl: string;
    closeScreenshotUrl: string | null;
    resultR: string | null;
    notes: string | null;
    pair: string | null;
}>;
export declare function createTrade(strategyId: number, data: {
    resultR?: string;
    notes?: string;
    pair?: string;
}, files?: {
    openScreenshot?: Express.Multer.File;
    closeScreenshot?: Express.Multer.File;
}): Promise<{
    id: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    strategyId: number;
    openScreenshotUrl: string;
    closeScreenshotUrl: string | null;
    resultR: string | null;
    notes: string | null;
    pair: string | null;
}>;
export declare function updateTrade(id: number, data: {
    resultR?: string;
    notes?: string;
    pair?: string;
}, files?: {
    openScreenshot?: Express.Multer.File;
    closeScreenshot?: Express.Multer.File;
}): Promise<{
    id: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    strategyId: number;
    openScreenshotUrl: string;
    closeScreenshotUrl: string | null;
    resultR: string | null;
    notes: string | null;
    pair: string | null;
} | null>;
export declare function deleteTrade(id: number): Promise<{
    id: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    strategyId: number;
    openScreenshotUrl: string;
    closeScreenshotUrl: string | null;
    resultR: string | null;
    notes: string | null;
    pair: string | null;
} | null>;
//# sourceMappingURL=trades.d.ts.map