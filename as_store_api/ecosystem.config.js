/* eslint-disable @typescript-eslint/camelcase */
module.exports = {
  apps: [
    {
      name: 'asstoreapi',
      script: 'server.js',
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      args: 'one two',
      instances: 4,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      instance_var: 'INSTANCE_ID',
      max_memory_restart: '2G',
      merge_logs: true,
      env: {
        port: 3000,
        NODE_ENV: 'production'
      },
      env_production: {
        port: 3000,
        NODE_ENV: 'production'
      }
    }
  ],

  deploy: {
    production: {
      user: '',
      host: '',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
