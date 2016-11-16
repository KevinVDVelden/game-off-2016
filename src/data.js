import * as model from "model/room"
import { ASSET_LIST } from "assets"

let map_room = definition => new model.BaseRoom( definition['name'], definition['decorators'], definition );
let map_machine = definition => new model.BaseMachine( definition['name'], definition['image'], definition );

let ROOM_DEFINITIONS_RAW = [
    { name: "conversion", decorators: "room_conversion perspective", min_width: 1 },
    { name: "research", decorators: "room_research perspective", min_width: 1 },

    { name: "outside", decorators: "room_outside perspective_floor", min_width: 1 },
    { name: "outside_door", decorators: "room_outside_door perspective_floor", min_width: 1 },

    { name: "test_1", decorators: "room_test1", min_width: 1 },
    { name: "test_2", decorators: "room_test2", min_width: 2 },
];
let MACHINE_DEFINITIONS_RAW = [
    { name: "conversion_chamber", image: "assets/room_elements/conversion.png", overlay_active: "assets/room_elements/conversion_active.png", decorators: 'conversion_chamber' },
];


let ROOM_DEFINITIONS = ( ROOM_DEFINITIONS_RAW.map((definition) => map_room( definition )) );
let NAMED_ROOM_DEFINITIONS = {};

for (let definition of ROOM_DEFINITIONS) {
    NAMED_ROOM_DEFINITIONS[ definition.name ] = definition;
}

let MACHINE_DEFINITIONS = ( MACHINE_DEFINITIONS_RAW.map((definition) => map_machine( definition )) );
let NAMED_MACHINE_DEFINITIONS = {};

for (let definition of MACHINE_DEFINITIONS) {
    NAMED_MACHINE_DEFINITIONS[ definition.name ] = definition;
}

let RESOURCE_RENDER_LIST = [ [ 'Unconverted', 'resource_unconverted' ], [ 'Converted', 'resource_converted' ], [ 'Metal', 'resource_metal' ] ];

let ASSET_GROUPS = {}
for ( let file of ASSET_LIST ) {
    let groupStart = file.lastIndexOf( '/' );
    if ( groupStart == -1 ) continue;

    let group = file.substr( 0, groupStart );
    if ( ASSET_GROUPS[ group ] === undefined ) ASSET_GROUPS[ group ] = [];
    ASSET_GROUPS[ group ][ ASSET_GROUPS[ group ].length ] = file;
}

export { NAMED_ROOM_DEFINITIONS, NAMED_MACHINE_DEFINITIONS, RESOURCE_RENDER_LIST, ASSET_LIST, ASSET_GROUPS }
