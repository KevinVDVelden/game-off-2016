import * as model from "model/model"
import * as view from "view/view"
import { NAMED_ROOM_DEFINITIONS } from 'data'

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

class CharacterRender extends view.util.HtmlRender {
    html() {
        let final_html = ''

        for ( let file of this.model.parts ) {
            if ( file.length == 0 ) continue;

            final_html += `<img src="${file}">`
        }

        return `<div class="character">${final_html}</div>`
    }
}

let npc = new model.character.NPCCharacter()
console.log( npc );

$('h2').after( views.add_view( new CharacterRender( $('<div></div>'), new model.character.NPCCharacter() ) ).element );
$('h2').after( views.add_view( new CharacterRender( $('<div></div>'), new model.character.NPCCharacter() ) ).element );
$('h2').after( views.add_view( new CharacterRender( $('<div></div>'), new model.character.NPCCharacter() ) ).element );
$('h2').after( views.add_view( new CharacterRender( $('<div></div>'), new model.character.NPCCharacter() ) ).element );
$('h2').after( views.add_view( new CharacterRender( $('<div></div>'), new model.character.NPCCharacter() ) ).element );
$('h2').after( views.add_view( new CharacterRender( $('<div></div>'), new model.character.NPCCharacter() ) ).element );

views.render();
