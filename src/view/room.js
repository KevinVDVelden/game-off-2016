import { HtmlRender } from 'view/util'
import { CharacterRender } from 'view/character'

class HtmlMachineRender {
    html( machine ) {
        machine = machine || this.model;

        let final_html = `<img class="baseimage" src="${machine.base.image}">`

        if ( machine.character ) final_html += new CharacterRender( null, machine.character ).html();
        if ( machine.overlay ) final_html += `<img class="overlay" src="${machine.overlay}">`

        if ( machine.css_margin_top === undefined ) machine.css_margin_top = ( 82 + Math.random() * 30 - 15 ) | 0;
        if ( machine.css_left === undefined ) machine.css_left = ( 100 * machine.offset + Math.random() * 20 - 10 - 14 ) | 0; //Machine images are 128px wide, but they're centered every 100, chop of 14px

        return `<div style="margin-top: ${machine.css_margin_top}px; left: ${machine.css_left}px" class="machine machine_offset_${machine.offset} ${machine.base.decorators}">${final_html}</div>`
    }
}

class HtmlRoomRender {
    html( room ) {
        room = room || this.model;

        let machine_render = new HtmlMachineRender()
        let machine_html = ''

        let last_machine = null;

        for ( let index in room.machines ) {
            let machine = room.machines[ index ];
            if ( machine == null ) {
                last_machine = null;
                continue;
            } else if ( last_machine == machine ) {
                continue;
            }

            machine_html += machine_render.html( machine )
        }


        return `<div class="room room_offset_${room.offset} room_size_${room.room_width} ${room.base.decorators}">
            <div class="room_ceiling">
                &nbsp;
            </div>
            <div class="room_content">
                ${machine_html}
            </div>
            <div class="room_floor">
                &nbsp;
            </div>
        </div>`;
    }
}

class HtmlBaseRender extends HtmlRender {
    html( room_render ) {
        if ( room_render == null ) room_render = new HtmlRoomRender();

        let final_html = '';

        for ( let level of  this.model.room_levels ) {
            final_html += `<div class="room_level room_level_size_${level.length}">`;
            let last_room = null;

            for ( let index in level ) {
                let room = level[index];
                if (room === null) {
                    final_html += '';
                } else if (room !== last_room) {
                    final_html += room_render.html( room );
                }
                last_room = room;
            }

            final_html += "</div>";
        }

        return `<div class="room_list">${final_html}</div>`;
    }

    render( room_render = null ) {
       this.element.html( this.html( room_render ) );
    }
}


export { HtmlRoomRender, HtmlBaseRender }
