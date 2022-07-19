import type { WebpackStats, NormalizedWebpackStats, Chunks, ChunkMapping } from "./analyze";

function recursiveNormalizeStats(stats: WebpackStats): Omit<NormalizedWebpackStats, "chunkMapping"> {
  let modules = new Map();
  let chunks: Chunks = {};

  (stats.chunks || []).forEach((chunk) => {
    chunks[chunk.id] = {
      id: chunk.id,
      names: chunk.names,
      size: chunk.size,
    };

    (chunk.modules || []).forEach((m) => {
      modules.set(m.id, m);
    });
  });

  (stats.modules || []).forEach((m) => {
    modules.set(m.id, m);
  });

  (stats.children || []).forEach((child) => {
    let normalizedChild = normalizeStats(child);
    chunks = Object.assign({}, { ...chunks, ...normalizedChild.chunks });
    normalizedChild.modules.forEach((m) => {
      modules.set(m.id, m);
      (m.modules || []).forEach((sm) => {
        // These child's sub-modules don't appear to have an ID, use parent ID + name instead.
        // The chunks are that of the parent.
        modules.set(m.id + sm.name, { ...sm, id: m.id + sm.name, chunks: m.chunks });
      });
    });
  });

  return { modules: Array.from(modules.values()), chunks };
}

export function normalizeStats(stats: WebpackStats): NormalizedWebpackStats {
  const {modules, chunks} = recursiveNormalizeStats(stats);

  const chunkMapping = modules.reduce<ChunkMapping>(
    (acc, module) => {
      acc[module.name] = module.chunks
        .map(
          (chunkId) =>
            (chunks[chunkId] && chunks[chunkId].names.join(", ")) ||
            `?${chunkId}`
        )
        .join(", ");
      return acc;
    },
    {}
  );

  return {modules, chunks, chunkMapping};
}
