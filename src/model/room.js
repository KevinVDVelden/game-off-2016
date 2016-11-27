import { Model } from "model/util"
import { JOB_LISTS } from 'machine'

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
    constructor(data, room_width) {
        super();
        if ( data == null ) throw "Room constructor needs a base room";

        this.data = data;
        this.room_width = room_width;
        this.machines = []

        for ( let i = 0; i < room_width * this.data.machines_per_size; i++ ) {
            this.machines[i] = null;
        }
    }

    set_parent( p ) {
        super.set_parent( p );
        this.base = p;
    }

    serialize( _ ) {
        _( this, { construct: 'Room', args: [ 'data' ] }, [ 'room_width', 'machines' ] );
        _( 'data', this.data.name, { func: 'BaseRoom' } );
    }
    post_deserialize() {
        for ( let offset = 0; offset < this.machines.length; offset++ ) {
            if ( this.machines[offset] ) this.add_machine_raw( offset, this.machines[offset] );
        }
    }

    get_position() {
        return [ this.offset * 200, this.level * 250 + 180 ];
    }

    add_machine_raw( offset, machine ) {
        machine.set_roomoffset( this, offset );
        machine.set_parent( this );

        this.machines[ offset ] = machine;
        this.call_listeners();
        return machine;
    }

    get_jobs() {
        let ret = [];

        for ( let machine of this.machines ) {
            if ( machine ) for ( let job of machine.get_jobs() ) {
                ret.push( job );
            }
        }

        return ret;
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
    constructor( data ) {
        super();
        if ( data == null ) throw "Machine constructor needs a data room";

        this.data = data;
        this.is_active = false;
        this.character = null;
        this.state = {};
    }

    set_parent( p ) {
        super.set_parent( p );
        this.room = p;
    }

    serialize( _ ) {
        _( this, { construct: 'Machine', args: [ 'data' ] }, [ 'is_active', 'character', 'state' ] );
        _( 'data', this.data.name, { func: 'BaseMachine' } );
    }

    get_position() {
        let ret = this.room.get_position();
        return [ ret[0] + this.centerX, ret[1] + this.centerY ];
    }

    get_jobs() {
        if ( JOB_LISTS[ this.data.name ] ) return JOB_LISTS[ this.data.name ]( this );
        return [];
    }

    set_roomoffset( room, offset ) {
        this.room = room;
        this.offset = offset;

        this.centerX = ( ( 200 / this.room.data.machines_per_size ) * ( this.offset + 0.5 ) ) | 0;
        //this.centerX += ( Math.random() * 20 - 10 ) | 0;
        //this.centerY = ( 18 + Math.random() * 30 - 15 ) | 0;
        this.centerY = 0;
    }

    set_active( is_active ) {
        if ( this.is_active == is_active ) return;
        this.is_active = is_active;

        if ( this.is_active ) {
            this.overlay = this.data.raw.overlay_active;
        } else {
            this.overlay = this.data.raw.overlay_inactive;
        }

        this.call_listeners();
    }

    set_character( character ) {
        this.character = character;
    }
}


export { BaseRoom, Room, BaseMachine, Machine }
