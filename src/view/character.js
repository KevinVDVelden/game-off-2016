import { HtmlRender } from 'view/util'

class StaticCharacterRender extends HtmlRender {
    html() {
        let final_html = this.render_parts( this.model.parts );
        return `<div class="static_character part_stack">${final_html}</div>`
    }
}
class CharacterRender extends StaticCharacterRender {
    html() {
        let final_html = this.render_parts( this.model.parts );
        return `<div style="position: absolute" class="character part_stack">${final_html}</div>`
    }
    on_tick() {
        this.element.children().css( { left: `${this.model.posX|0}px`, top: `${this.model.posY|0}px` } );
    }
}


export { StaticCharacterRender, CharacterRender }
