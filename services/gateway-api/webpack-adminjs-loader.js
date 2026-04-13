/**
 * Диагностический pre-loader: логирует, какие файлы adminjs проходят через webpack,
 * и заменяет require.resolve('@adminjs/design-system') на заранее вычисленную константу.
 */
module.exports = function adminJsPatchingLoader(source) {
  const hasRequireResolve = source.includes('require.resolve');
  if (hasRequireResolve) {
    console.log('[adminjs-loader] Patching require.resolve in:', this.resourcePath);
  }
  return source.replace(
    /require\.resolve\s*\(\s*['"]@adminjs\/design-system['"]\s*\)/g,
    '__ADMINJS_DESIGN_SYSTEM_PATH__',
  );
};
