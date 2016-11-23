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

class BaseController {
    constructor() {
        this.views = new ViewCollection();
        this.render_queued = false;

        this.base = new model.Base();
        this.base.add_listener( e => this.on_update() );

        this.room_view = this.views.add_view( new view.room.HtmlBaseRender( $('#room_listing'), this.base, this ) );
        this.actions_view = null;
        this.views.add_view( new view.ResourceRenderer( $('#resource_listing'), this.base, this ) );

        this.tick_elements = [];

        //Create initial game state
        this.base.add_level( 5 );
        this.base.add_room_raw( 0, 0, new model.Room( NAMED_ROOM_DEFINITIONS['outside'], 1 ) );
        this.base.add_room_raw( 0, 1, new model.Room( NAMED_ROOM_DEFINITIONS['outside_door'], 1 ) );
        let conversion = this.base.add_room_raw( 0, 2, new model.Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) );
        let chamber = conversion.add_machine_raw( 1, new model.Machine( NAMED_MACHINE_DEFINITIONS[ 'conversion_chamber' ] ) );
        chamber.set_character( new model.character.NPCCharacter() );

        this.base.modify_resource( 'resource_energy', 5 );

        this.story = new Story( this, {} );

        this.accumulator = 0;
        $('body').click( e => this.on_click( this, e ) );
        this.on_render( 0 );
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
        if ( sendermodel && sendermodel.base && sendermodel.base.raw && sendermodel.base.raw.actions ) {
            let visible_actions = new model.actions.ActionListModel( sendermodel, this.base, this );

            for ( let action_name of sendermodel.base.raw.actions ) {
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
//window.game_base = base
//window.game_views = views
//window.game = [ base, views ]
