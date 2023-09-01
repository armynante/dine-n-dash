// import fs from 'fs';
// import path from 'path';

const debugSS = async (page:any, screenName:string, DEBUG?:boolean) => {
    // if (DEBUG) {
    //     const today = new Date();
    //     const dateTime = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
    //     const ssPath = path.join('/app/screenshots', `${screenName}/${screenName}-${dateTime}.png`);
    //     const ssDir = path.dirname(ssPath);

    //     if (!fs.existsSync(ssDir)) {
    //         fs.mkdirSync(ssDir, { recursive: true });
    //     }

    //     await page.screenshot({ path: ssPath });
    // }
};

export default debugSS;
