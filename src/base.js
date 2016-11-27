import * as model from "model/model"
import * as view from "view/view"
import { Story } from 'story'
import { NAMED_ROOM_DEFINITIONS, NAMED_MACHINE_DEFINITIONS } from 'data'
import * as action_list from 'actions'

const TICK_TIME = 1000 / 10;
const MAX_REMAINING_TICKS = 100;

class ViewCollection {
    constructor() {
        this.views = []
    }

    add_view( view ) {
        this.views[ this.views.length ] = view;
        return view;
    }
    remove_view( view ) {
        let index;
        while ( ( index = this.views.indexOf( view ) ) > -1 ) {
            this.views.splice( index, 1 );
        }
        return view;
    }

    clear_views( view ) {
        this.views = []
    }

    render() {
        for ( let viewI in this.views ) {
            let view = this.views[ viewI ];
            view.render();
        }
    }
    tick() {
        for ( let viewI in this.views ) {
            let view = this.views[ viewI ];
            view.tick();
        }
    }
};
let SerializeConstructors = {
    NPCCharacter: model.character.NPCCharacter,
    BaseCharacter: model.character.BaseCharacter,
    BaseDrone: model.character.BaseDrone,

    Room: model.Room,
    Base: model.Base,
    Machine: model.Machine,

    Story: Story,
};
let SerializeFunctions = {
    BaseRoom: n => NAMED_ROOM_DEFINITIONS[ n ],
    BaseMachine: n => NAMED_MACHINE_DEFINITIONS[ n ],
}
class Serialize {
    constructor() {
        this.count = 0;
    }
    serialize( walk_root, walk_store, global_store ) {
        this.count += 1;
        if ( this.count > 10000 ) return '##ERROR' + this.count;

        let thisWalk = this.serialize.bind( this );
        let args = [];
        function callback( object, type, params ) {
            if ( typeof( object ) == 'object' ) {
                let object = arguments[0], type = arguments[1], params = arguments[2];
                walk_store[ '__proto' ] = type;

                for ( let i = 0; i < params.length; i++ ) {
                    let param_name = params[i];
                    if ( param_name.startsWith( '__' ) ) continue;

                    walk_store[ param_name ] = thisWalk( object[ param_name ], {}, global_store );
                }

                if ( type.args ) {
                    for ( let i = 0; i < type.args.length; i++ ) {
                        args.push( type.args[i] );
                    }
                }
            } else {
                walk_store[ object ] = thisWalk( type, {}, global_store );
                if ( params ) {
                    walk_store[ '__var' + object ] = params;
                } 
            }
        }

        if ( walk_root == null || walk_root === undefined ) {
            return null;
        } else if ( walk_root.serialize ) {
            if ( !global_store[ walk_root.__serialized_as ] ) {
                walk_root.__serialized_as = global_store.length;
                global_store.push( '#BUILDING#' );
                walk_root.serialize( callback );

                for ( let i = 0; i < args.length; i++ ) {
                    let param_name = args[i];

                    if ( ! walk_store[ param_name ] ) walk_store[ param_name ] = this.serialize( walk_root[ param_name ], {}, global_store );
                }

                global_store[ walk_root.__serialized_as ] = walk_store;
            }
            return '###REF###' + walk_root.__serialized_as;
        } else {
            switch ( typeof( walk_root ) ) {
                case 'string':
                case 'number':
                case 'boolean':
                    return walk_root;
                case 'object':
                    if ( walk_root.constructor === Array ) {
                        walk_store[ '__proto' ] = 'array';
                    } else {
                        walk_store[ '__proto' ] = 'object';
                    }

                    for ( let key in walk_root ) {
                        walk_store[ key ] = this.serialize( walk_root[ key ], {}, global_store );
                    }

                    break;
                case "function":
                    throw `Not serializing function "${walk_root.name}"`;
                default:
                    throw `Can't figure out what to do with "${walk_root}"`;
            }
        }

        return walk_store;
    }

