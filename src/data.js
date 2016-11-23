import * as model from "model/room"
import { ASSET_LIST } from "assets"

let map_room = definition => new model.BaseRoom( definition['name'], definition['decorators'], definition );
let map_machine = definition => new model.BaseMachine( definition['name'], definition['image'], definition );

let ROOM_DEFINITIONS_RAW = [
    { name: "conversion", decorators: "room_conversion perspective", min_width: 1, floor: 'assets/dark_wood_floor.png', ceiling: '/assets/lab_ceiling.png', door: 'base_door', actions: [ 'build' ] },
    { name: "research", decorators: "room_research perspective", min_width: 1, floor: 'assets/dark_wood_floor.png', ceiling: '/assets/lab_ceiling.png', door: 'base_door', actions: [ 'build' ] },

    { name: "storage", decorators: "room_storage perspective", min_width: 1, floor: 'assets/wood_floor.png', ceiling: '/assets/lab_ceiling.png', door: 'base_door', actions: [ 'build' ] },


    { name: "outside", decorators: "room_outside perspective_floor", min_width: 1, floor: 'assets/dark_wood_floor.png' },
    { name: "outside_door", decorators: "room_outside_door perspective_floor", min_width: 1, floor: 'assets/dark_wood_floor.png' },
];
let MACHINE_DEFINITIONS_RAW = [
    { name: "conversion_chamber", image: "assets/room_elements/conversion.png", overlay_active: "assets/room_elements/conversion_active.png", decorators: 'conversion_chamber', build_restrictions: [ { room: 'conversion' } ], actions: [ 'fill_chamber', 'start_conversion' ], fade_overlay: true },
    { name: "research_station", image: "assets/room_elements/research_station.png", overlay_active: "assets/room_elements/research_station_active.png", decorators: 'research_station', build_restrictions: [ { room: 'research' } ], actions: [ 'select_research' ], fade_overlay: true },
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

let RESOURCE_RENDER_LIST = [ [ 'Unconverted', 'resource_unconverted' ], [ 'Idle drones', 'resource_idle_drones' ], [ 'Metal', 'resource_metal' ], [ 'Energy', 'resource_energy' ] ];

let ASSET_GROUPS = {}
for ( let file of ASSET_LIST ) {
    let groupStart = file.lastIndexOf( '/' );
    if ( groupStart == -1 ) continue;

    let group = file.substr( 0, groupStart );
    if ( ASSET_GROUPS[ group ] === undefined ) ASSET_GROUPS[ group ] = [];
    ASSET_GROUPS[ group ][ ASSET_GROUPS[ group ].length ] = file;
}

export { NAMED_ROOM_DEFINITIONS, NAMED_MACHINE_DEFINITIONS, RESOURCE_RENDER_LIST, ASSET_LIST, ASSET_GROUPS }
