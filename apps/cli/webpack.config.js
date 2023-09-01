/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default (env, args) => ({
    entry: path.resolve(__dirname, env.app, 'index.ts'), // Entry point
    target: 'node',
    mode: 'production',
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
    // externals: [
    //     nodeExternals({
    //         allowlist: ['diner-utility'], // replace 'my-utility' with your actual utility package name
    //     }),
    // ],
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        // ... your existing plugins
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
    ],
    output: {
        filename: 'index.mjs',
        path: path.resolve(__dirname, env.app, 'dist'),
        chunkFormat: 'array-push',
        libraryTarget: 'module',
    },
});