    do_deserialize( store, global_store, proto ) {
        if ( store == null || store === undefined ) return store;
        if ( store.startsWith && store.startsWith( '###REF###' ) ) {
            let index = store.substr( 9 ) * 1;
            if ( !global_store[ index ] ) throw "Unable to match reference " + store;
            return global_store[ index ];
        }
        switch ( typeof( store ) ) {
            case 'string':
            case 'number':
            case 'boolean':
                if ( proto ) {
                    if ( proto.construct ) return new SerializeConstructors[ proto.construct ]( store );
                    if ( proto.func ) return SerializeFunctions[ proto.func ]( store );
                }

                return store;
        }

        let temp = {};
        for ( let key in store ) {
            if ( key == '__proto' || key.startsWith( '__var' ) ) continue;

            if ( store[ '__var' + key ] ) {
                temp[ key ] = this.do_deserialize( store[ key ], global_store, store[ '__var' + key ] );
            } else {
                temp[ key ] = this.do_deserialize( store[ key ], global_store );
            }
        }

        if ( !proto ) proto = store['__proto'];
        if ( !proto ) proto = typeof( store );

        let ret = null;
        switch ( proto ) {
            case 'array': ret = []; break;
            case 'object': ret = {}; break;
            default:
                let args = [null];
                if ( proto.args ) {
                    for ( let i = 0; i < proto.args.length; i++ ) args.push( temp[ proto.args[ i ] ] );
                }

                if ( !SerializeConstructors[ proto.construct ] ) {
                    throw `Unable to find constructor for ${proto.construct}`;
                } else {
                    let construct = SerializeConstructors[ proto.construct ];
                    let temp = construct.bind.apply( construct, args );
                    ret = new temp();
                }
                break;
        }

        for ( let key in temp ) {
            if ( key == '__proto' || ( key.startsWith && key.startsWith( '__var' ) ) ) continue;

            ret[ key ] = temp[ key ];
        }

        if ( ret.post_deserialize ) {
            ret.post_deserialize();
        }

        return ret;
    }

    deserialize( store, global_store ) {
        let errored = true;
        let completed = {};
        let attempts = 0;

        while ( errored ) {
            errored = false;
            attempts += 1;

            if ( attempts == 100 ) break;
            for ( let i = 0; i < global_store.length; i++ ) {
                if ( completed[ i ] ) continue;

                try {
                    completed[ i ] = this.do_deserialize( global_store[ i ], completed );
                } catch ( e ) {
                    errored = true;
                    if ( attempts == 99 ) console.log( e );
                }
            }
        }

        return this.do_deserialize( store, completed );
    }
};

class BaseController {
    constructor() {
        this.views = new ViewCollection();
        this.render_queued = false;

        this.base = new model.Base();

        this.tick_elements = [];

        //Create initial game state
        this.base.add_level( 5 );
        this.base.add_room_raw( 0, 0, new model.Room( NAMED_ROOM_DEFINITIONS['outside'], 1 ) );
        this.base.add_room_raw( 0, 1, new model.Room( NAMED_ROOM_DEFINITIONS['outside_door'], 1 ) );
        let conversion = this.base.add_room_raw( 0, 2, new model.Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) );
        let chamber = conversion.add_machine_raw( 1, new model.Machine( NAMED_MACHINE_DEFINITIONS[ 'conversion_chamber' ] ) );
        chamber.set_character( new model.character.NPCCharacter() );

        this.base.modify_resource( 'resource_energy', 5 );

        this.story = new Story( this.base, {} );

        this.accumulator = 0;
        $('body').click( e => this.on_click( this, e ) );
        this.on_render( 0 );

        this.reload();

        this.cur_save_slot = 0;

