export default class TypeCaster {
    static type: {
        [key: string]: any;
    };
    /**
     * Get Type
     *
     * If value is a function that will be returned otherwise the values constructor will be returned.
     */
    static getType(value: any): any;
    static getTypeName(value: any): any;
    static cast(toType: any, value: any): any;
    static getCastFunctionName(typeName: any): string;
}
