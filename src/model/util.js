class Model {
    constructor() {
        this.listeners = [];
    }

    call_listeners() {
        for ( let listener of this.listeners ) {
            listener( this );
        }
    }

    add_listener( listener ) {
        if ( this.listeners.indexOf( listener ) == -1 ) {
            this.listeners[ this.listeners.length ] = listener;
        }
    }
    remove_listener( listener ) {
        let index = -1;
        while ( ( index = this.listeners.indexOf( listener ) ) != -1 ) {
            this.listeners.splice( index, 1 );
        }
    }
}

export { Model }
