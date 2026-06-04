import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoTranscurrido',
  standalone: true
})
export class TiempoTranscurridoPipe implements PipeTransform {

  transform(fecha: string): string {

    /* Fecha actual */
    const ahora = new Date();
    /* Fecha del comentario */
    const fechaComentario = new Date(fecha);

    /* Diferencia en timestamp*/
    const diferencia = ahora.getTime() - fechaComentario.getTime();

    /* Conversion */
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    /* Resultado */
    /* El ternario es para separar el plural: 'Hace 1 dia' de 'Hace 4 dias' */



    if (minutos < 1) {
      return 'Hace unos segundos';
    }

    if (minutos < 60) {

      return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    }

    if (horas < 24) {
      return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    }

    if (dias < 30) {
      return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    }

    if (meses < 12) {
      return `Hace ${meses} mes${meses !== 1 ? 'es' : ''}`;
    }

    return `Hace ${años} año${años !== 1 ? 's' : ''}`;

  }

}
