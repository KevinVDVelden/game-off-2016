import * as model from "model/model"

let map_room = definition => new model.BaseRoom( definition['name'], definition['decorator'], definition );

let ROOM_DEFINITIONS_RAW = [
    { name: "conversion", decorator: "room_conversion", min_width: 1 },
    { name: "research", decorator: "room_research", min_width: 1 },
    { name: "test_1", decorator: "room_test1", min_width: 1 },
    { name: "test_2", decorator: "room_test2", min_width: 2 },
];

let ROOM_DEFINITIONS = ( ROOM_DEFINITIONS_RAW.map((definition) => map_room( definition )) );
let NAMED_ROOM_DEFINITIONS = {};

for (let definition of ROOM_DEFINITIONS) {
    NAMED_ROOM_DEFINITIONS[ definition.name ] = definition;
}

let RESOURCE_RENDER_LIST = [ [ 'Unconverted', 'resource_unconverted' ], [ 'Converted', 'resource_converted' ], [ 'Metal', 'resource_metal' ] ];

export { NAMED_ROOM_DEFINITIONS, RESOURCE_RENDER_LIST }
