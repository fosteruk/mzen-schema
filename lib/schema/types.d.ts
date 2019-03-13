import ObjectID from 'bson-objectid';
declare class Mixed {
}
declare const Types: {
    String: StringConstructor;
    Number: NumberConstructor;
    Boolean: BooleanConstructor;
    Array: ArrayConstructor;
    Object: ObjectConstructor;
    Date: DateConstructor;
    ObjectID: typeof ObjectID;
    Mixed: typeof Mixed;
};
export default Types;
