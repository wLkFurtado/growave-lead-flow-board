const isDev = import.meta.env.DEV;
const isVerbose = false; // ← DESLIGAR para produção

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDev && isVerbose) console.log(message, data);
  },
  info: (message: string, data?: any) => {
    if (isDev) console.log(message, data);
  },
  error: (message: string, error?: any) => {
    console.error(message, error);
  }
};