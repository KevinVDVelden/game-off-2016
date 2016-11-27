import { HtmlChildOnlyRender, HtmlRender } from 'view/util'
import { StaticCharacterRender, CharacterRender } from 'view/character'

class HtmlMachineRender extends HtmlRender {
    html() {
        let machine = this.model;

        let final_html = `<img class="baseimage" src="${machine.data.image}">`

        if ( machine.character ) final_html += this.add_child( machine.character, StaticCharacterRender );
        if ( machine.overlay ) final_html += `<img class="overlay" src="${machine.overlay}">`


        return `<div style="top: ${machine.centerY+140-64}px; left: ${machine.centerX-64}px" class="machine machine_offset_${machine.offset} ${machine.data.decorators}">${final_html}</div>`
    }

    on_tick() {
        if ( this.model.overlay && this.model.data.raw.fade_overlay ) {
            this.element.find('.overlay').css( 'opacity', ( Math.random() * 0.4 ) + 0.5 );
        }
    }

    postinit_element() {
        this.element.children().click( (e) => this.controller.on_click( this, e ) );
    }
}

class RunLengthRenderer {
    constructor( html_impl ) {
        this.value = null;
        this.index = 0;
        this.length = 0;
        this.html_impl = html_impl;
    }

    set( value ) {
        let ret = null;
        if ( value == this.value ) {
            this.length += 1;
        } else {
            ret = this.html( this.value, this.index, this.length );
            this.value = value;
            this.length = 1;
        }

        this.index += 1;
        return ret;
    }

    html( value, end, length ) {
        if ( value == null ) return null;

        return this.html_impl( value, end - length, length );
    }
}

class HtmlRoomRender extends HtmlRender {
    html() {
        let machine_html = ''

        let last_machine = null;

        for ( let index in this.model.machines ) {
            let machine = this.model.machines[ index ];
            if ( machine == null ) {
                last_machine = null;
                continue;
            } else if ( last_machine == machine ) {
                continue;
            }

            machine_html += this.add_child( machine, HtmlMachineRender );
        }


        let ret = `<div class="room room_offset_${this.model.offset} room_size_${this.model.room_width} ${this.model.data.decorators}">`

        if ( !this.model.data.raw.ceiling ) ret += '<div class="room_ceiling">&nbsp;</div>';

        ret += `<div class="room_content">${machine_html}</div>`;

        if ( !this.model.data.raw.floor ) ret += '<div class="room_floor">&nbsp;</div>';

        ret += '</div>';

        return ret
    }
}

class HtmlLevelRender extends HtmlRender {
    html() {
        let level = this.model;
        let ceiling = new RunLengthRenderer( ( v, s, l ) => `<div class="room_part_ceiling room_offset_${s} room_size_${l}"><div style="background-image: url('${v}');">&nbsp;</div></div>` );
        let floor = new RunLengthRenderer( ( v, s, l ) => `<div class="room_part_floor room_offset_${s} room_size_${l}"><div style="background-image: url('${v}');">&nbsp;</div></div>` );

        let final_html = `<div class="room_level room_level_size_${level.length}">`;
        let last_room = null;
        let last_door = null;

        for ( let index = 0; index < level.length; index++ ) {
            let room = level[index];
            let cur_door = null;

            if (room === null) {
                final_html += '';
                final_html += ceiling.set( null ) || '';
                final_html += floor.set( null ) || '';
            } else {
                if (room !== last_room) {
                    final_html += this.add_child( room, HtmlRoomRender );
                }
                cur_door = room.data.raw.door;
                final_html += ceiling.set( room.data.raw.ceiling ) || '';
                final_html += floor.set( room.data.raw.floor ) || '';
            }

            if ( room !== last_room ) {
                if ( cur_door != null || last_door != null ) {
                    let door = cur_door || last_door;
                    final_html += `<div class="room_door room_offset_${index} ${door}"><div>&nbsp;</div></div>`
                }
            }

            last_door = cur_door;
            last_room = room;
        }
        if ( last_door ) final_html += `<div class="room_door room_offset_${level.length} ${last_door}"><div>&nbsp;</div></div>`
        final_html += ceiling.set( null ) || '';
        final_html += floor.set( null ) || '';

        final_html += "</div>";
        return final_html;
    }
}
class HtmlBaseRender extends HtmlChildOnlyRender {
    html() {
        let final_html = '';

        for ( let level of this.model.room_levels ) {
            final_html += this.add_child( level, HtmlLevelRender );
        }

        for ( let character of this.model.characters ) {
            final_html += this.add_child( character, CharacterRender );
        }

        return `<div class="room_list">${final_html}</div>`;
    }
    postinit_element() {
        this.element.children().click( e => this.controller.on_click( this, e ) );
    }
}


export { HtmlRoomRender, HtmlBaseRender }
