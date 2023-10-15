import { io } from 'socket.io-client';

const SOCKET_URL = 'https://stoked-champion-402109.wl.r.appspot.com/';

export const socket = io(SOCKET_URL);