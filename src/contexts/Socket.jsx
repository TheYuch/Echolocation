import { io } from 'socket.io-client';

const SOCKET_URL = 'https://stoked-champion-402109.wl.r.appspot.com/';
// const SOCKET_URL = 'http://localhost:8000';

export const socket = io(SOCKET_URL);