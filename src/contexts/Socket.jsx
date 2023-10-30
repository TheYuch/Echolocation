import { io } from 'socket.io-client';

const SOCKET_URL = 'https://echolocation-server-jgwu2mlq5q-wl.a.run.app';
// const SOCKET_URL = 'http://localhost:8000'; // For local server only

export const socket = io(SOCKET_URL);