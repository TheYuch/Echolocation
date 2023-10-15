export const MS_PER_TICK = 1000;
export const MATRIX_LENGTH = 10;
export const CELL_NOTE_COLORS = {
    // roygbiv
    a: '#F10000',
    b: '#F17900',
    c: '#F1F100',
    d: '#79F100',
    e: '#008BD5',
    f: '#0F3DCA',
    g: '#B917E8'
};
export const CELL_SIGNAL_COLORS = {
    metronome: 'rgba(255, 167, 161, 0.5)', // pink
    noteAdjuster: 'rgba(173, 143, 52, 0.4)' // gold
};
export const CELL_SELECT_COLOR = 'lightblue'; // TODO make it flash
export const CELL_NOTE_DEFAULT_OCTAVE = 4;
export const CELL_METRONOME_DEFAULT_TICKSPERBEAT = 4;
export const CELL_NOTEADJUSTER_DEFAULT_TICKSPERBEAT = 4;
export const NOTES_STRING = 'abcdefg'; // TODO: make list with accidentals so that every note adjustment increases by a half-step