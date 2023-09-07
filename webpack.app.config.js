/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, args) => ({
    entry: path.resolve(__dirname, env.app, 'src/index.ts'), // Entry point
    target: 'node',
    mode: 'none',
    experiments: {
        topLevelAwait: true,
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/\.js$/, (resource) => {
            if (resource.context.includes(path.join(env.app))) {
                resource.request = resource.request.replace(/\.js$/, '.ts');
            }
        }),
    ],
    output: {
        filename: 'index.mjs',
        path: path.resolve(__dirname, env.app, 'lambda'),
        chunkFormat: 'array-push',
        library: {
            type: 'module',
        },
        environment: {
            module: true,
        }
    },
});