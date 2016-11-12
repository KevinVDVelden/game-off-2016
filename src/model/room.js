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
}


export { BaseRoom, Room }
