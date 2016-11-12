import * as model from "model/model"
import * as view from "view/view"
import { NAMED_ROOM_DEFINITIONS, NAMED_MACHINE_DEFINITIONS } from 'data'

let base = new model.Base();
base.add_level( 5 );
base.add_level( 5 );
base.add_level( 5 );
base.add_level( 5 );
base.add_level( 5 );

base.add_room_raw( 0, 0, new model.Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) );
base.add_room_raw( 0, 2, new model.Room( NAMED_ROOM_DEFINITIONS['research'], 2 ) );
base.add_room_raw( 1, 1, new model.Room( NAMED_ROOM_DEFINITIONS['conversion'], 1 ) );
base.add_room_raw( 1, 3, new model.Room( NAMED_ROOM_DEFINITIONS['research'], 2 ) );
base.add_room_raw( 2, 2, new model.Room( NAMED_ROOM_DEFINITIONS['conversion'], 3 ) );
base.add_room_raw( 3, 1, new model.Room( NAMED_ROOM_DEFINITIONS['research'], 4 ) );
base.add_room_raw( 4, 0, new model.Room( NAMED_ROOM_DEFINITIONS['conversion'], 5 ) );

base.modify_resources( { 'resource_metal': 5, 'resource_unconverted': 3 } );

let m1 = base.room( 0, 0 ).add_machine_raw( 0, new model.Machine( NAMED_MACHINE_DEFINITIONS[ 'conversion_chamber'] ) );
let m2 = base.room( 0, 0 ).add_machine_raw( 1, new model.Machine( NAMED_MACHINE_DEFINITIONS[ 'conversion_chamber'] ) );

for ( let i = 0; i < 4; i++ ) {
    let machine = base.room( 0, 2 ).add_machine_raw( i, new model.Machine( NAMED_MACHINE_DEFINITIONS[ 'conversion_chamber'] ) );
    machine.character = new model.character.NPCCharacter();
}

class ViewCollection {
    constructor() {
        this.views = []
    }

    add_view( view ) {
        this.views[ this.views.length ] = view;
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
};

let views = new ViewCollection()
views.add_view( new view.room.HtmlBaseRender( $('#room_listing'), base ) );
views.add_view( new view.ResourceRenderer( $('#resource_listing'), base ) );

views.render();

/*
$('h2').after( views.add_view( new view.character.CharacterRender( $('<div></div>'), new model.character.NPCCharacter() ) ).element );
*/

views.render();
window.game_base = base
window.game_views = views
window.game = [ base, views ]
