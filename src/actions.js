import { Action, ActionListModel } from 'model/actions'
import { BaseDrone } from 'model/character'
import * as research from 'research'

class Build extends Action {
    constructor() {
        super( 'build', 'Build' );
    }
}
class FillChamber extends Action {
    constructor() {
        super( 'fill_chamber', 'Fill chamber' );
    }
    is_allowed( sub_model, model, controller ) {
        return sub_model.character == null && model.can_modify_resource( 'resource_unconverted', -1 );
    }
}
class StartConversion extends Action {
    constructor() {
        super( 'start_conversion', 'Start conversion' );
    }
    is_allowed( sub_model, model, controller ) {
        return sub_model.character != null && sub_model.conversion_progress === undefined;
    }

    invoke( sub_model, model, controller ) {
        if ( ! sub_model.is_active ) {
            sub_model.set_active( true );
            sub_model.conversion_progress = 0;

            return this.tick;
        }
    }

    tick( sub_model, model, controller ) {
        if ( model.modify_resource( 'resource_energy', -0.1 ) ) {
            sub_model.conversion_progress += 1;
            sub_model.call_listeners();

            if ( sub_model.conversion_progress == 20 ) {
                let new_character = new BaseDrone( sub_model.character );
                let pos = sub_model.get_position();
                new_character.set_position( pos[0], pos[1] );
                controller.add_character( new_character );

                delete sub_model.conversion_progress;
                sub_model.character = null;
                sub_model.set_active( false );

                return null;
            }
        }

        return this.tick;
    }
}

class SelectResearchImpl extends Action {
    constructor( research_name ) {
        super( research_name, research.RESEARCH_LIST[research_name].display_name );
    }

    invoke( sub_model, model, controller ) {
    }
}

class SelectResearch extends Action {
    constructor() {
        super( 'select_research', 'Select research' );
    }

    invoke( sub_model, model, controller ) {
        let completed_researches = model.finished_researches.slice( 0 );
        let reachable_researches = [];

        for ( let research_name in research.RESEARCH_TREE ) {
            let requirements = research.RESEARCH_TREE[ research_name ];
            let add = true;

            if ( completed_researches.indexOf( research_name ) != -1 ) continue;

            for ( let i = 0; i < requirements.length; i++ ) {
                if ( completed_researches.indexOf( requirements[i] ) == -1 ) {
                    add = false;
                }
            }
            if ( add ) {
                reachable_researches.push( research_name )
            }
        }

        reachable_researches.sort( ( a, b ) => research.RESEARCH_LIST[a].index - research.RESEARCH_LIST[b].index );

        let research_list = new ActionListModel();

        for ( let i = 0; i < reachable_researches.length; i++ ) {
            research_list.add( new SelectResearchImpl( reachable_researches[i] ) );
        }
        controller.set_action_list( research_list, -1, -1 );
    }
}

let ACTIONS = [ new Build(), new FillChamber(), new StartConversion(), new SelectResearch() ];
Action.doneRegistring = true;

export { ACTIONS }
