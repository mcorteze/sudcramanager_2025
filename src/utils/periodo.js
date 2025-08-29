// src/utils/periodo.js
export const getAnio = () => window?.ANIO ?? null;
export const getPeriodoNum = () => window?.PERIODO_NUM ?? null;
export const getPeriodoStr = () => window?.PERIODO ?? null;

export const requirePeriodo = () => {
  const p = getPeriodoStr();
  if (!p) throw new Error('Periodo no inicializado (asegura appConfig.load() antes).');
  return p;
};
