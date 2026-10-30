# Video de presentación

Recorrido de CIRA en formato **Samsung Galaxy S24 Ultra** (1440 × 3120 px, vertical, 30 fps)
para la presentación en clase: `cira-demo-s24ultra.mp4`.

Perfil usado: teléfono **61044195** (PIN `1234`; el mockup acepta cualquier PIN de 4 dígitos).
En el servidor local se ajusta el teléfono del usuario a `6104-4195` para que "Editar perfil" coincida:

```bash
curl -X PUT localhost:3001/api/usuario -H 'content-type: application/json' -d '{"telefono":"6104-4195"}'
```

## Regrabar

```bash
cd server && npm run demo        # compila y sirve la app en http://localhost:3001
node video/grabar.cjs            # requiere playwright y ffmpeg; genera video/cira-demo-s24ultra.mp4
```

Recorrido: inicio de sesión → Explorar trabajos → Trabajadores → Chat → Perfil → Editar perfil.
El mapa se omitió porque las teselas de OpenStreetMap necesitan internet.
