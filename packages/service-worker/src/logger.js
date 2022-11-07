class LoggerHelper {
  info(message){
    console.log(`%c[🔨 ServiceWorker] ${message}`, 'background: #273d3d; color: white')
  }
  success(message){
    console.log(`%c[🔨 ServiceWorker] ${message}`, 'background: green; color: white')
  }
  error(message){
    console.log(`%c[🔨 ServiceWorker] ${message}`, 'background: #b52d34; color: white')
  }
}

export const Logger = new LoggerHelper()