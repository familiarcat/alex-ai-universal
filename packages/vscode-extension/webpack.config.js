/**
 * Webpack Configuration for Alex AI VS Code Extension
 * 
 * Based on crew recommendations:
 * - La Forge: Infrastructure optimization
 * - Data: Technical architecture
 * - O'Brien: Pragmatic bundling approach
 * - Riker: Tactical build strategy
 * 
 * References Next.js webpack patterns for consistency
 */

const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'node', // VS Code extensions run in Node.js environment
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist/packages/extensions/vscode'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  externals: {
    // VS Code API is provided by the runtime
    'vscode': 'commonjs vscode',
    // Don't bundle these - they're provided by VS Code or should be external
    '@alex-ai/universal-extension': 'commonjs @alex-ai/universal-extension'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    mainFields: ['main', 'module']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'esnext',
                target: 'es2020'
              },
              transpileOnly: true // Faster builds, type checking done separately
            }
          }
        ]
      }
    ]
  },
  plugins: [],
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    // Tree shaking for production
    usedExports: true
  },
  devtool: 'source-map',
  stats: {
    warnings: false // Suppress warnings for cleaner output
  },
  // Performance hints
  performance: {
    hints: false // VS Code extensions are typically small
  }
};

