import * as PIXI from 'pixi.js';
import { loadAssets } from "./loader.js";
import { addCSS } from './utils/css.js';

// 默认设计稿尺寸
const defaultOptions = {
    width: 750,
    height: 1680,
};

export default class Game {

    constructor(options) {
        this.options = { ...defaultOptions, ...options };
        this.containerIndex = 0; // 容器索引
        this.textures = {}; // 纹理集合
        this.init(); // 初始化
    }

    init() {
        this.app = new PIXI.Application(this.options); // 创建应用
        let scale = .5 * (document.body.clientWidth / 375); // 缩放比例
        scale += 0.005555;
        addCSS("canvas {transform: scale(" + scale + ")}"); // 设置缩放
    }

    /*
    * 添加容器
    * @param {string} name 容器名称
    * @param {object} options 容器属性
    * @return {object} 容器对象
    * */
    addContainer(name, options) {
        options.width = options.width || this.options.width;
        options.height = options.height || this.options.height;

        let container = new PIXI.Container(options);
        container.name = name || `container-${this.containerIndex++}}`;
        container.x = options.x || this.options.width / 2;
        container.y = options.y || this.options.height / 2;

        this.app.stage.addChild(container);

        return container;
    }

    /*
    * 添加精灵
    * @param {string} name 精灵名称
    * @param {object} options 精灵属性
    * @param {object} container 精灵容器
    * @return {object} 精灵对象
    * */
    addSpirte(name, { x, y, width, height, anchor, events, created }, container = this.app) {
        let sprite = PIXI.Sprite.from(name);
        sprite.name = name;
        sprite.x = x || 0;
        sprite.y = y || 0;
        sprite.width = width || 0;
        sprite.height = height || 0;
        sprite.anchor.set(anchor || 0.5);

        this.bindEvents(sprite, events, container);

        container.addChild(sprite);

        this.app.ticker.addOnce(() => {
            created && created(sprite, container);
        });

        return sprite;
    }

    /*
    * 绑定事件
    * @param {object} sprite 精灵对象
    * @param {object} events 事件集合
    * @param {object} container 精灵容器
    * */
    bindEvents(sprite, events, container) {
        if (!events) return;
        sprite.buttonMode = true;
        sprite.interactive = true;
        for (let event of events) {
            if (!event.name || !event.handler) {
                throw new Error('事件参数错误, name, handler 为必填项');
            }
            if (event.once) {
                sprite.once(event.name, (e) => {
                    event.handler(e, sprite, container);
                });
            } else {
                sprite.on(event.name, (e) => {
                    event.handler(e, sprite, container);
                });
            }
        }
    }

    /*
    * 加载资源
    * @param {Array} 素材资源 [{name, url}]
    * @param {Function} callback 加载进度回调  
    * @return {Promise} 纹理集合
    * */
    loadAssets(assets, processCallback) {
        return new Promise((resolve, reject) => {
            loadAssets(assets, processCallback).then((res) => {
                this.textures = { ...this.textures, ...res };
                resolve(res);
            }).catch(reject);
        })

    }

    /*
    * 创建场景
    * @param {string} name 场景名称
    * @param {object} props 场景属性
    * @param {Array} sprites 精灵集合
    * */
    createScene({ name, props, sprites }) {
        let container = this.addContainer(name, props);
        for (const sprite of sprites) {
            this.addSpirte(sprite.name, sprite, container);
        }
    }


}