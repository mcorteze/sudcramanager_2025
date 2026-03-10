/* eslint-env browser */
import axios from 'axios';

class AppConfig {
  anio = null;
  periodo = null;
  periodoStr = null;
  isLoaded = false;
  loadPromise = null;

  async load() {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/anioperiodo');
        const row = Array.isArray(data) ? data[0] : data;

        const anio = Number(row?.anio);
        const periodo = Number(row?.periodo);
        const periodoStr = `${anio}${String(periodo).padStart(3, '0')}`;

        this.anio = anio;
        this.periodo = periodo;
        this.periodoStr = periodoStr;
        this.isLoaded = true;

        if (typeof window !== 'undefined') {
          window.ANIO = this.anio;
          window.PERIODO_NUM = this.periodo;
          window.PERIODO = this.periodoStr;
        }

        return this;
      } catch (error) {
        console.error('Error al obtener año/periodo:', error);

        const anio = new Date().getFullYear();
        const periodo = 1;
        const periodoStr = `${anio}${String(periodo).padStart(3, '0')}`;

        this.anio = anio;
        this.periodo = periodo;
        this.periodoStr = periodoStr;
        this.isLoaded = true;

        if (typeof window !== 'undefined') {
          window.ANIO = this.anio;
          window.PERIODO_NUM = this.periodo;
          window.PERIODO = this.periodoStr;
        }

        return this;
      }
    })();

    return this.loadPromise;
  }

  getAnio() { return this.anio; }
  getPeriodoNum() { return this.periodo; }
  getPeriodoStr() { return this.periodoStr; }
  ready() { return this.isLoaded; }
}

export const appConfig = new AppConfig();
