import { Address, ChainInfo, Hash, HexNumber, Transaction } from '@ckb-lumos/base';
import { RPC } from '@ckb-lumos/rpc';
import { AbstractProvider, CkbTypeScript, ResolvedOutpoint } from '@ckit/base';
import { MercuryClient } from '@ckit/mercury-client';
import { asyncSleep, unimplemented } from '../utils';

export class MercuryProvider extends AbstractProvider {
  mercury: MercuryClient;
  rpc: RPC;

  constructor(
    mercuryRpc: MercuryClient | string = 'http://127.0.0.1:8116',
    ckbRpc: RPC | string = 'http://127.0.0.1:8114',
  ) {
    super();

    if (mercuryRpc instanceof MercuryClient) this.mercury = mercuryRpc;
    else this.mercury = new MercuryClient(mercuryRpc);

    if (ckbRpc instanceof RPC) this.rpc = ckbRpc;
    else this.rpc = new RPC(ckbRpc);
  }

  collectCkbLiveCell(_lock: Address, _capacity: HexNumber): Promise<ResolvedOutpoint[]> {
    unimplemented();
  }

  getChainInfo(): Promise<ChainInfo> {
    unimplemented();
  }

  sendTransaction(_tx: Transaction): Promise<Hash> {
    unimplemented();
  }

  collectSudtCell(_lock: Address, _amount: HexNumber): Promise<ResolvedOutpoint[]> {
    unimplemented();
  }

  getUdtBalance(_lock: Address, _udt: CkbTypeScript): Promise<HexNumber> {
    unimplemented();
  }

  getBlockNumber(): Promise<HexNumber> {
    unimplemented();
  }

  async waitForTransactionCommitted(
    txHash: string,
    options: { pollIntervalMs?: number; timeoutMs?: number } = {},
  ): Promise<Transaction | null> {
    const { pollIntervalMs = 3_000, timeoutMs = 60_000 } = options;
    const start = Date.now();

    while (Date.now() - start <= timeoutMs) {
      const tx = await this.rpc.get_transaction(txHash);
      if (tx?.tx_status?.status === 'committed') return tx.transaction;

      await asyncSleep(pollIntervalMs);
    }

    return null;
  }
}
