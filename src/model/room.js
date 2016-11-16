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
        this.base = base;
        this.room_width = room_width;
        this.machines = []

        for ( let i = 0; i < room_width * this.base.machines_per_size; i++ ) {
            this.machines[i] = null;
        }
    }

    add_machine_raw( offset, machine ) {
        machine.offset = offset;
        machine.room = this;

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
        this.base = base;
        this.is_active = false;
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
}


export { BaseRoom, Room, BaseMachine, Machine }
