module.exports = {
  apps: [
    {
      name: 'etiquetado-backend',
      script: './dist/main.js',
      watch: false, // puedes poner true en desarrollo
      instances: 1, // usa 'max' para cluster mode
      autorestart: true, // reinicia si falla
      // max_restarts: 10, // evita loops infinitos
      restart_delay: 3000, // espera 3 segundos entre reinicios
      min_uptime: 10000, // si dura menos de 10s, cuenta como fallo
      // max_memory_restart: '300M', // reinicia si pasa de 300MB
      env: {
        NODE_ENV: 'production',
        ENVIRONMENT: 'prod',
        NODE_DISABLE_COLORS: 0,
      },
      error_file: './logs/etiquetado-backend-error.log',
      out_file: './logs/etiquetado-backend-out.log',
      // log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};

// Lanzar app:
// pm2 start ecosystem.config.js (lanzamos proceso)
// pm2 save (guardamos estado con el proceso lanzado)
// pm2-startup install (arancamos con el proceso guardado previamente)

// Ver status y listar procesos:
// pm2 list
// pm2 status
// pm2 log

// Parar y borrar app:
// pm2 stop [name]
// pm2 delete [name]
// pm2 save --force (guardamos estado después de borrar, no hay que volver a hacer startup. Si buscamos reiniciar todo, podemos relanzar la app. Yo por si acaso relanzo el install)
// pm2-startup install (arancamos windows con el proceso guardado previamente)
