import { inject, Injectable } from '@angular/core'; // NON
import { HttpClient } from '@angular/common/http'; //NON
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // con esto explicaas que es solo una instancia de esta clase para toda la app
})
export class DataService {
  private http = inject(HttpClient); //sirve para recibir las solicitudes del cliente
  //post, get, ..
  // La ruta exacta basada en tus urls.py
  private urlRegister = 'http://localhost:8000/api/users/register/';

  //La funcion creada aqui es para indicar que es aqui donde
  //los componenetes tieneen que enviar las solicitudes --> y se reasignara a al urlRegister
  //con esto mandara y consumira el API necesario de Django o cualquier otro servidor web
  registrarUsuario(datosUsuario: any): Observable<any> {
    // Enviamos el objeto al backend
    return this.http.post(this.urlRegister, datosUsuario);
  }
}

/* importar inject || HttpClient || Observable
 @Injectable({
  ...
 })
 export class DataService {
 ... 2 METODOS{
                http --> recibir solicitudes de cliente
                urlRegister --> coneccion con django
              }
  funcion --> para los componentes (usas Observable)
 }
 * */
