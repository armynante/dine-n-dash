import keychain from 'keychain';

export const getToken = () => {
    return new Promise((resolve, reject) => {
        keychain.getPassword(
            {
                account:'diner',
                service:'token'
            }, (err:Error, token:string) => {
                if (err) {
                    console.log('Error getting token', err.message);
                    reject(err);
                }
                resolve(token);
            }
        );
    });
};

export const setToken = (token: string) => {
    return new Promise<void>((resolve, reject) => {
        keychain.setPassword({ account: 'diner', service: 'token', password: token }, (err:Error) => {
            if (err) {
                console.log('Error saving token', err);
                reject(err);
            }
            resolve();
        }
        );
    });
};

export const deleteToken = () => {
    return new Promise<void>((resolve, reject) => {
        keychain.deletePassword({
            account: 'diner',
            service: 'token'
        }, (err:Error) => {
            if (err) {
                console.log('Error deleting token', err);
                reject(err);
            }
            resolve();
        }
        );
    });
};