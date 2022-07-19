import { print } from "./print";
import type { Module, Chunks, ChunkMapping } from "../analyze";

export type Reporter = {
  print(
    report: Array<Module>,
    chunks: Chunks,
    chunkMapping: ChunkMapping,
    flags: { [key: string]: any },
    limit: number,
    logger?: (msg?: string) => void
  ): void;
};

export const reporter: Reporter = { print };
