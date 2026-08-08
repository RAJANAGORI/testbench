'use strict';

/**
 * Canonical on-disk layout for SCAS diagram assets:
 *
 *   documentation/assets/diagrams/
 *     platform/{svg,excalidraw}/scas-*.{svg,excalidraw}
 *     observability/{svg,excalidraw}/scas-observability-*.{svg,excalidraw}
 *     codeflow/{svg,excalidraw}/scas-codeflow-scenario-NN.{svg,excalidraw}
 *     README.md
 */

const DIAGRAMS_DIR = 'documentation/assets/diagrams';

/** @typedef {'platform' | 'observability' | 'codeflow'} DiagramCategory */

/**
 * @param {string} basename
 * @returns {DiagramCategory}
 */
function categoryForBasename(basename) {
  if (basename.startsWith('scas-codeflow-scenario-')) return 'codeflow';
  if (basename.startsWith('scas-observability-')) return 'observability';
  return 'platform';
}

/**
 * @param {string} basename
 * @param {DiagramCategory} [category]
 */
function diagramAssetPaths(basename, category) {
  const cat = category || categoryForBasename(basename);
  return {
    category: cat,
    svg: `${DIAGRAMS_DIR}/${cat}/svg/${basename}.svg`,
    excalidraw: `${DIAGRAMS_DIR}/${cat}/excalidraw/${basename}.excalidraw`,
    /** Substring that must appear in Markdown embeds */
    embedNeedle: `assets/diagrams/${cat}/svg/${basename}.svg`,
  };
}

module.exports = {
  DIAGRAMS_DIR,
  categoryForBasename,
  diagramAssetPaths,
};
