# Template Microservice

A NestJS-based microservice that provides blockchain token balance and price information via gRPC protocol. This service integrates with multiple blockchain networks and external price feeds to deliver comprehensive balance and pricing data.

## 🚀 Features

- **gRPC Protocol**: High-performance communication using gRPC
- **Elastic APM Integration**: Application performance monitoring
- **Docker Support**: Containerized deployment ready

## 🏗️ Architecture

This microservice is built using:

- **NestJS**: Progressive Node.js framework
- **gRPC**: High-performance RPC framework
- **Ethers.js**: Ethereum library for blockchain interactions
- **TypeScript**: Type-safe development
- **Jest**: Testing framework

## 📋 Prerequisites

- Node.js 24+
- Yarn package manager

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nestjsMicroservice
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=30000
   # Add other environment variables as needed
   ```

## 🚀 Running the Application

### Development Mode

```bash
yarn start:dev
```

### Production Mode

```bash
yarn build
yarn start:prod
```

### Debug Mode

```bash
yarn start:debug
```

## 📡 API Endpoints

### gRPC Services

#### BalanceService

- **getTokenBalance**: Retrieve token balance for a specific wallet address
  - Parameters:
    - `walletAddress`: Wallet address to query
    - `tokenAddress`: Token contract address (use `0x` for native tokens)
    - `chainId`: Blockchain network ID

#### PriceService

- **GetPrice**: Get current price for a token
  - Parameters:
    - `token`: Token address or symbol
    - `source`: Price source identifier

### Example gRPC Client Usage

```typescript
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices'

// Configure gRPC client
const clients = ClientsModule.register([
  {
    name: 'BALANCE_PACKAGE',
    transport: Transport.GRPC,
    options: {
      package: ['balance', 'price'],
      protoPath: [
        'node_modules/@donleeit/protos/proto/balance/service.proto',
        'node_modules/@donleeit/protos/proto/price/service.proto'
      ],
      url: 'localhost:30000'
    }
  }
])

// Use in service
@Injectable()
export class MyService {
  private balanceService: any

  constructor(@Inject('BALANCE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.balanceService = this.client.getService('BalanceService')
  }

  async getBalance(walletAddress: string, tokenAddress: string, chainId: number) {
    return this.balanceService.getTokenBalance({
      walletAddress,
      tokenAddress,
      chainId
    })
  }
}
```

## 🧪 Testing

### Run unit tests

```bash
yarn test
```

### Run e2e tests

```bash
yarn test:e2e
```

### Run test coverage

```bash
yarn test:cov
```

## 📁 Project Structure

```
src/
├── abi/                    # Smart contract ABIs
│   └── ERC20.abi.ts       # ERC-20 token ABI
├── balance/               # Balance service module
│   ├── balance.controller.ts
│   ├── balance.module.ts
│   └── balance.service.ts
├── app.common.ts          # Common utilities
├── app.controller.ts      # Main application controller
├── app.module.ts          # Root application module
├── app.service.ts         # Main application service
├── app.settings.ts        # Application settings
├── apm.ts                 # Elastic APM configuration
└── main.ts               # Application entry point
```

## 🔧 Configuration

### Environment Variables

| Variable | Description      | Default |
| -------- | ---------------- | ------- |
| `PORT`   | gRPC server port | `30000` |

### Supported Blockchain Networks

The service supports multiple blockchain networks through chain IDs:

- Ethereum Mainnet: `1`
- Polygon: `137`
- BSC: `56`
- And more...

## 📊 Monitoring

The service integrates with Elastic APM for performance monitoring. APM configuration is handled in `src/apm.ts`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED license - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

## 🔄 Version History

- **v0.0.1**: Initial release with balance and price services
