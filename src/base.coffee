class BaseRoom
    constructor: (@name, @decorators, @raw) ->

class Room
    constructor: (@base, @room_width) ->

    render: ->
       "<div class=\"room room_offset_#{this.offset} room_size_#{this.room_width} #{this.base.decorators}\">
            <div class=\"room_ceiling\">
                &nbsp;
            </div>
            <div class=\"room_content\">
                &nbsp;
            </div>
            <div class=\"room_floor\">
                &nbsp;
            </div>
        </div>"

class World
    constructor: ->
        this.room_levels = []

    add_level: ( level_width ) ->
        level = []
        for i in [ 0..level_width-1 ]
            level[i] = null

        this.room_levels[ this.room_levels.length ] = level
        return level

    add_room_raw: ( level, offset, room ) ->
        room.offset = offset
        level = this.room_levels[ level ]
        for i in [ offset..offset+room.room_width-1 ]
            level[ i ] = room 

ROOM_DEFINITIONS_RAW = [
    { name: "conversion", decorator: "room_conversion", min_width: 1 },
    { name: "research", decorator: "room_research", min_width: 1 },
    { name: "test_1", decorator: "room_test1", min_width: 1 },
    { name: "test_2", decorator: "room_test2", min_width: 2 },
]

map_room = (definition) ->
    new BaseRoom( definition['name'], definition['decorator'], definition )

ROOM_DEFINITIONS = ( map_room( definition ) for definition in ROOM_DEFINITIONS_RAW )
NAMED_ROOM_DEFINITIONS = {}

console.log( ROOM_DEFINITIONS )
for definition in ROOM_DEFINITIONS
    console.log definition 
    NAMED_ROOM_DEFINITIONS[ definition.name ] = definition

render_rooms = (world) ->
    final_html = ''

    for level in world.room_levels
        final_html += "<div class=\"room_level room_level_size_#{level.length}\">"
        last_room = null

        for index, room of level
            console.log( room, last_room )
            if room == null
                final_html += ''
            else if room != last_room
                final_html += room.render()
            last_room = room

        final_html += "</div>"
            
    $("#room_listing").html( "<div class=\"room_list\">#{final_html}</div>" )

world = new World()
world.add_level( 6 )
world.add_level( 6 )
world.add_level( 6 )
world.add_level( 6 )

world.add_room_raw( 0, 0, new Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) )
world.add_room_raw( 0, 2, new Room( NAMED_ROOM_DEFINITIONS['research'], 2 ) )
world.add_room_raw( 1, 1, new Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) )
world.add_room_raw( 1, 3, new Room( NAMED_ROOM_DEFINITIONS['research'], 2 ) )
world.add_room_raw( 2, 2, new Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) )
world.add_room_raw( 3, 4, new Room( NAMED_ROOM_DEFINITIONS['research'], 2 ) )

render_rooms( world )
