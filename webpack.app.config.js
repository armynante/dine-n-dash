/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, args) => ({
    entry: path.resolve(__dirname, env.app, 'index.ts'), // Entry point
    target: 'node',
    mode: 'production',
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
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, env.app, 'dist'),
        libraryTarget: 'commonjs2',
    },
});