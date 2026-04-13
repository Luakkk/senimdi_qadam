/**
 * Pre-loader для adminjs: патчит проблемы совместимости при webpack-бандлинге.
 *
 * Патч 1: require.resolve('@adminjs/design-system')
 *   В webpack-бандле require.resolve не работает корректно с ESM-пакетами.
 *   Заменяем на заранее вычисленную константу __ADMINJS_DESIGN_SYSTEM_PATH__.
 *
 * Патч 2: ASSETS_ROOT в router.js
 *   adminjs/lib/backend/utils/router/router.js вычисляет __dirname через
 *   import.meta.url, которое в webpack-бандле резолвится в dist/src/... вместо
 *   реального пути к node_modules/adminjs. В итоге ASSETS_ROOT указывает на
 *   несуществующую папку services/frontend/assets/.
 *   Исправляем: заменяем весь блок вычисления ASSETS_ROOT на абсолютный путь,
 *   вычисленный прямо здесь в webpack.config-контексте (CJS, require работает).
 */

const path = require('path');

// Вычисляем правильный путь к adminjs frontend assets прямо сейчас,
// пока мы ещё в обычном Node.js CJS-контексте webpack.config.js.
let ADMINJS_ASSETS_ROOT = '';
try {
  const adminJsPkgPath = require.resolve('adminjs/package.json');
  const adminJsRoot = path.dirname(adminJsPkgPath);
  ADMINJS_ASSETS_ROOT = path.join(adminJsRoot, 'lib', 'frontend', 'assets') + '/';
} catch (e) {
  console.warn('[adminjs-loader] Could not resolve adminjs package.json:', e.message);
}

module.exports = function adminJsPatchingLoader(source) {
  // ── Патч 1: require.resolve('@adminjs/design-system') ────────────────────
  if (source.includes('require.resolve')) {
    console.log('[adminjs-loader] Patching require.resolve in:', this.resourcePath);
    source = source.replace(
      /require\.resolve\s*\(\s*['"]@adminjs\/design-system['"]\s*\)/g,
      '__ADMINJS_DESIGN_SYSTEM_PATH__',
    );
  }

  // ── Патч 2: ASSETS_ROOT (только в router.js) ─────────────────────────────
  // Заменяем блок из двух строк:
  //   const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  //   const ASSETS_ROOT = `${__dirname}/../lib/../../../frontend/assets/`;
  // на прямую строку с правильным абсолютным путём.
  if (ADMINJS_ASSETS_ROOT && source.includes('ASSETS_ROOT')) {
    const patched = source.replace(
      /const __dirname\s*=\s*url\.fileURLToPath\(new URL\(['"]\.['"],\s*import\.meta\.url\)\);\s*\nconst ASSETS_ROOT\s*=\s*`\$\{__dirname\}[^`]*`;/,
      `const ASSETS_ROOT = ${JSON.stringify(ADMINJS_ASSETS_ROOT)};`,
    );
    if (patched !== source) {
      console.log('[adminjs-loader] Patched ASSETS_ROOT →', ADMINJS_ASSETS_ROOT, 'in:', this.resourcePath);
      source = patched;
    }
  }

  return source;
};
