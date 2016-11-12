class BaseRoom {
    constructor(name, decorators, raw) {
        this.name = name;
        this.decorators = decorators;
        this.raw = raw;

        this.machines_per_size = raw['machines_per_size'] || 2;
    }
}

class Room {
    constructor(base, room_width) {
        this.base = base;
        this.room_width = room_width;
        this.machines = []

        for ( let i = 0; i < room_width * base.machines_per_size; i++ ) {
            this.machines[i] = null;
        }
    }

    add_machine_raw( offset, machine ) {
        machine.offset = offset;
        machine.room = this;

        this.machines[ offset ] = machine;
        return machine;
    }
}

class BaseMachine {
    constructor( name, image, raw ) {
        this.name = name;
        this.image = image;
        this.raw = raw;

        this.decorators = raw['decorators'] || ''
        this.character_before_image = raw['character_before_image'] === undefined ? true : raw['character_before_image'];
    }
}

class Machine {
    constructor( base ) {
        this.base = base;
    }
}


export { BaseRoom, Room, BaseMachine, Machine }
