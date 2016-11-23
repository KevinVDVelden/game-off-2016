let ACTIONS_BY_NAME = {};

class Action {
    constructor( name, display_name ) {
        this.name = name;
        this.display_name = display_name;

        if ( ! Action.doneRegistring ) {
            ACTIONS_BY_NAME[ this.name ] = this;
        }
    }

    is_visible( sub_model, model, controller ) {
        return true;
    }
    is_allowed( sub_model, model, controller ) {
        return true;
    }

    invoke( sub_model, model, controller ) {
        console.log( `Unimplemented action ${this.name} was invoked by ( ${sub_model}, ${model}, ${controller} )` );
    }
}
class ActionListModel {
    constructor( sub_model, model, controller ) {
        this.sub_model = sub_model;
        this.model = model;
        this.controller = controller;

        this.actions = [];
        this.actions_allowed = [];
    }

    add( action ) {
        if ( action.is_visible && action.is_allowed ) {
            if ( action.is_visible( this.sub_model, this.model, this.controller ) ) {
                this.actions.push( action );
                this.actions_allowed.push( action.is_allowed( this.sub_model, this.model, this.controller ) );
            }
        } else if ( ACTIONS_BY_NAME[ action ] ) {
            return this.add( ACTIONS_BY_NAME[ action ] );
        } else {
            throw "Unsure what to do with the given action (" + action + ")";
        }
    }
}


export { ACTIONS_BY_NAME, Action, ActionListModel };
