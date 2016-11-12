import { HtmlRender } from 'view/util'

class HtmlRoomRender {
    html( room ) {
        return `<div class="room room_offset_${room.offset} room_size_${room.room_width} ${room.base.decorators}">
            <div class="room_ceiling">
                &nbsp;
            </div>
            <div class="room_content">
                &nbsp;
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
