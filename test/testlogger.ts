import { Logger } from '@nestjs/common'
const logger = new Logger()

function testLogger() {
  console.log('Starting logger test...')

  try {
    const logData = {
      caller: 'TestContext',
      key: 'test-key',
      data: { userId: 123, action: 'login' }
    }
    // Test all log levels
    logger.log('Test info message', logData)

    logger.warn('Test warning message', logData)

    logger.error('Test error message')

    logger.debug('Test debug message', logData)

    logger.verbose('Test verbose message', logData)

    console.log('✅ All logger tests completed successfully!')
  } catch (error) {
    console.error('❌ Logger test failed:', error)
  }
}

// Run the test
testLogger()
