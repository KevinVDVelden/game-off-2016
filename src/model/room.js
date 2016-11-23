import { Model } from "model/util"

class BaseRoom extends Model {
    constructor(name, decorators, raw) {
        super();
        this.name = name;
        this.decorators = decorators;
        this.raw = raw;

        this.machines_per_size = raw['machines_per_size'] || 2;
    }
}

class Room extends Model {
    constructor(base, room_width) {
        super();
        if ( base == null ) throw "Room constructor needs a base room";

        this.base = base;
        this.room_width = room_width;
        this.machines = []

        for ( let i = 0; i < room_width * this.base.machines_per_size; i++ ) {
            this.machines[i] = null;
        }
    }

    get_position() {
        return [ this.offset * 200, this.level * 250 + 180 ];
    }

    add_machine_raw( offset, machine ) {
        machine.set_roomoffset( this, offset );
        machine.room = this;
        machine.model_parent = this;

        this.machines[ offset ] = machine;
        this.call_listeners();
        return machine;
    }
}

class BaseMachine extends Model {
    constructor( name, image, raw ) {
        super();
        this.name = name;
        this.image = image;
        this.raw = raw;

        this.decorators = raw['decorators'] || ''
        this.character_before_image = raw['character_before_image'] === undefined ? true : raw['character_before_image'];
    }
}

class Machine extends Model {
    constructor( base ) {
        super();
        if ( base == null ) throw "Machine constructor needs a base room";

        this.base = base;
        this.is_active = false;
        this.character = null;
    }

    get_position() {
        let ret = this.room.get_position();
        return [ ret[0] + this.centerX, ret[1] + this.centerY ];
    }

    set_roomoffset( room, offset ) {
        this.room = room;
        this.offset = offset;

        this.centerX = ( ( 200 / this.room.base.machines_per_size ) * ( this.offset + 0.5 ) ) | 0;
        //this.centerX += ( Math.random() * 20 - 10 ) | 0;
        //this.centerY = ( 18 + Math.random() * 30 - 15 ) | 0;
        this.centerY = 0;
    }

    set_active( is_active ) {
        if ( this.is_active == is_active ) return;
        this.is_active = is_active;

        if ( this.is_active ) {
            this.overlay = this.base.raw.overlay_active;
        } else {
            this.overlay = this.base.raw.overlay_inactive;
        }

        this.call_listeners();
    }

    set_character( character ) {
        this.character = character;
    }
}


export { BaseRoom, Room, BaseMachine, Machine }
