import { HtmlRender } from 'view/util'

class HtmlActionRender extends HtmlRender {
    html() {
        let action = this.model.action
        let is_allowed = this.model.allowed ? 'action_allowed' : 'action_blocked';

        return `<div class="action action_${action.name} ${is_allowed}">${action.display_name}</div>`;
    }
    postinit_element() {
        if ( this.model.allowed ) this.element.click( e => this.controller.on_pick_action( this, this.model.sub_model, this.model.action, e ) );
    }
}
class HtmlActionListRender extends HtmlRender {
    html() {
        let final_html = '';

        for ( let index in this.model.actions ) {
            let action = this.model.actions[index];
            let is_allowed = this.model.actions_allowed[ index ];

            final_html += this.add_child_impl( action.name, { action: action, allowed: is_allowed, sub_model: this.model.sub_model }, HtmlActionRender );
        }

        return `<div class="actions_list">${final_html}</div>`;
    }
}

export { HtmlActionListRender }
