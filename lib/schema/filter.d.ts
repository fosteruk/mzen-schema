export default class Filter {
    static filter(value: any, filtersConfig: any): Promise<any>;
    static isNull(value: any): boolean;
    static defaultValue(value: any, options: any): any;
    static trim(value: any, options: any): any;
    static uppercase(value: any, options: any): any;
    static lowercase(value: any, options: any): any;
    static custom(value: any, options: any): any;
}
