import { setupServer } from 'msw/node';
export { http, HttpResponse } from 'msw';

export const server = setupServer();
