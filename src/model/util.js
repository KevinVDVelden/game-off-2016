class Model {
    constructor() {
        this.listeners = [];
    }

    set_parent( p ) {
        this.model_parent = p;
    }

    call_listeners() {
        for ( let listener of this.listeners ) {
            listener( this );
        }
        if ( this.model_parent ) {
            this.model_parent.call_listeners();
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
