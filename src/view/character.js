import { HtmlRender } from 'view/util'

class CharacterRender extends HtmlRender {
    html() {
        let final_html = ''

        for ( let file of this.model.parts ) {
            if ( file.length == 0 ) continue;

            final_html += `<img src="${file}">`
        }

        return `<div class="character">${final_html}</div>`
    }
}


export { CharacterRender }
