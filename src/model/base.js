import { Model } from "model/util"

let RESOURCE_ACCURACY = 100;

class Base extends Model {
    constructor() {
        super();
        this.room_levels = [];
        this.resources = {};
        this.characters = [];

        this.finished_researches = [];
    }

    /***** Levels and rooms*/
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
        room.offset = offset;
        room.level = level;

        level = this.room_levels[ level ];
        for ( let i = 0; i < room.room_width; i++ ) {
            level[ i + offset ] = room;
        }
        this.call_listeners();

        room.model_parent = this;
        return room;
    }

    room( level, offset ) {
        level = this.room_levels[ level ]
        if ( level == undefined ) return null;

        return level[ offset ] || null;
    }

    /***** Characters */
    add_character( character ) {
        if ( this.characters.indexOf( character ) == -1 ) {
            this.characters.push( character );
            character.model_parent = this;
            character.base = this;

            this.call_listeners();
        }
    }
    del_character( character ) {
        let index = -1;
        while ( ( index = this.characters.indexOf( character ) ) != -1 ) {
            this.characters.splice( index, 1 );
            this.call_listeners();
        }
    }

    /***** Resources */
    can_modify_resource( resource, amount ) {
        if ( amount > 0 ) return true;
        let current = this.resources[ resource ];

        if ( current === undefined ) return false;

        return this._round( current + amount ) >= 0;
    }

    _round( v ) {
        return Math.round( v * RESOURCE_ACCURACY ) / RESOURCE_ACCURACY;
    }

    set_resource_raw( resource, amount ) {
        if ( amount < 0 ) throw "Can't set a resource to a negative amount.";

        this.resources[ resource ] = amount;
        this.call_listeners();
    }

    modify_resource( resource, amount ) {
        if ( this.can_modify_resource( resource, amount ) ) {
            if ( this.resources[ resource ] === undefined ) this.resources[ resource ] = 0;

            this.resources[ resource ] = this._round( this.resources[ resource ] + amount );
            this.call_listeners();
            return true;
        } else {
            return false;
        }

        return this;
    }

    modify_resources( resources ) {
        for ( let resource in resources ) {
            if ( ! this.can_modify_resource( resource, resources[ resource ] ) ) return false;
        }

        for ( let resource in resources ) {
            if ( this.resources[ resource ] === undefined ) this.resources[ resource ] = 0;

            this.resources[ resource ] = this._round( this.resources[ resource ] + resources[ resource ] );
        }
        this.call_listeners();

        return this;
    }
}

export { Base }
