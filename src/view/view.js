import * as util from 'view/util'
import * as room from 'view/room'

import { RESOURCE_RENDER_LIST } from 'data'

class ResourceRenderer extends util.HtmlRender {
    html() {
        let final_html = ''

        for ( let resource of RESOURCE_RENDER_LIST ) {
            let amount = this.model.resources[ resource[1] ];
            if ( amount === undefined ) amount = 0;

            if ( resource.length > 2 ) {
                if ( amount == 0 && resource[2].indexOf( ' autohide ' ) >= 0 ) continue;
                if ( resource[2].indexOf( ' hide ' ) >= 0 ) continue;
            }

            final_html += `<li>${resource[0]}: ${amount}</li>`;
        }

        return `<ul>${final_html}</ul>`
    }
}

export { room, util, ResourceRenderer }
