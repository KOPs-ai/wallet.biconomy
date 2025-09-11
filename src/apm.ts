import apm from 'elastic-apm-node'
import { APM_CONNECTION, NODE_ENV, SERVICE_NAME, APM_ENABLE } from './app.settings.js'
// Start Elastic APM
if (APM_ENABLE) {
  apm.start({
    // Required: Name of your service
    serviceName: SERVICE_NAME,
    // APM Server URL (default is http://localhost:8200 if you’re running Elastic locally)
    serverUrl: APM_CONNECTION['ELASTIC_APM_SERVER_URL'],
    // Optional: Set environment (e.g., 'development', 'production')
    environment: NODE_ENV,
    // Optional: Add your Elastic APM secret token if required
    secretToken: APM_CONNECTION['APM_SECRET_TOKEN'] || '',
    instrument: true,
    transactionSampleRate: 1.0,
    logLevel: 'off',
    captureExceptions: false // prevent logging exceptions
  })
  if (apm.isStarted()) {
    console.log('APM agent started (but may not be connected)')
  }
} else {
  console.log('APM agent disabled')
}
