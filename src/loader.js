import { Assets } from 'pixi.js';

/*
* 加载资源
* @param {Array} 素材资源 [{name, url}]
* @param {Function} callback 加载进度回调  
* @return {Promise} 纹理集合
* */
export function loadAssets(assets, processCallback) {
    const list = [];
    return new Promise((resolve, reject) => {
        if (!assets) {
            throw new Error("No assets to load");
        }
        for (const asset of assets) {
            if (!asset.name || !asset.url) {
                throw new Error("Asset must have name and url");
            }
            if (list.indexOf(asset.name) !== -1) {
                throw new Error(`Asset name must be unique. ${asset.name} is already in use.`);
            }
            list.push(asset.name);
            Assets.add(asset.name, asset.url);
        }
        Assets.load(list, processCallback).then((res) => {
            resolve(res);
        }).catch(reject);
    });
}