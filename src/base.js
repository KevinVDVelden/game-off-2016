class BaseRoom {
    constructor(name, decorators, raw) {
        this.name = name;
        this.decorators = decorators;
        this.raw = raw;
    }
}

class Room {
    constructor(base, room_width) {
        this.base = base;
        this.room_width = room_width;
    }

    render() {
       return `<div class=\"room room_offset_${this.offset} room_size_${this.room_width} ${this.base.decorators}\">
            <div class=\"room_ceiling\">
                &nbsp;
            </div>
            <div class=\"room_content\">
                &nbsp;
            </div>
            <div class=\"room_floor\">
                &nbsp;
            </div>
        </div>`;
   }
}

class World {
    constructor() {
        this.room_levels = [];
    }

    add_level( level_width ) {
        let level = [];
        for ( var i = 0; i < level_width; i++ ) {
            level[i] = null;
        }

        this.room_levels[ this.room_levels.length ] = level;
        return level;
    }

    add_room_raw( level, offset, room ) {
        room.offset = offset;
        level = this.room_levels[ level ];
        for ( var i = 0; i < room.room_width; i++ ) {
            level[ i + offset ] = room;
        }
    }
}

let ROOM_DEFINITIONS_RAW = [
    { name: "conversion", decorator: "room_conversion", min_width: 1 },
    { name: "research", decorator: "room_research", min_width: 1 },
    { name: "test_1", decorator: "room_test1", min_width: 1 },
    { name: "test_2", decorator: "room_test2", min_width: 2 },
];

let map_room = definition => new BaseRoom( definition['name'], definition['decorator'], definition );

let ROOM_DEFINITIONS = ( ROOM_DEFINITIONS_RAW.map((definition) => map_room( definition )) );
let NAMED_ROOM_DEFINITIONS = {};

for (let definition of ROOM_DEFINITIONS) {
    NAMED_ROOM_DEFINITIONS[ definition.name ] = definition;
}

let render_rooms = function(world) {
    let final_html = '';

    for (let level of world.room_levels) {
        final_html += `<div class=\"room_level room_level_size_${level.length}\">`;
        let last_room = null;

        for (let index in level) {
            let room = level[index];
            if (room === null) {
                final_html += '';
            } else if (room !== last_room) {
                final_html += room.render();
            }
            last_room = room;
        }

        final_html += "</div>";
    }
            
    return $("#room_listing").html( `<div class=\"room_list\">${final_html}</div>` );
};

let world = new World();
world.add_level( 6 );
world.add_level( 6 );
world.add_level( 6 );
world.add_level( 6 );
world.add_level( 6 );
world.add_level( 6 );

world.add_room_raw( 0, 0, new Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) );
world.add_room_raw( 0, 2, new Room( NAMED_ROOM_DEFINITIONS['research'], 2 ) );
world.add_room_raw( 1, 1, new Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) );
world.add_room_raw( 1, 3, new Room( NAMED_ROOM_DEFINITIONS['research'], 2 ) );
world.add_room_raw( 2, 2, new Room( NAMED_ROOM_DEFINITIONS['conversion'], 3 ) );
world.add_room_raw( 3, 1, new Room( NAMED_ROOM_DEFINITIONS['research'], 4 ) );
world.add_room_raw( 4, 0, new Room( NAMED_ROOM_DEFINITIONS['conversion'], 5 ) );
world.add_room_raw( 5, 0, new Room( NAMED_ROOM_DEFINITIONS['research'], 6 ) );

render_rooms( world );
