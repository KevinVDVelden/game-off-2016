import * as research from 'research'


function research_machine_tick( machine ) {
    if ( machine.character == null ) return;

    let cur_research = base.current_researches[ machine.data.name ];
    if ( cur_research ) cur_research = research.RESEARCH_LIST[ cur_research ];

    if ( cur_research ) {
        machine.set_active( true );

        if ( base.modify_resource( cur_research.material_cost ) ) {
            this.cur_research.tick( base );
        }
    } else {
        machine.set_active( false );
    }
}
function research_machine_jobs( machine ) {
    if ( machine.character != null ) return [];

    console.log( machine.room.base );
    if ( machine.room.base.current_researches[ machine.data.name ] ) return { name: 'Research', prio: 1 };
}

let CONTROLLERS = { research_station: research_machine_tick };
let JOB_LISTS = { research_station: research_machine_jobs };

export { CONTROLLERS, JOB_LISTS };
