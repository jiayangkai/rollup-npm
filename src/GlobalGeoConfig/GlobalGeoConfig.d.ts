import { AnnotatedWebConfig } from '../../queries';
/**
 * 组织或设备名与geo信息对照表数据接口
 *
 * @export
 * @interface GeoStruct
 */
export interface GeoStruct {
    [name: string]: {
        class: string[];
        geo: string;
        level: string;
        name: {
            cn: string;
            en: string;
        };
    };
}
declare global {
    interface Window {
        _config: AnnotatedWebConfig;
    }
}
/**
 * 初始化GeoStructObj
 *
 * @export
 * @param {*} struct
 * @param {string[]} levels
 * @returns {GeoStruct}
 */
export declare function setGeoStruct(struct: any, levels: string[]): void;
/**
 * 获取全局组织或设备名与geo信息对照表
 *
 * @export
 * @returns {GeoStruct}
 */
export default function getorSetGeoStruct(): GeoStruct;
/**
 * 根据指定的组织或设备的类，获取同类下所有的geo
 *
 * @param {string} className 设备或组织所属的类
 * @returns {string[]} geo数组
 */
export declare function getGeoByClassName(className: string): string[];
