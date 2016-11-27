import { NAMED_ROOM_DEFINITIONS, NAMED_MACHINE_DEFINITIONS } from 'data'
import * as model from "model/model"

function _( a, b ) {
    if ( b === null || b === undefined ) b = {};

    for ( let index in a ) {
        if ( b[ index ] === undefined ) b[ index ] = a[ index ];
    }
    return b;
}

let NEXT_PAGE = { action: 'next_page' };
let NEXT_PAGE_BUTTON = { buttons: [ { text: '...', effect: NEXT_PAGE } ] };
let NEXT_PAGE_TIMED = _( NEXT_PAGE, { wait: 40 } );

function wrap( source ) {
    return function( b ) {
        return _( source, b );
    }
}
NEXT_PAGE = wrap( NEXT_PAGE );
NEXT_PAGE_BUTTON = wrap( NEXT_PAGE_BUTTON );
NEXT_PAGE_TIMED = wrap( NEXT_PAGE_TIMED );

let storyImpl = {
    opening: function opening( base, state ) {
        if ( state.page < 5 )
            return NEXT_PAGE_TIMED( { story: 'BOOTING' + '.'.repeat( state.page + 2 ), wait: 5 } );
        switch ( state.page ) {
            case 5: return NEXT_PAGE_BUTTON( { story: '<p>What have we here?</p><p>It seems that my systems have been restarted.</p>' } );
            case 6: return NEXT_PAGE_BUTTON( { story: 'Hmm, we even have a volunteer waiting. That might have caused the restart.' } );
            case 7: return NEXT_PAGE( { story: "<p>Well then, time to take over the world.</p><p>I'll need to start the conversion chamber with our volunteer inside.</p>" } );
            case 8: if ( base.can_modify_resource( 'resource_idle_drones', -1 ) ) return NEXT_PAGE(); else return { wait: 10 };
            case 9: return NEXT_PAGE_BUTTON( { story: "Excellent, now where did I leave those resources..." } );
            case 10: return NEXT_PAGE_TIMED( { story: '... hmmm' } );
            case 11: {
                let research = base.add_room_raw( 0, 3, new model.Room( NAMED_ROOM_DEFINITIONS['research'], 1 ) );
                research.add_machine_raw( 0, new model.Machine( NAMED_MACHINE_DEFINITIONS['research_station'] ) );
                base.modify_resource( 'resource_metal', 100 );
                base.modify_resource( 'resource_energy', 7 );
                return NEXT_PAGE_TIMED( { story: 'Ah there they were.' } );
            }
            case 12: return NEXT_PAGE_BUTTON( { story: 'There we go, we should be able to start researching something now.' } );
        }
    }
}

class Story {
    constructor( base ) {
        this.state = { chapter: 'opening', page: 0 };
        this.base = base;

        this.impl = null;
    }

    serialize( _ ) {
        _( this, { construct: 'Story', args: [ 'base' ] }, [ 'state', 'cur_story_text' ] );
    }
    post_deserialize() {
        this.set_story( { story: this.cur_story_text } );
    }

    next_page() {
        this.state.page++;
    }
    set_page( page ) {
        this.page = page;
    }

    tick() {
        if ( this.state.wait == 'button' ) return;
        if ( this.state.wait > 0 ) {
            this.state.wait -= 1;
            return;
        }
        $('#debug').html( JSON.stringify( this.state ) );

        if ( this.impl || storyImpl[ this.state.chapter ] ) {
            if (this.impl == null ) {
                this.impl = storyImpl[ this.state.chapter ];
            }

            let ret = this.impl( this.base, this.state );

            if ( !ret ) return;
            this.handle_event( ret );
        }
    }

    handle_event( ret ) {
        if ( ret.done ) {
            this.impl = null;
            this.state.chapter = null;
        }

        switch ( ret.action ) {
            case 'next_page': this.next_page(); break;
        }

        if ( ret.story ) { this.set_story( ret ); }
        if ( ret.page ) { this.state.page = ret.page; }

        this.state.wait = -1;
        if ( ret.wait ) { this.state.wait = ret.wait; }
        if ( ret.buttons ) { this.set_buttons( ret.buttons ); } else $('#story_view .buttons').hide();
    }

    set_buttons( buttons ) {
        let button_container = $('#story_view .buttons');
        button_container.show();
        button_container.empty();

        this.state.wait = 'button';

        for ( let i = 0; i < buttons.length; i++ ) {
            let elem = $(`<span class="button">${buttons[i].text}</span>`);

            let effect = buttons[i].effect;
            elem.click( e => this.handle_event( effect ) );

            button_container.append( elem );
        }
    }

    set_story( ret ) {
        this.cur_story_text = ret.story;

        if ( ret.story == '' ) {
            $('#story_view').hide();
        } else {
            $('#story_view').show();
        }
        if ( ret.story.indexOf('<p>') == -1 ) ret.story = `<p>${ret.story}</p>`;
        $('#story').html( ret.story );
    }
};

export { Story };
