import { Model } from "model/util"

class Base extends Model {
    constructor() {
        super();
        this.room_levels = [];
        this.resources = {};
    }

    add_level( level_width ) {
        let level = [];
        for ( let i = 0; i < level_width; i++ ) {
            level[i] = null;
        }

        this.room_levels[ this.room_levels.length ] = level;
        this.call_listeners();
        return level;
    }

    add_room_raw( level, offset, room ) {
        console.log( 'add_room_raw', level, offset, room );
        room.offset = offset;
        level = this.room_levels[ level ];
        for ( let i = 0; i < room.room_width; i++ ) {
            level[ i + offset ] = room;
        }
        this.call_listeners();
    }

    room( level, offset ) {
        level = this.room_levels[ level ]
        if ( level == undefined ) return null;

        return level[ offset ] || null;
    }

    can_modify_resource( resource, amount ) {
        if ( amount > 0 ) return true;
        current = this.resource[ resource ];

        if ( current === undefined ) return false;
        return ( current - amount ) >= 0;
    }

    modify_resource( resource, amount ) {
        if ( this.can_modify_resource( resource, amount ) ) {
            if ( this.resources[ resource ] === undefined ) this.resources[ resource ] = 0;

            this.resources[ resource ] += amount;
            this.call_listeners();
            return true;
        } else {
            return false;
        }
    }

    modify_resources( resources ) {
        for ( let resource in resources ) {
            if ( ! this.can_modify_resource( resource, resources[ resource ] ) ) return false;
        }

        for ( let resource in resources ) {
            if ( this.resources[ resource ] === undefined ) this.resources[ resource ] = 0;

            this.resources[ resource ] += resources[ resource ];
        }
        this.call_listeners();
    }
}

export { Base }
