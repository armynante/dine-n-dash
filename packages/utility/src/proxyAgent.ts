import { ProxyConfig } from './types.js';

export const proxy = (proxyConfig:ProxyConfig) => {
    return {
        protocol: 'http',
        host: proxyConfig.host,
        port: proxyConfig.port,
        auth: {
            username: proxyConfig.username,
            password: proxyConfig.password
        }
    };
};

export default proxy;