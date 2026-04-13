const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

// Вычисляем пути к adminjs-пакетам прямо здесь — webpack.config.js
// запускается в обычном Node.js CJS-контексте, где require.resolve работает.
let designSystemResolvedPath = '';
try {
  designSystemResolvedPath = require.resolve('@adminjs/design-system');
  console.log('[webpack.config] @adminjs/design-system resolved to:', designSystemResolvedPath);
} catch (e) {
  console.warn('[webpack.config] Could not resolve @adminjs/design-system:', e.message);
}

/**
 * Плагин создаёт dist/package.json после каждой компиляции.
 *
 * Проблема: webpack в Node.js target устанавливает __dirname для всех модулей
 * в бандле равным директории output (dist/). Adminjs читает свою версию через
 * readFileSync(path.join(__dirname, 'package.json')), и получает путь dist/package.json
 * вместо node_modules/adminjs/package.json.
 *
 * Решение: создаём dist/package.json с нужными полями после сборки.
 */
class CreateDistPackageJsonPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CreateDistPackageJsonPlugin', () => {
      const distDir = path.resolve(__dirname, 'dist');

      // Читаем реальный adminjs package.json для корректной версии
      let adminJsVersion = '7.0.0';
      try {
        const adminJsPkg = JSON.parse(
          fs.readFileSync(
            path.join(__dirname, 'node_modules', 'adminjs', 'package.json'),
            'utf-8',
          ),
        );
        adminJsVersion = adminJsPkg.version || adminJsVersion;
      } catch (_) {}

      // Читаем gateway-api package.json
      let gatewayPkg = {};
      try {
        gatewayPkg = JSON.parse(
          fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'),
        );
      } catch (_) {}

      // Создаём dist/package.json: основа от gateway-api + версия adminjs
      const distPkg = {
        name: gatewayPkg.name || 'gateway-api',
        version: gatewayPkg.version || '0.0.1',
        // adminjs использует это поле для отображения версии в панели
        _adminJsVersion: adminJsVersion,
      };

      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(
        path.join(distDir, 'package.json'),
        JSON.stringify(distPkg, null, 2),
      );
      console.log('[webpack] Created dist/package.json (adminjs version fix)');
    });
  }
}

module.exports = function (options) {
  return {
    ...options,

    // __dirname: true — webpack заменяет __dirname на реальный путь исходного файла.
    // Без этого adminjs получает dist/ вместо node_modules/adminjs/lib/backend/utils/router/
    // и ищет свои бандлы по неверному пути (services/frontend/assets/scripts/).
    node: {
      ...(options.node || {}),
      __dirname: true,
    },

    externals: [
      nodeExternals({
        allowlist: [
          'adminjs',
          '@adminjs/nestjs',
          '@adminjs/prisma',
          /^adminjs\//,
          /^@adminjs\//,
        ],
      }),
    ],

    resolve: {
      ...options.resolve,
      conditionNames: ['import', 'require', 'node', 'default'],
    },

    module: {
      ...options.module,
      rules: [
        ...(options.module?.rules || []),
        {
          include: [
            /node_modules[/\\](adminjs)[/\\]/,
            /node_modules[/\\](@adminjs)[/\\]/,
          ],
          use: [
            {
              loader: path.resolve(__dirname, 'webpack-adminjs-loader.js'),
            },
          ],
          enforce: 'pre',
        },
      ],
    },

    plugins: [
      ...(options.plugins || []),

      new webpack.DefinePlugin({
        __ADMINJS_DESIGN_SYSTEM_PATH__: JSON.stringify(designSystemResolvedPath),
        'require.resolve': `(function __adminjs_req_resolve__(mod) {
          if (mod === '@adminjs/design-system') {
            return ${JSON.stringify(designSystemResolvedPath)};
          }
          if (typeof __non_webpack_require__ !== 'undefined' && __non_webpack_require__ && __non_webpack_require__.resolve) {
            return __non_webpack_require__.resolve(mod);
          }
          return mod;
        })`,
      }),

      new webpack.IgnorePlugin({
        resourceRegExp: /^@adminjs\/themes$/,
      }),

      // Создаём dist/package.json после компиляции (adminjs читает его через __dirname)
      new CreateDistPackageJsonPlugin(),
    ],

    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
    },
  };
};