        $('#save_button').click( e => this.save( 1, false ) );
        $('#load_button').click( e => this.load( 1, false ) );
    }

    save( slot, auto ) {
        this.cur_save_slot = slot;

        let serializer = new Serialize();
        let global = [];
        let data = serializer.serialize( { story: this.story, base: this.base }, {}, global );

        localStorage.setItem( `augmentSave_${slot}_${auto}`, JSON.stringify( [ data, global ] ) );
    }
    load( slot, auto ) {
        this.cur_save_slot = slot;

        let serializer = new Serialize();
        let data = JSON.parse( localStorage.getItem( `augmentSave_${slot}_${auto}` ) );
        let deserialized = serializer.deserialize( data[0], data[1] )

        this.base = deserialized.base;
        this.story = deserialized.story;

        this.reload();
    }


    reload_sim() {
        this.save( 1, true );
        this.load( 1, true );

        this.reload();
    }

    reload() {
        this.base.add_listener( e => this.on_update() );

        this.room_view = this.views.add_view( new view.room.HtmlBaseRender( $('#room_listing'), this.base, this ) );
        this.actions_view = null;
        this.views.add_view( new view.ResourceRenderer( $('#resource_listing'), this.base, this ) );
    }

    add_character( character ) {
        this.base.add_character( character );
    }

    on_click( sender, e ) {
        if ( e.stopPropagation ) e.stopPropagation();

        //console.log( 'Click', sender, e );

        if ( this.actions_view && ! this.actions_view.is_new ) {
            this.views.remove_view( this.actions_view );
            this.actions_view.element.remove();
            this.actions_view = null;
        }

        if ( sender === null || sender === undefined ) return;

        let sendermodel = sender.model;
        if ( sendermodel && sendermodel.data && sendermodel.data.raw && sendermodel.data.raw.actions ) {
            let visible_actions = new model.actions.ActionListModel( sendermodel, this.base, this );

            for ( let action_name of sendermodel.data.raw.actions ) {
                visible_actions.add( action_name );
            }

            this.set_action_list( visible_actions, e.pageX, e.pageY );
        }
    }
    on_pick_action( sender, target_model, action, e ) {
        //console.log( 'Pick action', sender, target_model, action, e );
        this.views.remove_view( this.actions_view );
        this.actions_view.element.remove();
        this.actions_view = null;

        let next_tick = action.invoke( target_model, this.base, this );
        if ( next_tick ) {
            this.tick_elements.push( [ next_tick, action, [ target_model, this.base, this ] ] );
        }
    }

    on_tick() {
        let index = 0, length = this.tick_elements.length;
        while ( index < length ) {
            let ticker = this.tick_elements[ index ];

            let next_tick = ticker[ 0 ].apply( ticker[ 1 ], ticker[ 2 ] );

            if ( next_tick ) {
                ticker[ 0 ] = next_tick;
                index += 1;
            } else {
                this.tick_elements.splice( index, 1 ); length -= 1;
            }
        }

        let idle_drones = 0;
        for ( let character of this.base.characters ) {
            character.tick();
            if ( character.type == 'drone' && character.state == 'idle' ) idle_drones += 1;
        }
        this.base.set_resource_raw( 'resource_idle_drones', idle_drones );
        this.views.tick();
        this.story.tick();
    }

    on_update() {
        this.render_queued = true;
    }

    set_action_list( visible_actions, x, y ) {
        if ( x == -1 ) x = this.lastActionListX; else this.lastActionListX = x;
        if ( y == -1 ) y = this.lastActionListY; else this.lastActionListY = y;

        if ( visible_actions.actions.length > 0 ) {
            let element = $(`<div style="position: absolute; top: ${y}px; left: ${x}px;"></div>`);
            $('body').append( element );
            this.actions_view = this.views.add_view( new view.action.HtmlActionListRender( element, visible_actions, this ) );
            this.actions_view.is_new = true;
            this.on_update();
        }
    }
    on_render( time ) {
        if ( this.render_queued ) {
            this.render_queued = false;
            this.views.render();
            if ( this.actions_view ) this.actions_view.is_new = false;
        }

        window.requestAnimationFrame( time => this.on_render( time ) );
        if ( this.init_time === undefined ) {
            this.init_time = time;
            return;
        }

        this.accumulator += time - this.init_time;
        this.init_time = time;
        if ( this.accumulator > MAX_REMAINING_TICKS * TICK_TIME ) {
            console.log( `Skipping ${this.accumulator/TICK_TIME} ticks!` );
            this.accumulator = 0;
        }
        while ( this.accumulator > TICK_TIME ) {
            this.on_tick();
            this.accumulator -= TICK_TIME;
        }
    }
}

/*
 * let views = new ViewCollection()
views.add_view( new view.room.HtmlBaseRender( $('#room_listing'), base ) );
views.add_view( new view.ResourceRenderer( $('#resource_listing'), base ) );

views.render();
*/

/*
$('h2').after( views.add_view( new view.character.CharacterRender( $('<div></div>'), new model.character.NPCCharacter() ) ).element );
*/

window.game = new BaseController();
export { Serialize }
//window.game_base = base
//window.game_views = views
//window.game = [ base, views ]
